import { GET, PATCH } from '@/app/api/auth/me/route'
import { getCurrentUser, updateUserProfile } from '@/lib/auth-api'

// Mock dependencies
jest.mock('@/lib/auth-api')

describe('/api/auth/me', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    userId: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    phone: '13800138000',
  }

  describe('GET /api/auth/me', () => {
    it('should return current user if authenticated', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/auth/me')
      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual(mockUser)
      expect(getCurrentUser).toHaveBeenCalledWith(request)
    })

    it('should return 401 if not authenticated', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/auth/me')
      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })

    it('should return 500 on error', async () => {
      ;(getCurrentUser as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/auth/me')
      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to get user')
    })
  })

  describe('PATCH /api/auth/me', () => {
    it('should update user profile successfully', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        phone: '13900139000',
      }
      ;(updateUserProfile as jest.Mock).mockResolvedValue(updatedUser)

      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Name',
          phone: '13900139000',
        }),
      })

      const response = await PATCH(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Profile updated successfully')
      expect(data.user.name).toBe('Updated Name')
      expect(data.user.phone).toBe('13900139000')
      expect(updateUserProfile).toHaveBeenCalledWith('test-user-id', {
        name: 'Updated Name',
        phone: '13900139000',
      })
    })

    it('should update only name', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const updatedUser = { ...mockUser, name: 'Updated Name' }
      ;(updateUserProfile as jest.Mock).mockResolvedValue(updatedUser)

      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Name',
        }),
      })

      const response = await PATCH(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.name).toBe('Updated Name')
      expect(updateUserProfile).toHaveBeenCalledWith('test-user-id', {
        name: 'Updated Name',
      })
    })

    it('should return 401 if not authenticated', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })

    it('should return 400 if no fields provided', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({}),
      })

      const response = await PATCH(request as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('At least one field (name or phone) must be provided')
    })

    it('should return 500 on error', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(updateUserProfile as jest.Mock).mockRejectedValue(new Error('Update failed'))

      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request as any)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Update failed')
    })
  })
})
