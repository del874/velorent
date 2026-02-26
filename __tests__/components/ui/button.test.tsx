import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')
  })

  it('applies size styles', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('renders as different element when asChild prop is provided', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )

    expect(screen.getByRole('link')).toHaveTextContent('Link Button')
  })
})
