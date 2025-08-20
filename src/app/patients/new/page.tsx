'use client'

import { Container, Title, Text, Group, Button } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { PatientForm } from '@/components/PatientForm'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

export default function NewPatientPage() {
  const router = useRouter()
  const { userProfile } = useAuth()

  // Redirect if not manager
  if (userProfile?.role !== 'manager') {
    return (
      <ProtectedLayout>
        <Container size="sm">
          <Title order={1} ta="center" mt="xl">
            Access Denied
          </Title>
          <Text ta="center" c="dimmed" mt="md">
            Only managers can add patients.
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

  const handlePatientCreated = (patientId: string) => {
    router.push('/patients')
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
              href="/patients"
            >
              Back to Patients
            </Button>
          </Group>
        </Group>

        <Title order={1} mb="md">
          Add New Patient
        </Title>
        <Text c="dimmed" size="lg" mb="xl">
          Enter patient information and care details
        </Text>

        <PatientForm onPatientCreated={handlePatientCreated} />
      </Container>
    </ProtectedLayout>
  )
}