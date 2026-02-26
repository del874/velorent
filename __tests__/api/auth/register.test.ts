import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs')
jest.mock('@/lib/auth', () => ({
  signToken: jest.fn().mockResolvedValue('mock-token'),
  setToken: jest.fn().mockResolvedValue(undefined),
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    const mockNewUser = {
      id: 'new-user-id',
      email: 'new@example.com',
      name: 'New User',
      password: 'hashed-password',
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockNewUser)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Registration successful')
    expect(data.user.email).toBe('new@example.com')
    expect(data.user).not.toHaveProperty('password')
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'New User',
        email: 'new@example.com',
        password: 'hashed-password',
      },
    })
  })

  it('should return 409 if user already exists', async () => {
    const mockExistingUser = {
      id: 'existing-user-id',
      email: 'existing@example.com',
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('User with this email already exists')
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('should return 400 if missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        // Missing email and password
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name, email, and password are required')
  })

  it('should return 400 if password is too short', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: '12345', // Less than 6 characters
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password must be at least 6 characters long')
  })
})
