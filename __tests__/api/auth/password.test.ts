import { PATCH } from '@/app/api/auth/password/route'
import { getCurrentUser, changePassword } from '@/lib/auth-api'

// Mock dependencies
jest.mock('@/lib/auth-api')

describe('PATCH /api/auth/password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    userId: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  }

  it('should change password successfully', async () => {
    ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
    ;(changePassword as jest.Mock).mockResolvedValue(undefined)

    const request = new Request('http://localhost:3000/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      }),
    })

    const response = await PATCH(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Password changed successfully')
    expect(changePassword).toHaveBeenCalledWith(
      'test-user-id',
      'oldpassword123',
      'newpassword123'
    )
  })

  it('should return 401 if not authenticated', async () => {
    ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      }),
    })

    const response = await PATCH(request as any)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
    expect(changePassword).not.toHaveBeenCalled()
  })

  it('should return 400 if missing passwords', async () => {
    ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

    const request = new Request('http://localhost:3000/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword: 'oldpassword123',
        // Missing newPassword
      }),
    })

    const response = await PATCH(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Old password and new password are required')
  })

  it('should return 400 if new password is too short', async () => {
    ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

    const request = new Request('http://localhost:3000/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword: 'oldpassword123',
        newPassword: '12345', // Less than 6 characters
      }),
    })

    const response = await PATCH(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('New password must be at least 6 characters long')
  })

  it('should return 400 if old password is incorrect', async () => {
    ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
    ;(changePassword as jest.Mock).mockRejectedValue(
      new Error('Incorrect password')
    )

    const request = new Request('http://localhost:3000/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      }),
    })

    const response = await PATCH(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Incorrect password')
  })

  it('should return 500 on other errors', async () => {
    ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
    ;(changePassword as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new Request('http://localhost:3000/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      }),
    })

    const response = await PATCH(request as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database error')
  })
})
