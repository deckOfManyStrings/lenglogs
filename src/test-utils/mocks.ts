import { mockPatients, mockPatient } from './mock-data'

// Mock Supabase responses
export const mockSupabaseSuccess = (data: any) => ({
  data,
  error: null,
})

export const mockSupabaseError = (message: string) => ({
  data: null,
  error: { message },
})

// Common mock implementations
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(mockSupabaseSuccess(mockPatient)),
    // Add more methods as needed
  })),
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
}

// Helper to mock patient queries
export const mockPatientsQuery = (patients = mockPatients) => {
  return jest.fn().mockResolvedValue(mockSupabaseSuccess(patients))
}

export const mockPatientQuery = (patient = mockPatient) => {
  return jest.fn().mockResolvedValue(mockSupabaseSuccess(patient))
}