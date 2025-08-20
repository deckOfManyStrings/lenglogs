'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Loader,
  Center,
  Alert
} from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { PatientForm } from '@/components/PatientForm'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Patient } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import Link from 'next/link'

interface EditPatientPageProps {
  params: {
    id: string
  }
}

export default function EditPatientPage({ params }: EditPatientPageProps) {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not manager
  if (userProfile?.role !== 'manager') {
    return (
      <ProtectedLayout>
        <Container size="sm">
          <Title order={1} ta="center" mt="xl">
            Access Denied
          </Title>
          <Text ta="center" c="dimmed" mt="md">
            Only managers can edit patients.
          </Text>
          <Group justify="center" mt="xl">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              component={Link}
              href="/patients"
            >
              Back to Patients
            </Button>
          </Group>
        </Container>
      </ProtectedLayout>
    )
  }

  const fetchPatient = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      if (!data) throw new Error('Patient not found')

      // Check if user has access to this patient (same facility)
      if (userProfile?.facility_id !== data.facility_id) {
        throw new Error('Access denied: Patient not in your facility')
      }

      setPatient(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientUpdated = (patientId: string) => {
    router.push(`/patients/${patientId}`)
  }

  useEffect(() => {
    fetchPatient()
  }, [params.id, userProfile])

  if (loading) {
    return (
      <ProtectedLayout>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </ProtectedLayout>
    )
  }

  if (error) {
    return (
      <ProtectedLayout>
        <Container size="md">
          <Alert color="red" mb="xl">
            {error}
          </Alert>
          <Group justify="center">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              component={Link}
              href="/patients"
            >
              Back to Patients
            </Button>
          </Group>
        </Container>
      </ProtectedLayout>
    )
  }

  if (!patient) {
    return (
      <ProtectedLayout>
        <Container size="md">
          <Alert color="yellow" mb="xl">
            Patient not found
          </Alert>
          <Group justify="center">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              component={Link}
              href="/patients"
            >
              Back to Patients
            </Button>
          </Group>
        </Container>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <Container size="md">
        {/* Header with back button */}
        <Group justify="space-between" mb="xl">
          <Group>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              component={Link}
              href={`/patients/${patient.id}`}
            >
              Back to Patient Details
            </Button>
          </Group>
        </Group>

        <Title order={1} mb="md">
          Edit Patient: {patient.first_name} {patient.last_name}
        </Title>
        <Text c="dimmed" size="lg" mb="xl">
          Update patient information and care details
        </Text>

        <PatientForm 
          onPatientCreated={handlePatientUpdated}
          initialData={patient}
          isEditing={true}
          patientId={patient.id}
        />
      </Container>
    </ProtectedLayout>
  )
}