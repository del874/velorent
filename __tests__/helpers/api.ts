import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Mock user for testing
export const mockUser = {
  userId: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  phone: '13800138000',
}

// Create a mock request with cookies
export function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: any
    cookies?: Record<string, string>
  } = {}
): NextRequest {
  const { method = 'GET', body, cookies: customCookies } = options

  // Mock cookies
  const mockCookies = customCookies || {}

  jest.mocked(cookies).mockReturnValue({
    get: (name: string) => ({
      value: mockCookies[name],
      name,
    }),
    set: jest.fn(),
    delete: jest.fn(),
  } as any)

  // Create request
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return request
}

// Create authenticated request
export function createAuthenticatedRequest(url: string, options?: Omit<Parameters<typeof createMockRequest>[1], 'cookies'>) {
  return createMockRequest(url, {
    ...options,
    cookies: {
      'auth-token': 'valid-test-token',
    },
  })
}

// Helper to parse JSON response
export async function parseResponse(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return { data: text }
  }
}
