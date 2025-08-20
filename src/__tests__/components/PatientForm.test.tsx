import { screen } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { PatientForm } from '@/components/PatientForm'

// Mock the useAuth hook directly
const mockUseAuth = jest.fn()
jest.mock('@/components/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
      update: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

// Mock Mantine components that might cause issues
jest.mock('@mantine/dates', () => ({
  DateInput: ({ label, ...props }: any) => (
    <input data-testid={`date-input-${label}`} {...props} />
  ),
}))

jest.mock('@mantine/notifications', () => ({
  notifications: { show: jest.fn() },
}))

// Simple wrapper with MantineProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
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
      },
      user: { id: 'test-user-id' },
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

  it('should show Update Patient button when editing', () => {
    const mockPatient = {
      id: 'test-id',
      first_name: 'John',
      last_name: 'Doe',
      facility_id: 'test-facility-id',
      created_by: 'test-user-id',
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }

    render(
      <TestWrapper>
        <PatientForm 
          onPatientCreated={mockOnPatientCreated}
          initialData={mockPatient}
          isEditing={true}
          patientId="test-id"
        />
      </TestWrapper>
    )

    expect(screen.getByRole('button', { name: /update patient/i })).toBeInTheDocument()
  })
})