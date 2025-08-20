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
  Center,
  TextInput,
  Avatar,
  Tooltip
} from '@mantine/core'
import { IconPlus, IconEdit, IconEye, IconTrash, IconSearch, IconPhone, IconUser } from '@tabler/icons-react'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Patient } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import Link from 'next/link'

export default function PatientsPage() {
  const { userProfile } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchPatients = async () => {
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('is_active', true)
        .order('last_name', { ascending: true })

      // If staff member, only show assigned patients (for now, show all - assignment logic will be implemented later)
      if (userProfile?.facility_id) {
        query = query.eq('facility_id', userProfile.facility_id)
      }

      const { data, error } = await query

      if (error) throw error
      setPatients(data || [])
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

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to deactivate this patient?')) return

    try {
      const { error } = await supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', patientId)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: 'Patient deactivated successfully',
        color: 'green',
      })

      fetchPatients()
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    }
  }

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery) ||
    patient.medical_conditions?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  useEffect(() => {
    fetchPatients()
  }, [userProfile])

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
            <Title order={1}>Patient Management</Title>
            <Text c="dimmed" size="lg">
              Manage patient profiles and care information for your facility
            </Text>
          </div>
          {userProfile?.role === 'manager' && (
            <Button
              component={Link}
              href="/patients/new"
              leftSection={<IconPlus size={16} />}
            >
              Add Patient
            </Button>
          )}
        </Group>

        {/* Search Bar */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
          <TextInput
            placeholder="Search patients by name, phone, or medical conditions..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="sm"
          />
        </Card>

        {filteredPatients.length === 0 ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Center>
              <div style={{ textAlign: 'center' }}>
                <IconUser size={48} color="gray" style={{ margin: '0 auto 16px' }} />
                <Title order={3} c="dimmed" mb="md">
                  {searchQuery ? 'No patients found' : 'No patients yet'}
                </Title>
                <Text c="dimmed" mb="xl">
                  {searchQuery 
                    ? 'Try adjusting your search terms.'
                    : userProfile?.role === 'manager' 
                      ? 'Add your first patient to start managing care documentation.'
                      : 'No patients have been added yet. Contact your manager to add patients.'
                  }
                </Text>
                {userProfile?.role === 'manager' && !searchQuery && (
                  <Button
                    component={Link}
                    href="/patients/new"
                    leftSection={<IconPlus size={16} />}
                  >
                    Add Your First Patient
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
                  <Table.Th>Patient</Table.Th>
                  <Table.Th>Age</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Care Level</Table.Th>
                  <Table.Th>Emergency Contact</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredPatients.map((patient) => (
                  <Table.Tr key={patient.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar 
                          size="sm" 
                          radius="xl"
                          color="blue"
                          src={patient.photo_url}
                        >
                          {getInitials(patient.first_name, patient.last_name)}
                        </Avatar>
                        <div>
                          <Text fw={500} size="sm">
                            {patient.first_name} {patient.last_name}
                          </Text>
                          {patient.gender && (
                            <Text size="xs" c="dimmed">
                              {patient.gender}
                            </Text>
                          )}
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {patient.date_of_birth 
                          ? `${calculateAge(patient.date_of_birth)} years`
                          : 'Not specified'
                        }
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {patient.phone && (
                          <Tooltip label={patient.phone}>
                            <ActionIcon variant="subtle" size="sm">
                              <IconPhone size={14} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        <Text size="sm">
                          {patient.phone || 'No phone'}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        color={
                          patient.care_level === 'high' ? 'red' :
                          patient.care_level === 'medium' ? 'yellow' :
                          patient.care_level === 'low' ? 'green' : 'gray'
                        }
                        variant="light"
                        size="sm"
                      >
                        {patient.care_level || 'Not Set'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <Text size="sm" fw={500}>
                          {patient.emergency_contact_name || 'Not specified'}
                        </Text>
                        {patient.emergency_contact_phone && (
                          <Text size="xs" c="dimmed">
                            {patient.emergency_contact_phone}
                          </Text>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="View Patient">
                          <ActionIcon
                            variant="light"
                            component={Link}
                            href={`/patients/${patient.id}`}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        {userProfile?.role === 'manager' && (
                          <>
                            <Tooltip label="Edit Patient">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                component={Link}
                                href={`/patients/${patient.id}/edit`}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Deactivate Patient">
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => handleDeletePatient(patient.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
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

        {/* Quick Stats */}
        {filteredPatients.length > 0 && (
          <Group mt="xl" gap="md">
            <Text size="sm" c="dimmed">
              Showing {filteredPatients.length} of {patients.length} patients
            </Text>
            {userProfile?.role === 'manager' && (
              <Text size="sm" c="dimmed">
                • Total Active: {patients.filter(p => p.is_active).length}
              </Text>
            )}
          </Group>
        )}
      </Container>
    </ProtectedLayout>
  )
}