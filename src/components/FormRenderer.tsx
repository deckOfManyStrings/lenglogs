'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Text,
  Stack,
  Button,
  TextInput,
  Textarea,
  Radio,
  Rating,
  NumberInput,
  Group,
  Title,
  Loader,
  Center,
  Alert
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'
import { supabase, Form, Question } from '@/lib/supabase'
import { useAuth } from './AuthProvider'

interface FormRendererProps {
  formId: string
  onSubmissionComplete?: (submissionId: string) => void
  readonly?: boolean
}

interface FormWithQuestions extends Form {
  questions: Question[]
}

export function FormRenderer({ formId, onSubmissionComplete, readonly = false }: FormRendererProps) {
  const { userProfile } = useAuth()
  const [formData, setFormData] = useState<FormWithQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    initialValues: {},
    validate: {}
  })

  const fetchForm = async () => {
    try {
      setLoading(true)
      
      // Fetch form with questions
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select(`
          *,
          questions (*)
        `)
        .eq('id', formId)
        .eq('is_active', true)
        .single()

      if (formError) throw formError
      if (!formData) throw new Error('Form not found')

      // Sort questions by order
      formData.questions.sort((a, b) => a.order_index - b.order_index)
      
      setFormData(formData)

      // Initialize form values
      const initialValues: Record<string, any> = {}
      const validationRules: Record<string, any> = {}

      formData.questions.forEach((question) => {
        initialValues[question.id] = getDefaultValue(question.question_type)
        
        if (question.required) {
          validationRules[question.id] = (value: any) => {
            if (question.question_type === 'scale' && (value < 1 || value > 10)) {
              return 'Please select a value between 1 and 10'
            }
            if (question.question_type === 'rating' && (value < 1 || value > 5)) {
              return 'Please provide a rating'
            }
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              return 'This field is required'
            }
            return null
          }
        }
      })

      form.setInitialValues(initialValues)
      form.setValues(initialValues)
      form.setValidateInputOnChange(validationRules)
      
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultValue = (questionType: string) => {
    switch (questionType) {
      case 'rating':
        return 0
      case 'scale':
        return 1
      case 'yes_no':
        return ''
      default:
        return ''
    }
  }

  const handleSubmit = async (values: Record<string, any>) => {
    if (!userProfile || !formData) return

    setSubmitting(true)
    try {
      // Create form submission
      const { data: submission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          submitted_by: userProfile.id,
          status: 'completed'
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      // Create answers
      const answers = formData.questions.map((question) => ({
        submission_id: submission.id,
        question_id: question.id,
        answer_value: String(values[question.id] || '')
      }))

      const { error: answersError } = await supabase
        .from('answers')
        .insert(answers)

      if (answersError) throw answersError

      notifications.show({
        title: 'Success',
        message: 'Form submitted successfully!',
        color: 'green',
        icon: <IconCheck size={16} />
      })

      if (onSubmissionComplete) {
        onSubmissionComplete(submission.id)
      }

    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
        icon: <IconAlertCircle size={16} />
      })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchForm()
  }, [formId])

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert color="red" icon={<IconAlertCircle size={16} />}>
        {error}
      </Alert>
    )
  }

  if (!formData) {
    return (
      <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
        Form not found
      </Alert>
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Form Header */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={2}>{formData.title}</Title>
          {formData.description && (
            <Text c="dimmed" mt="sm">
              {formData.description}
            </Text>
          )}
        </Card>

        {/* Questions */}
        {formData.questions.map((question, index) => (
          <Card key={question.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group>
                <Text fw={500}>
                  {index + 1}. {question.question_text}
                </Text>
                {question.required && (
                  <Text c="red" size="sm">*</Text>
                )}
              </Group>

              {/* Render different question types */}
              {question.question_type === 'text' && (
                <TextInput
                  placeholder="Enter your answer..."
                  disabled={readonly}
                  {...form.getInputProps(question.id)}
                />
              )}

              {question.question_type === 'long_text' && (
                <Textarea
                  placeholder="Enter your detailed answer..."
                  rows={4}
                  disabled={readonly}
                  {...form.getInputProps(question.id)}
                />
              )}

              {question.question_type === 'yes_no' && (
                <Radio.Group
                  {...form.getInputProps(question.id)}
                  disabled={readonly}
                >
                  <Group>
                    <Radio value="yes" label="Yes" />
                    <Radio value="no" label="No" />
                  </Group>
                </Radio.Group>
              )}

              {question.question_type === 'multiple_choice' && question.options && (
                <Radio.Group
                  {...form.getInputProps(question.id)}
                  disabled={readonly}
                >
                  <Stack gap="xs">
                    {question.options.map((option, optionIndex) => (
                      <Radio
                        key={optionIndex}
                        value={option}
                        label={option}
                      />
                    ))}
                  </Stack>
                </Radio.Group>
              )}

              {question.question_type === 'rating' && (
                <Group>
                  <Text size="sm" c="dimmed">Rate from 1 to 5 stars:</Text>
                  <Rating
                    {...form.getInputProps(question.id)}
                    readOnly={readonly}
                  />
                </Group>
              )}

              {question.question_type === 'scale' && (
                <Group>
                  <Text size="sm" c="dimmed">Scale 1-10:</Text>
                  <NumberInput
                    min={1}
                    max={10}
                    placeholder="1-10"
                    style={{ width: 100 }}
                    disabled={readonly}
                    {...form.getInputProps(question.id)}
                  />
                </Group>
              )}
            </Stack>
          </Card>
        ))}

        {/* Submit Button */}
        {!readonly && (
          <Group justify="center" mt="xl">
            <Button
              type="submit"
              size="lg"
              loading={submitting}
              disabled={formData.questions.length === 0}
            >
              Submit Form
            </Button>
          </Group>
        )}
      </Stack>
    </form>
  )
}