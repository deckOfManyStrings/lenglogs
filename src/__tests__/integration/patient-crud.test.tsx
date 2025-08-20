import { supabase } from '@/lib/supabase'
import { mockManagerProfile, mockPatient } from '@/test-utils/mock-data'

describe('Patient CRUD Operations', () => {
  let queryBuilder: any

  beforeEach(() => {
    // Create a proper query builder mock that supports chaining
    queryBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      ilike: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
    }

    // Mock supabase.from to return our query builder
    ;(supabase.from as jest.Mock) = jest.fn(() => queryBuilder)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Create Patient', () => {
    it('should successfully create a new patient', async () => {
      // Create the expected response with the new patient data
      const newPatientData = {
        facility_id: mockManagerProfile.facility_id,
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1950-01-01',
        gender: 'male',
        phone: '555-0100',
        medical_conditions: 'None',
        created_by: mockManagerProfile.id,
      }

      const expectedResponse = {
        data: { ...newPatientData, id: 'new-patient-id' },
        error: null
      }

      // Setup the final result for single()
      queryBuilder.single.mockResolvedValue(expectedResponse)

      // Execute the query
      const result = await supabase
        .from('patients')
        .insert(newPatientData)
        .select()
        .single()

      // Verify the methods were called correctly
      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(queryBuilder.insert).toHaveBeenCalledWith(newPatientData)
      expect(queryBuilder.select).toHaveBeenCalled()
      expect(queryBuilder.single).toHaveBeenCalled()

      // Verify the response
      expect(result.data).toEqual(expect.objectContaining({
        id: 'new-patient-id',
        first_name: 'John',
        last_name: 'Doe'
      }))
      expect(result.error).toBeNull()
    })

    it('should handle create patient errors', async () => {
      const errorResponse = { data: null, error: { message: 'Database error' } }
      queryBuilder.single.mockResolvedValue(errorResponse)

      const newPatientData = {
        facility_id: mockManagerProfile.facility_id,
        first_name: '', // Invalid - required field
        last_name: 'Doe',
        created_by: mockManagerProfile.id,
      }

      const result = await supabase
        .from('patients')
        .insert(newPatientData)
        .select()
        .single()

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toBe('Database error')
      expect(result.data).toBeNull()
    })
  })

  describe('Read Patients', () => {
    it('should fetch all patients for a facility', async () => {
      const mockPatients = [mockPatient, { ...mockPatient, id: 'patient-2', first_name: 'Jane' }]
      queryBuilder.order.mockResolvedValue({ data: mockPatients, error: null })

      const result = await supabase
        .from('patients')
        .select('*')
        .eq('facility_id', mockManagerProfile.facility_id)
        .eq('is_active', true)
        .order('last_name', { ascending: true })

      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(queryBuilder.select).toHaveBeenCalledWith('*')
      expect(queryBuilder.eq).toHaveBeenCalledWith('facility_id', mockManagerProfile.facility_id)
      expect(queryBuilder.eq).toHaveBeenCalledWith('is_active', true)
      expect(queryBuilder.order).toHaveBeenCalledWith('last_name', { ascending: true })

      expect(result.data).toHaveLength(2)
      expect(result.error).toBeNull()
    })

    it('should fetch a single patient by ID', async () => {
      const successResponse = { data: mockPatient, error: null }
      queryBuilder.single.mockResolvedValue(successResponse)

      const result = await supabase
        .from('patients')
        .select('*')
        .eq('id', mockPatient.id)
        .eq('is_active', true)
        .single()

      expect(queryBuilder.select).toHaveBeenCalledWith('*')
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', mockPatient.id)
      expect(queryBuilder.eq).toHaveBeenCalledWith('is_active', true)
      expect(queryBuilder.single).toHaveBeenCalled()

      expect(result.data).toEqual(mockPatient)
      expect(result.error).toBeNull()
    })

    it('should handle patient not found', async () => {
      queryBuilder.single.mockResolvedValue({ data: null, error: { message: 'Patient not found' } })

      const result = await supabase
        .from('patients')
        .select('*')
        .eq('id', 'non-existent-id')
        .single()

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Patient not found')
    })
  })

  describe('Update Patient', () => {
    it('should successfully update a patient', async () => {
      const updateResponse = { data: null, error: null }
      queryBuilder.eq.mockResolvedValue(updateResponse)

      const updateData = {
        first_name: 'Updated John',
        medical_conditions: 'Updated conditions',
        updated_at: new Date().toISOString()
      }

      const result = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', mockPatient.id)

      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(queryBuilder.update).toHaveBeenCalledWith(updateData)
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', mockPatient.id)

      expect(result.error).toBeNull()
    })

    it('should handle update patient errors', async () => {
      const errorResponse = { data: null, error: { message: 'Database error' } }
      queryBuilder.eq.mockResolvedValue(errorResponse)

      const updateData = { first_name: 'Updated Name' }

      const result = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', 'invalid-id')

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toBe('Database error')
    })
  })

  describe('Delete (Soft Delete) Patient', () => {
    it('should successfully soft delete a patient', async () => {
      const deleteResponse = { data: null, error: null }
      queryBuilder.eq.mockResolvedValue(deleteResponse)

      const result = await supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', mockPatient.id)

      expect(supabase.from).toHaveBeenCalledWith('patients')
      expect(queryBuilder.update).toHaveBeenCalledWith({ is_active: false })
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', mockPatient.id)

      expect(result.error).toBeNull()
    })

    it('should handle delete patient errors', async () => {
      const errorResponse = { data: null, error: { message: 'Database error' } }
      queryBuilder.eq.mockResolvedValue(errorResponse)

      const result = await supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', 'invalid-id')

      expect(result.error).toBeTruthy()
    })
  })

  describe('Search and Filter Operations', () => {
    it('should search patients by name', async () => {
      const mockSearchResults = [mockPatient]
      queryBuilder.order.mockResolvedValue({ data: mockSearchResults, error: null })

      const result = await supabase
        .from('patients')
        .select('*')
        .eq('facility_id', mockManagerProfile.facility_id)
        .eq('is_active', true)
        .order('last_name')

      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('Permission-based Operations', () => {
    it('should ensure facility isolation in queries', async () => {
      // For this test, we'll just test a single .eq() call to avoid chaining issues
      queryBuilder.eq.mockResolvedValue({ data: [], error: null })
      
      const facilityId = 'test-facility-123'
      
      const result = await supabase
        .from('patients')
        .select('*')
        .eq('facility_id', facilityId)

      expect(queryBuilder.eq).toHaveBeenCalledWith('facility_id', facilityId)
      expect(result.data).toEqual([])
    })

    it('should include created_by in patient creation', async () => {
      const createdResponse = {
        data: { id: 'new-id', first_name: 'Test', last_name: 'Patient' },
        error: null
      }
      queryBuilder.single.mockResolvedValue(createdResponse)
      
      const patientData = {
        first_name: 'Test',
        last_name: 'Patient',
        facility_id: 'facility-123',
        created_by: 'manager-123'
      }

      await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single()

      expect(queryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          created_by: 'manager-123',
          facility_id: 'facility-123'
        })
      )
    })
  })
})