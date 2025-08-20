import { Patient, UserProfile } from '@/lib/supabase'

export const mockManagerProfile: UserProfile = {
  id: 'manager-123',
  user_id: 'user-manager-123',
  email: 'manager@test.com',
  first_name: 'John',
  last_name: 'Manager',
  role: 'manager',
  facility_id: 'facility-123',
  phone: '555-0100',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockStaffProfile: UserProfile = {
  id: 'staff-123',
  user_id: 'user-staff-123',
  email: 'staff@test.com',
  first_name: 'Jane',
  last_name: 'Staff',
  role: 'staff',
  facility_id: 'facility-123',
  phone: '555-0200',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockPatient: Patient = {
  id: 'patient-123',
  facility_id: 'facility-123',
  first_name: 'Alice',
  last_name: 'Johnson',
  date_of_birth: '1950-05-15',
  gender: 'female',
  phone: '555-0300',
  address: '123 Main St, Anytown, ST 12345',
  medical_conditions: 'Diabetes, Hypertension',
  allergies: 'Penicillin, Shellfish',
  medications: 'Metformin 500mg twice daily, Lisinopril 10mg once daily',
  dietary_restrictions: 'Low sodium, diabetic diet',
  emergency_contact_name: 'Bob Johnson',
  emergency_contact_phone: '555-0400',
  emergency_contact_relationship: 'spouse',
  care_level: 'medium',
  mobility_level: 'walker',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'manager-123',
  is_active: true,
  notes: 'Patient prefers morning activities',
  photo_url: null,
}

export const mockPatients: Patient[] = [
  mockPatient,
  {
    ...mockPatient,
    id: 'patient-456',
    first_name: 'Robert',
    last_name: 'Smith',
    date_of_birth: '1945-12-03',
    gender: 'male',
    care_level: 'high',
    mobility_level: 'wheelchair',
  },
]