import { render, screen } from '@testing-library/react'

// Simple test to verify setup works
describe('Test Setup', () => {
  it('should render a simple component', () => {
    render(<div>Hello World</div>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})