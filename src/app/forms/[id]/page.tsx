'use client'

import { Container, Group, Button, Title, Text } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { FormRenderer } from '@/components/FormRenderer'
import Link from 'next/link'

interface FormViewPageProps {
  params: {
    id: string
  }
}

export default function FormViewPage({ params }: FormViewPageProps) {
  const router = useRouter()

  const handleSubmissionComplete = (submissionId: string) => {
    // Redirect back to forms list after successful submission
    router.push('/forms')
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
              href="/forms"
            >
              Back to Forms
            </Button>
          </Group>
        </Group>

        {/* Form Renderer */}
        <FormRenderer
          formId={params.id}
          onSubmissionComplete={handleSubmissionComplete}
        />
      </Container>
    </ProtectedLayout>
  )
}