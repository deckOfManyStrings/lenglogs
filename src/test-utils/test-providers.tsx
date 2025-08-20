import { screen } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { PatientForm } from '@/components/PatientForm'
import { useAuth } from '@/components/AuthProvider'

// Get the mocked useAuth
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Test wrapper with env="test" - this is the key!
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider env="test">{children}</MantineProvider>
)

describe('PatientForm', () => {
  const mockOnPatientCreated = jest.fn()

  beforeEach(() => {
    // Setup mock return value for useAuth
    mockUseAuth.mockReturnValue({
      userProfile: {
        id: 'test-user-id',
        facility_id: 'test-facility-id',
        role: 'manager',
        user_id: 'test-user-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      user: { id: 'test-user-id', email: 'test@example.com' },
      session: null,
      loading: false,
      signOut: jest.fn(),
      refreshProfile: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render basic form fields', () => {
    render(
      <TestWrapper>
        <PatientForm onPatientCreated={mockOnPatientCreated} />
      </TestWrapper>
    )
    
    // Test for some basic fields that should be present
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add patient/i })).toBeInTheDocument()
  })
})