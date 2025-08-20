import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { UserProfile } from '@/lib/supabase'
import { mockManagerProfile, mockStaffProfile } from './mock-data'

// Simple mock auth context
interface MockAuthContextValue {
  user: any
  session: any
  userProfile: UserProfile | null
  loading: boolean
  signOut: jest.Mock
  refreshProfile: jest.Mock
}

const AuthContext = React.createContext<MockAuthContextValue | null>(null)

// Mock useAuth hook
const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Export useAuth for components to use
;(global as any).useAuth = useAuth

interface TestProvidersProps {
  children: React.ReactNode
  userProfile?: UserProfile | null
  loading?: boolean
}

export const TestProviders = ({ 
  children, 
  userProfile = mockManagerProfile,
  loading = false 
}: TestProvidersProps) => {
  const mockValue: MockAuthContextValue = {
    user: userProfile ? { id: userProfile.user_id, email: userProfile.email } : null,
    session: null,
    userProfile,
    loading,
    signOut: jest.fn(),
    refreshProfile: jest.fn(),
  }

  return (
    <AuthContext.Provider value={mockValue}>
      <div data-testid="test-providers">
        {children}
      </div>
    </AuthContext.Provider>
  )
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  userProfile?: UserProfile | null
  loading?: boolean
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { userProfile, loading, ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders userProfile={userProfile} loading={loading}>
      {children}
    </TestProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Helper functions
export const renderAsManager = (ui: React.ReactElement, options?: Omit<CustomRenderOptions, 'userProfile'>) => {
  return renderWithProviders(ui, { ...options, userProfile: mockManagerProfile })
}

export const renderAsStaff = (ui: React.ReactElement, options?: Omit<CustomRenderOptions, 'userProfile'>) => {
  return renderWithProviders(ui, { ...options, userProfile: mockStaffProfile })
}

export const renderAsUnauthenticated = (ui: React.ReactElement, options?: Omit<CustomRenderOptions, 'userProfile'>) => {
  return renderWithProviders(ui, { ...options, userProfile: null })
}