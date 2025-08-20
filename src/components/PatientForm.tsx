'use client'

import { useState } from 'react'
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Group,
  Select,
  Stack,
  Text,
  Grid,
  Divider
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { supabase, Patient } from '@/lib/supabase'
import { useAuth } from './AuthProvider'

interface PatientFormProps {
  onPatientCreated?: (patientId: string) => void
  initialData?: Partial<Patient>
  isEditing?: boolean
  patientId?: string
}

export function PatientForm({ onPatientCreated, initialData, isEditing = false, patientId }: PatientFormProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      date_of_birth: initialData?.date_of_birth ? new Date(initialData.date_of_birth) : null,
      gender: initialData?.gender || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      medical_conditions: initialData?.medical_conditions || '',
      allergies: initialData?.allergies || '',
      medications: initialData?.medications || '',
      dietary_restrictions: initialData?.dietary_restrictions || '',
      emergency_contact_name: initialData?.emergency_contact_name || '',
      emergency_contact_phone: initialData?.emergency_contact_phone || '',
      emergency_contact_relationship: initialData?.emergency_contact_relationship || '',
      care_level: initialData?.care_level || '',
      mobility_level: initialData?.mobility_level || '',
      notes: initialData?.notes || ''
    },
    validate: {
      first_name: (value) => (value.length < 1 ? 'First name is required' : null),
      last_name: (value) => (value.length < 1 ? 'Last name is required' : null),
      emergency_contact_phone: (value) => {
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          return 'Please enter a valid phone number'
        }
        return null
      },
      phone: (value) => {
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          return 'Please enter a valid phone number'
        }
        return null
      }
    }
  })

  const handleSubmit = async (values: typeof form.values) => {
    if (!userProfile) return

    setLoading(true)
    try {
      const patientData = {
        facility_id: userProfile.facility_id,
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth ? values.date_of_birth.toISOString().split('T')[0] : null,
        gender: values.gender || null,
        phone: values.phone || null,
        address: values.address || null,
        medical_conditions: values.medical_conditions || null,
        allergies: values.allergies || null,
        medications: values.medications || null,
        dietary_restrictions: values.dietary_restrictions || null,
        emergency_contact_name: values.emergency_contact_name || null,
        emergency_contact_phone: values.emergency_contact_phone || null,
        emergency_contact_relationship: values.emergency_contact_relationship || null,
        care_level: values.care_level || null,
        mobility_level: values.mobility_level || null,
        notes: values.notes || null,
        created_by: userProfile.id,
        updated_at: new Date().toISOString()
      }

      if (isEditing && patientId) {
        // Update existing patient
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', patientId)

        if (error) throw error

        notifications.show({
          title: 'Success',
          message: 'Patient updated successfully',
          color: 'green',
        })
      } else {
        // Create new patient
        const { data, error } = await supabase
          .from('patients')
          .insert(patientData)
          .select()
          .single()

        if (error) throw error

        notifications.show({
          title: 'Success',
          message: 'Patient added successfully',
          color: 'green',
        })

        if (onPatientCreated) {
          onPatientCreated(data.id)
        }
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ]

  const careLevelOptions = [
    { value: 'low', label: 'Low - Independent' },
    { value: 'medium', label: 'Medium - Some Assistance' },
    { value: 'high', label: 'High - Significant Care Needed' }
  ]

  const mobilityLevelOptions = [
    { value: 'independent', label: 'Independent' },
    { value: 'walker', label: 'Uses Walker' },
    { value: 'wheelchair', label: 'Wheelchair' },
    { value: 'assistance', label: 'Requires Assistance' },
    { value: 'bedbound', label: 'Bedbound' }
  ]

  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'caregiver', label: 'Professional Caregiver' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Basic Information */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} size="lg" mb="md">Basic Information</Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="First Name"
                placeholder="Enter first name"
                required
                {...form.getInputProps('first_name')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Last Name"
                placeholder="Enter last name"
                required
                {...form.getInputProps('last_name')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DateInput
                label="Date of Birth"
                placeholder="Select date of birth"
                valueFormat="MM/DD/YYYY"
                maxDate={new Date()}
                {...form.getInputProps('date_of_birth')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Gender"
                placeholder="Select gender"
                data={genderOptions}
                {...form.getInputProps('gender')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Phone Number"
                placeholder="(555) 123-4567"
                {...form.getInputProps('phone')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Textarea
                label="Address"
                placeholder="Enter full address"
                rows={2}
                {...form.getInputProps('address')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Medical Information */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} size="lg" mb="md">Medical Information</Text>
          <Grid>
            <Grid.Col span={12}>
              <Textarea
                label="Medical Conditions"
                placeholder="List any medical conditions, diagnoses, or health concerns..."
                rows={3}
                {...form.getInputProps('medical_conditions')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Allergies"
                placeholder="List any known allergies (medications, foods, environmental)..."
                rows={2}
                {...form.getInputProps('allergies')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Current Medications"
                placeholder="List all current medications with dosages..."
                rows={3}
                {...form.getInputProps('medications')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Dietary Restrictions"
                placeholder="Any dietary restrictions, preferences, or special diet requirements..."
                rows={2}
                {...form.getInputProps('dietary_restrictions')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Care Information */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} size="lg" mb="md">Care Requirements</Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Care Level"
                placeholder="Select care level needed"
                data={careLevelOptions}
                {...form.getInputProps('care_level')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Mobility Level"
                placeholder="Select mobility status"
                data={mobilityLevelOptions}
                {...form.getInputProps('mobility_level')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Emergency Contact */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} size="lg" mb="md">Emergency Contact</Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Contact Name"
                placeholder="Full name of emergency contact"
                {...form.getInputProps('emergency_contact_name')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Contact Phone"
                placeholder="(555) 123-4567"
                {...form.getInputProps('emergency_contact_phone')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Relationship"
                placeholder="Relationship to patient"
                data={relationshipOptions}
                {...form.getInputProps('emergency_contact_relationship')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Additional Notes */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} size="lg" mb="md">Additional Notes</Text>
          <Textarea
            label="Care Notes"
            placeholder="Any additional information about the patient's care needs, preferences, behaviors, or other important details..."
            rows={4}
            {...form.getInputProps('notes')}
          />
        </Card>

        {/* Submit Button */}
        <Group justify="flex-end" mt="xl">
          <Button
            type="submit"
            loading={loading}
            size="lg"
          >
            {isEditing ? 'Update Patient' : 'Add Patient'}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}