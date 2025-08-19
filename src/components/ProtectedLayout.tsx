'use client'

import { ReactNode } from 'react'
import {
  AppShell,
  Header,
  Title,
  Group,
  Button,
  Text,
  Badge,
  Menu,
  Avatar,
  UnstyledButton,
  Flex,
  Loader,
  Center
} from '@mantine/core'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { AuthComponent } from './AuthComponent'

interface ProtectedLayoutProps {
  children: ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, userProfile, loading, signOut } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    )
  }

  // Show login page if not authenticated
  if (!user || !userProfile) {
    return <AuthComponent />
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <AppShell
      header={{ height: 70 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          {/* Logo and Navigation */}
          <Group>
            <Group>
              <Title order={2} c="blue">
                LengLogs
              </Title>
              <Text size="sm" c="dimmed">
                Adult Day Care Management
              </Text>
            </Group>
            
            {/* Navigation Links */}
            <Group ml="xl" gap="md">
              <Button
                variant="subtle"
                component={Link}
                href="/"
                size="sm"
              >
                Dashboard
              </Button>
              <Button
                variant="subtle"
                component={Link}
                href="/forms"
                size="sm"
              >
                Forms
              </Button>
              {userProfile?.role === 'manager' && (
                <>
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled
                  >
                    Staff (Soon)
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled
                  >
                    Reports (Soon)
                  </Button>
                </>
              )}
            </Group>
          </Group>

          {/* User Profile and Actions */}
          <Group>
            {/* User Info */}
            <Group gap="xs">
              <Text size="sm" fw={500}>
                {userProfile.first_name} {userProfile.last_name}
              </Text>
              <Badge 
                color={userProfile.role === 'manager' ? 'blue' : 'green'}
                variant="light"
                size="sm"
              >
                {userProfile.role}
              </Badge>
            </Group>

            {/* User Menu */}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Avatar 
                    size="sm" 
                    radius="xl"
                    color="blue"
                  >
                    {userProfile.first_name[0]}{userProfile.last_name[0]}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item>
                  <Text size="sm">
                    {userProfile.email}
                  </Text>
                </Menu.Item>
                
                {userProfile.facility_id && (
                  <Menu.Item>
                    <Text size="sm" c="dimmed">
                      Facility ID: {userProfile.facility_id.slice(0, 8)}...
                    </Text>
                  </Menu.Item>
                )}

                <Menu.Divider />
                
                <Menu.Item 
                  color="red"
                  onClick={handleSignOut}
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}