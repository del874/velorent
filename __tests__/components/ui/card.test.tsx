import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

describe('Card Components', () => {
  it('renders card with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    )

    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders card with header and title', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card content</CardContent>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Card className="custom-class">
        <CardContent>Content</CardContent>
      </Card>
    )

    const card = screen.getByText('Content').closest('.custom-class')
    expect(card).toBeInTheDocument()
  })

  it('renders multiple cards', () => {
    render(
      <>
        <Card>
          <CardContent>Card 1</CardContent>
        </Card>
        <Card>
          <CardContent>Card 2</CardContent>
        </Card>
      </>
    )

    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
  })
})
