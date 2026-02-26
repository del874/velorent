import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/auth-context'

// Mock fetch
global.fetch = jest.fn()

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('AuthProvider Context', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('provides initial user state as null', () => {
    const TestComponent = () => {
      const { user, loading } = useAuth()
      return (
        <div>
          <span data-testid="loading">{String(loading)}</span>
          <span data-testid="user">{user ? 'logged-in' : 'logged-out'}</span>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('logged-out')
  })

  it('fetches user on mount', async () => {
    const mockUser = {
      userId: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    })

    const TestComponent = () => {
      const { user, loading } = useAuth()
      return (
        <div>
          <span data-testid="loading">{String(loading)}</span>
          <span data-testid="user">{user ? 'logged-in' : 'logged-out'}</span>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Should be loading initially
    expect(screen.getByTestId('loading')).toHaveTextContent('true')

    // Wait for fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
  })

  it('handles login successfully', async () => {
    const mockUser = {
      userId: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    })

    const TestComponent = () => {
      const { user, login } = useAuth()
      const handleLogin = async () => {
        await login('test@example.com', 'password123')
      }

      return (
        <div>
          <span data-testid="user">{user ? 'logged-in' : 'logged-out'}</span>
          <button onClick={handleLogin} data-testid="login-btn">
            Login
          </button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      await screen.findByTestId('login-btn').click()
    })

    expect(screen.getByTestId('user')).toHaveTextContent('logged-in')
  })

  it('handles logout', async () => {
    const mockUser = {
      userId: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    }

    // Initial login
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    })

    const TestComponent = () => {
      const { user, logout } = useAuth()
      const handleLogout = async () => {
        await logout()
      }

      return (
        <div>
          <span data-testid="user">{user ? 'logged-in' : 'logged-out'}</span>
          <button onClick={handleLogout} data-testid="logout-btn">
            Logout
          </button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('logged-in')
    })

    // Logout
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    })

    await act(async () => {
      await screen.findByTestId('logout-btn').click()
    })

    expect(screen.getByTestId('user')).toHaveTextContent('logged-out')
  })
})
