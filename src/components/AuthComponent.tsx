'use client'

import { useState } from 'react'
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Container,
  Select,
  Group,
  Alert
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'

interface AuthFormData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: 'manager' | 'staff'
  phone?: string
}

export function AuthComponent() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const form = useForm<AuthFormData>({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'staff',
      phone: ''
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      firstName: (value) => (!isLogin && !value ? 'First name is required' : null),
      lastName: (value) => (!isLogin && !value ? 'Last name is required' : null),
    },
  })

  const createFacilityForManager = async (firstName: string, lastName: string, userId: string) => {
  try {
    console.log('🏥 Creating facility for:', firstName, lastName, 'User ID:', userId)
    
    // Create facility with a nice default name
    const facilityName = `${firstName} ${lastName}'s Adult Day Care`
    
    const { data: facility, error: facilityError } = await supabase
      .from('facilities')
      .insert({
        name: facilityName,
        created_by: userId
      })
      .select()
      .single()

    console.log('🔍 Facility creation result:', { facility, facilityError })

    if (facilityError) {
      console.error('❌ Facility creation error details:', facilityError)
      throw facilityError
    }

    console.log('✅ Created facility:', facility.name, 'ID:', facility.id)
    return facility
  } catch (error: any) {
    console.error('❌ Error creating facility:', error)
    throw error
  }
}
  const handleSubmit = async (values: AuthFormData) => {
    setLoading(true)

    try {
      if (isLogin) {
        // Sign in (unchanged)
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })

        if (error) throw error

        notifications.show({
          title: 'Success',
          message: 'Signed in successfully!',
          color: 'green',
        })
      } else {
        // Sign up with auto-facility creation
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              first_name: values.firstName,
              last_name: values.lastName,
              role: values.role,
              phone: values.phone,
            },
          },
        })

        if (signUpError) throw signUpError

        // If manager, create facility after successful signup
        if (values.role === 'manager' && authData.user) {
          try {
            const facility = await createFacilityForManager(
              values.firstName!, 
              values.lastName!, 
              authData.user.id
            )

            notifications.show({
              title: 'Success',
              message: `Account and facility "${facility.name}" created successfully! Please check your email to verify your account.`,
              color: 'green',
            })
          } catch (facilityError: any) {
            // User was created but facility creation failed
            notifications.show({
              title: 'Partial Success',
              message: 'Account created but there was an issue creating your facility. Contact support for assistance.',
              color: 'yellow',
            })
          }
        } else {
          notifications.show({
            title: 'Success',
            message: 'Account created successfully! Please check your email to verify your account.',
            color: 'green',
          })
        }
      }
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

  return (
    <Container size={420} my={40}>
      <Title ta="center" c="blue">
        LengLogs
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Adult Day Care Management System
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2} ta="center" mb="md">
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          {!isLogin && (
            <>
              <Group grow mb="md">
                <TextInput
                  label="First Name"
                  placeholder="Your first name"
                  required
                  {...form.getInputProps('firstName')}
                />
                <TextInput
                  label="Last Name"
                  placeholder="Your last name"
                  required
                  {...form.getInputProps('lastName')}
                />
              </Group>

              <Select
                label="Role"
                placeholder="Select your role"
                data={[
                  { value: 'staff', label: 'Staff Member' },
                  { value: 'manager', label: 'Manager' },
                ]}
                required
                mb="md"
                {...form.getInputProps('role')}
              />

              <TextInput
                label="Phone (Optional)"
                placeholder="Your phone number"
                mb="md"
                {...form.getInputProps('phone')}
              />
            </>
          )}

          <TextInput
            label="Email"
            placeholder="hello@gmail.com"
            required
            mb="md"
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mb="md"
            {...form.getInputProps('password')}
          />

          {!isLogin && (
            <Alert color="blue" mb="md">
              <Text size="sm">
                {form.values.role === 'manager' 
                  ? 'A facility will be automatically created for you to manage.'
                  : 'After creating your account, a manager will need to assign you to a facility.'
                }
              </Text>
            </Alert>
          )}

          <Button fullWidth mt="xl" type="submit" loading={loading}>
            {isLogin ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt={15}>
          {isLogin ? "Don't have an account yet? " : 'Already have an account? '}
          <Anchor
            size="sm"
            component="button"
            onClick={() => {
              setIsLogin(!isLogin)
              form.reset()
            }}
          >
            {isLogin ? 'Create account' : 'Sign in'}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  )
}