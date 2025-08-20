import { screen } from '@testing-library/react'
import { renderAsManager, renderAsStaff, renderAsUnauthenticated } from '@/test-utils/test-providers'

// Simple component to test our utilities
const TestComponent = () => {
  return <div>Test Component</div>
}

describe('Test Utilities', () => {
  it('should render with manager profile', () => {
    renderAsManager(<TestComponent />)
    expect(screen.getByText('Test Component')).toBeInTheDocument()
    expect(screen.getByTestId('test-providers')).toBeInTheDocument()
  })

  it('should render with staff profile', () => {
    renderAsStaff(<TestComponent />)
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('should render as unauthenticated', () => {
    renderAsUnauthenticated(<TestComponent />)
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })
})