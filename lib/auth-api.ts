import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { signToken, verifyToken, setToken, removeToken, JWTPayload } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Register new user
export async function register(name: string, email: string, password: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Create token
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name || '',
  });

  // Set cookie
  await setToken(token);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Login user
export async function login(email: string, password: string) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password || '');

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Create token
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name || '',
  });

  // Set cookie
  await setToken(token);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Logout user
export async function logout() {
  await removeToken();
}

// Get current user
export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    // Return user data with userId matching the JWT payload format
    return {
      userId: user.id,
      email: user.email,
      name: user.name || '',
      phone: user.phone,
    };
  } catch (error) {
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, data: { name?: string; phone?: string }) {
  // Update user
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
    },
  });

  return user;
}

// Change password
export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify old password
  if (!user.password) {
    throw new Error('Password not set');
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    throw new Error('Incorrect password');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });
}

// Helper to get cookies
async function cookies() {
  const { cookies } = await import('next/headers');
  return cookies();
}
