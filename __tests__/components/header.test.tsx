import { render, screen } from '@testing-library/react'
import { Header } from '@/components/header'
import { useAuth } from '@/context/auth-context'

// Mock the auth context
jest.mock('@/context/auth-context')

describe('Header Component', () => {
  it('renders header with navigation links', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    })

    render(<Header />)

    // Check logo
    expect(screen.getByText('🚴')).toBeInTheDocument()
    expect(screen.getByText('VeloRent')).toBeInTheDocument()

    // Check navigation links
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('车型列表')).toBeInTheDocument()
    expect(screen.getByText('如何运作')).toBeInTheDocument()
    expect(screen.getByText('价格方案')).toBeInTheDocument()
  })

  it('renders login and register buttons when not logged in', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    })

    render(<Header />)

    expect(screen.getByText('注册')).toBeInTheDocument()
    expect(screen.getByText('登录')).toBeInTheDocument()
  })

  it('renders user dropdown when logged in', () => {
    const mockUser = {
      userId: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    }

    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    })

    render(<Header />)

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('个人中心')).toBeInTheDocument()
    expect(screen.getByText('我的预订')).toBeInTheDocument()
    expect(screen.getByText('退出登录')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    })

    render(<Header />)

    // Should show loading skeleton
    const skeleton = screen.getByRole('button', { hidden: true })
    expect(skeleton).toBeInTheDocument()
  })
})
