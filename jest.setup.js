// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.DATABASE_URL = 'file:./dev.db'
process.env.JWT_SECRET = 'test-secret-key'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: () => 'https://via.placeholder.com/150',
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
})

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
