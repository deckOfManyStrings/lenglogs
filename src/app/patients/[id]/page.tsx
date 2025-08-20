'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Group,
  Button,
  Card,
  Text,
  Badge,
  Grid,
  Avatar,
  Divider,
  Stack,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Alert
} from '@mantine/core'
import {
  IconArrowLeft,
  IconEdit,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCalendar,
  IconUser,
  IconHeart,
  IconPill,
  IconAlertTriangle,
  IconNotes,
  IconWheelchair
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useAuth } from '@/components/AuthProvider'
import { supabase, Patient } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import Link from 'next/link'

interface PatientDetailPageProps {
  params: {
    id: string
  }
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCareLevelColor = (level?: string) => {
    switch (level) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
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
      <Container size="xl">
        {/* Header */}
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
          {userProfile?.role === 'manager' && (
            <Button
              leftSection={<IconEdit size={16} />}
              component={Link}
              href={`/patients/${patient.id}/edit`}
            >
              Edit Patient
            </Button>
          )}
        </Group>

        {/* Patient Header Card */}
        <Card shadow="sm" padding="xl" radius="md" withBorder mb="lg">
          <Group justify="space-between" wrap="nowrap">
            <Group>
              <Avatar 
                size="xl" 
                radius="xl"
                color="blue"
                src={patient.photo_url}
              >
                {getInitials(patient.first_name, patient.last_name)}
              </Avatar>
              <div>
                <Title order={1}>
                  {patient.first_name} {patient.last_name}
                </Title>
                <Group gap="xs" mt="xs">
                  {patient.date_of_birth && (
                    <Text c="dimmed">
                      Age {calculateAge(patient.date_of_birth)}
                    </Text>
                  )}
                  {patient.gender && (
                    <>
                      <Text c="dimmed">•</Text>
                      <Text c="dimmed" tt="capitalize">
                        {patient.gender.replace('_', ' ')}
                      </Text>
                    </>
                  )}
                </Group>
                <Group gap="xs" mt="xs">
                  <Badge
                    color={getCareLevelColor(patient.care_level)}
                    variant="light"
                  >
                    {patient.care_level ? `${patient.care_level} Care` : 'Care Level Not Set'}
                  </Badge>
                  {patient.mobility_level && (
                    <Badge color="blue" variant="outline">
                      {patient.mobility_level.replace('_', ' ')}
                    </Badge>
                  )}
                </Group>
              </div>
            </Group>
          </Group>
        </Card>

        <Grid>
          {/* Contact Information */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Group mb="md">
                <IconUser size={20} />
                <Text fw={500} size="lg">Contact Information</Text>
              </Group>
              <Stack gap="md">
                {patient.phone && (
                  <Group>
                    <IconPhone size={16} color="gray" />
                    <div>
                      <Text size="sm" c="dimmed">Phone</Text>
                      <Text>{patient.phone}</Text>
                    </div>
                  </Group>
                )}
                {patient.address && (
                  <Group align="flex-start">
                    <IconMapPin size={16} color="gray" style={{ marginTop: 4 }} />
                    <div>
                      <Text size="sm" c="dimmed">Address</Text>
                      <Text>{patient.address}</Text>
                    </div>
                  </Group>
                )}
                {patient.date_of_birth && (
                  <Group>
                    <IconCalendar size={16} color="gray" />
                    <div>
                      <Text size="sm" c="dimmed">Date of Birth</Text>
                      <Text>{formatDate(patient.date_of_birth)}</Text>
                    </div>
                  </Group>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Emergency Contact */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Group mb="md">
                <IconAlertTriangle size={20} />
                <Text fw={500} size="lg">Emergency Contact</Text>
              </Group>
              <Stack gap="md">
                {patient.emergency_contact_name ? (
                  <>
                    <div>
                      <Text size="sm" c="dimmed">Name</Text>
                      <Text fw={500}>{patient.emergency_contact_name}</Text>
                    </div>
                    {patient.emergency_contact_phone && (
                      <div>
                        <Text size="sm" c="dimmed">Phone</Text>
                        <Text>{patient.emergency_contact_phone}</Text>
                      </div>
                    )}
                    {patient.emergency_contact_relationship && (
                      <div>
                        <Text size="sm" c="dimmed">Relationship</Text>
                        <Text tt="capitalize">
                          {patient.emergency_contact_relationship.replace('_', ' ')}
                        </Text>
                      </div>
                    )}
                  </>
                ) : (
                  <Text c="dimmed" fs="italic">No emergency contact information on file</Text>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Medical Conditions */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Group mb="md">
                <IconHeart size={20} />
                <Text fw={500} size="lg">Medical Conditions</Text>
              </Group>
              <Text style={{ whiteSpace: 'pre-wrap' }}>
                {patient.medical_conditions || 'No medical conditions listed'}
              </Text>
            </Card>
          </Grid.Col>

          {/* Allergies */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Group mb="md">
                <IconAlertTriangle size={20} color="orange" />
                <Text fw={500} size="lg">Allergies</Text>
              </Group>
              <Text style={{ whiteSpace: 'pre-wrap' }}>
                {patient.allergies || 'No known allergies'}
              </Text>
            </Card>
          </Grid.Col>

          {/* Medications */}
          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconPill size={20} />
                <Text fw={500} size="lg">Current Medications</Text>
              </Group>
              <Text style={{ whiteSpace: 'pre-wrap' }}>
                {patient.medications || 'No medications listed'}
              </Text>
            </Card>
          </Grid.Col>

          {/* Dietary Restrictions */}
          {patient.dietary_restrictions && (
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <IconNotes size={20} />
                  <Text fw={500} size="lg">Dietary Restrictions</Text>
                </Group>
                <Text style={{ whiteSpace: 'pre-wrap' }}>
                  {patient.dietary_restrictions}
                </Text>
              </Card>
            </Grid.Col>
          )}

          {/* Care Notes */}
          {patient.notes && (
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <IconNotes size={20} />
                  <Text fw={500} size="lg">Care Notes</Text>
                </Group>
                <Text style={{ whiteSpace: 'pre-wrap' }}>
                  {patient.notes}
                </Text>
              </Card>
            </Grid.Col>
          )}
        </Grid>

        {/* Record Information */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="lg">
          <Text fw={500} size="sm" c="dimmed" mb="xs">Record Information</Text>
          <Group gap="xl">
            <Text size="sm" c="dimmed">
              Created: {formatDate(patient.created_at)}
            </Text>
            <Text size="sm" c="dimmed">
              Last Updated: {formatDate(patient.updated_at)}
            </Text>
            <Text size="sm" c="dimmed">
              Patient ID: {patient.id.slice(0, 8)}...
            </Text>
          </Group>
        </Card>
      </Container>
    </ProtectedLayout>
  )
}