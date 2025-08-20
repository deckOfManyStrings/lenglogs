'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Group,
  Button,
  Table,
  Card,
  Text,
  Badge,
  ActionIcon,
  Loader,
  Center
} from '@mantine/core'
import { IconPlus, IconEdit, IconEye, IconTrash } from '@tabler/icons-react'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Form } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import Link from 'next/link'

export default function FormsPage() {
  const { userProfile } = useAuth()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setForms(data || [])
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

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return

    try {
      const { error } = await supabase
        .from('forms')
        .update({ is_active: false })
        .eq('id', formId)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: 'Form deleted successfully',
        color: 'green',
      })

      fetchForms()
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    }
  }

  useEffect(() => {
    fetchForms()
  }, [])

  if (loading) {
    return (
      <ProtectedLayout>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <Container size="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={1}>Form Management</Title>
            <Text c="dimmed" size="lg">
              Create and manage assessment forms for your facility
            </Text>
          </div>
          {userProfile?.role === 'manager' && (
            <Button
              component={Link}
              href="/forms/new"
              leftSection={<IconPlus size={16} />}
            >
              Create Form
            </Button>
          )}
        </Group>

        {forms.length === 0 ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Center>
              <div style={{ textAlign: 'center' }}>
                <Title order={3} c="dimmed" mb="md">
                  No forms yet
                </Title>
                <Text c="dimmed" mb="xl">
                  {userProfile?.role === 'manager' 
                    ? 'Create your first form to start collecting data from your staff.'
                    : 'No forms have been created yet. Contact your manager to create forms.'
                  }
                </Text>
                {userProfile?.role === 'manager' && (
                  <Button
                    component={Link}
                    href="/forms/new"
                    leftSection={<IconPlus size={16} />}
                  >
                    Create Your First Form
                  </Button>
                )}
              </div>
            </Center>
          </Card>
        ) : (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Form Title</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {forms.map((form) => (
                  <Table.Tr key={form.id}>
                    <Table.Td>
                      <Text fw={500}>{form.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {form.description || 'No description'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {new Date(form.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="green" variant="light">
                        Active
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          component={Link}
                          href={`/forms/${form.id}`}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        {userProfile?.role === 'manager' && (
                          <>
                            <ActionIcon
                              variant="light"
                              color="blue"
                              component={Link}
                              href={`/forms/${form.id}/edit`}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => handleDeleteForm(form.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}
      </Container>
    </ProtectedLayout>
  )
}