'use client'

import { Container, Title, Text } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { FormBuilder } from '@/components/FormBuilder'
import { useAuth } from '@/components/AuthProvider'

export default function NewFormPage() {
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
            Only managers can create forms.
          </Text>
        </Container>
      </ProtectedLayout>
    )
  }

  const handleFormCreated = (formId: string) => {
    router.push('/forms')
  }

  return (
    <ProtectedLayout>
      <Container size="xl">
        <Title order={1} mb="md">
          Create New Form
        </Title>
        <Text c="dimmed" size="lg" mb="xl">
          Build a custom form for your staff to complete
        </Text>

        <FormBuilder onFormCreated={handleFormCreated} />
      </Container>
    </ProtectedLayout>
  )
}