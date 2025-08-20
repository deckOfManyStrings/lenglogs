"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Button,
  Badge,
  Group,
  Loader,
} from "@mantine/core";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalForms: 0,
    submissionsToday: 0,
    totalPatients: 0,
    totalStaff: 1, // Current user
    loading: true,
  });

  const fetchStats = async () => {
  if (!userProfile) {
    console.log('❌ No userProfile found');
    return;
  }

  console.log('🔍 fetchStats running for user:', userProfile.first_name);
  console.log('🏥 User facility_id:', userProfile.facility_id);
  console.log('👤 Full userProfile:', userProfile);

  try {
    // Test the patients query specifically
    console.log('🔍 Testing patients query...');
    const { count: patientsCount, error: patientsError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("facility_id", userProfile.facility_id)
      .eq("is_active", true);

    console.log('👥 Patients query result:', { 
      count: patientsCount, 
      error: patientsError,
      facility_id_used: userProfile.facility_id
    });

    // Also test without facility_id to see total patients
    const { count: allPatientsCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    console.log('📊 All patients (no facility filter):', allPatientsCount);

    // Rest of your existing code...
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
  }
};

  useEffect(() => {
    fetchStats();
  }, [userProfile]);

  return (
    <ProtectedLayout>
      <Container size="xl">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={1}>Welcome back, {userProfile?.first_name}!</Title>
            <Text c="dimmed" size="lg">
              {userProfile?.role === "manager"
                ? "Manage your facility and staff"
                : "View your daily tasks and assignments"}
            </Text>
          </div>
          <Badge
            size="lg"
            color={userProfile?.role === "manager" ? "blue" : "green"}
          >
            {userProfile?.role === "manager"
              ? "Manager Dashboard"
              : "Staff Dashboard"}
          </Badge>
        </Group>

        <Grid>
          {/* Manager Features */}
          {userProfile?.role === "manager" && (
            <>
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>Form Management</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      Create and manage assessment forms for your facility
                    </Text>
                  </Card.Section>
                  <Button
                    variant="light"
                    fullWidth
                    mt="md"
                    component={Link}
                    href="/forms"
                  >
                    Manage Forms
                  </Button>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>Patient Management</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      Manage patient profiles and care information
                    </Text>
                  </Card.Section>
                  <Button
                    variant="light"
                    fullWidth
                    mt="md"
                    component={Link}
                    href="/patients"
                  >
                    Manage Patients
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
                  <Button variant="light" fullWidth mt="md" disabled>
                    View Reports (Coming Soon)
                  </Button>
                </Card>
              </Grid.Col>
            </>
          )}

          {/* Staff Features */}
          {userProfile?.role === "staff" && (
            <>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>My Patients</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      View assigned patients and care information
                    </Text>
                  </Card.Section>
                  <Button
                    variant="light"
                    fullWidth
                    mt="md"
                    component={Link}
                    href="/patients"
                  >
                    View Patients
                  </Button>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>Daily Tasks</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      View your assigned forms and tasks for today
                    </Text>
                  </Card.Section>
                  <Button
                    variant="light"
                    fullWidth
                    mt="md"
                    component={Link}
                    href="/forms"
                  >
                    View Forms
                  </Button>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Title order={3}>Care Documentation</Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      Complete daily care documentation and assessments
                    </Text>
                  </Card.Section>
                  <Button variant="light" fullWidth mt="md" disabled>
                    Care Tasks (Coming Soon)
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
        <Title order={2} mt="xl" mb="md">
          Quick Overview
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text ta="center" fw={500} c="dimmed">
                Forms Created
              </Text>
              {stats.loading ? (
                <Loader size="sm" mx="auto" mt="xs" />
              ) : (
                <Text ta="center" size="xl" fw={700}>
                  {stats.totalForms}
                </Text>
              )}
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text ta="center" fw={500} c="dimmed">
                Submissions Today
              </Text>
              {stats.loading ? (
                <Loader size="sm" mx="auto" mt="xs" />
              ) : (
                <Text ta="center" size="xl" fw={700}>
                  {stats.submissionsToday}
                </Text>
              )}
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text ta="center" fw={500} c="dimmed">
                Total Patients
              </Text>
              {stats.loading ? (
                <Loader size="sm" mx="auto" mt="xs" />
              ) : (
                <Text ta="center" size="xl" fw={700}>
                  {stats.totalPatients}
                </Text>
              )}
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text ta="center" fw={500} c="dimmed">
                Active Staff
              </Text>
              {stats.loading ? (
                <Loader size="sm" mx="auto" mt="xs" />
              ) : (
                <Text ta="center" size="xl" fw={700}>
                  {stats.totalStaff}
                </Text>
              )}
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Actions for Managers */}
        {userProfile?.role === "manager" && (
          <>
            <Title order={2} mt="xl" mb="md">
              Quick Actions
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Add New Patient</Text>
                      <Text size="sm" c="dimmed">
                        Register a new patient
                      </Text>
                    </div>
                    <Button size="sm" component={Link} href="/patients/new">
                      Add
                    </Button>
                  </Group>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Create New Form</Text>
                      <Text size="sm" c="dimmed">
                        Build assessment form
                      </Text>
                    </div>
                    <Button size="sm" component={Link} href="/forms/new">
                      Create
                    </Button>
                  </Group>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>View All Patients</Text>
                      <Text size="sm" c="dimmed">
                        Manage patient records
                      </Text>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      component={Link}
                      href="/patients"
                    >
                      View
                    </Button>
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Container>
    </ProtectedLayout>
  );
}
