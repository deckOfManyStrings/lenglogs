'use client'

import { Container, Title, Text, Grid, Card, Button, Badge, Group } from '@mantine/core'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useAuth } from '@/components/AuthProvider'

export default function Dashboard() {
  const { userProfile } = useAuth()

  return (
    <ProtectedLayout>
      <Container size="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={1}>
              Welcome back, {userProfile?.first_name}!
            </Title>
            <Text c="dimmed" size="lg">
              {userProfile?.role === 'manager' ? 'Manage your facility and staff' : 'View your daily tasks and assignments'}
            </Text>
          </div>
          <Badge size="lg" color={userProfile?.role === 'manager' ? 'blue' : 'green'}>
            {userProfile?.role === 'manager' ? 'Manager Dashboard' : 'Staff Dashboard'}
          </Badge>
        </Group>

        <Grid>
          {/* Manager Features */}
          {userProfile?.role === 'manager' && (
            <>
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>Form Management</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      Create and manage assessment forms for your facility
                    </Text>
                  </Card.Section>
                  <Button variant="light" fullWidth mt="md">
                    Manage Forms
                  </Button>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>Staff Management</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      Manage staff assignments and permissions
                    </Text>
                  </Card.Section>
                  <Button variant="light" fullWidth mt="md" disabled>
                    Manage Staff (Coming Soon)
                  </Button>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>Reports & Analytics</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      View form submissions and generate reports
                    </Text>
                  </Card.Section>
                  <Button variant="light" fullWidth mt="md">
                    View Reports
                  </Button>
                </Card>
              </Grid.Col>
            </>
          )}

          {/* Staff Features */}
          {userProfile?.role === 'staff' && (
            <>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>Daily Tasks</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      View your assigned forms and tasks for today
                    </Text>
                  </Card.Section>
                  <Button variant="light" fullWidth mt="md" disabled>
                    View Tasks (Coming Soon)
                  </Button>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>Patient Care</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      Access patient information and care plans
                    </Text>
                  </Card.Section>
                  <Button variant="light" fullWidth mt="md" disabled>
                    Patient Care (Coming Soon)
                  </Button>
                </Card>
              </Grid.Col>
            </>
          )}

          {/* Shared Features */}
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section p="md">
                <Title order={3}>Profile Settings</Title>
                <Text size="sm" c="dimmed" mt="xs">
                  Update your personal information and preferences
                </Text>
              </Card.Section>
              <Button variant="light" fullWidth mt="md" disabled>
                Edit Profile (Coming Soon)
              </Button>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Stats */}
        <Title order={2} mt="xl" mb="md">Quick Overview</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text ta="center" fw={500} c="dimmed">Forms Created</Text>
              <Text ta="center" size="xl" fw={700}>0</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text ta="center" fw={500} c="dimmed">Submissions Today</Text>
              <Text ta="center" size="xl" fw={700}>0</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text ta="center" fw={500} c="dimmed">Active Staff</Text>
              <Text ta="center" size="xl" fw={700}>1</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text ta="center" fw={500} c="dimmed">Patients</Text>
              <Text ta="center" size="xl" fw={700}>0</Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </ProtectedLayout>
  )
}