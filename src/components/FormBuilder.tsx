'use client'

import { useState } from 'react'
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Group,
  Select,
  Switch,
  ActionIcon,
  Text,
  Stack,
  Divider,
  NumberInput,
  Paper,
  Badge
} from '@mantine/core'
import { IconPlus, IconTrash, IconGripVertical } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { supabase, Question } from '@/lib/supabase'
import { useAuth } from './AuthProvider'

interface FormBuilderProps {
  onFormCreated?: (formId: string) => void
  initialData?: {
    title: string
    description: string
    questions: Partial<Question>[]
  }
  isEditing?: boolean
  formId?: string
}

interface QuestionForm {
  question_text: string
  question_type: 'text' | 'multiple_choice' | 'yes_no' | 'rating' | 'scale' | 'long_text'
  options: string[]
  required: boolean
  order_index: number
}

export function FormBuilder({ onFormCreated, initialData, isEditing = false, formId }: FormBuilderProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      questions: initialData?.questions?.map(q => ({
        question_text: q.question_text || '',
        question_type: q.question_type || 'text',
        options: q.options || [],
        required: q.required || false,
        order_index: q.order_index || 0
      })) || []
    },
    validate: {
      title: (value) => (value.length < 1 ? 'Title is required' : null),
      questions: {
        question_text: (value) => (value.length < 1 ? 'Question text is required' : null),
      }
    }
  })

  const addQuestion = () => {
    form.insertListItem('questions', {
      question_text: '',
      question_type: 'text',
      options: [],
      required: false,
      order_index: form.values.questions.length
    })
  }

  const removeQuestion = (index: number) => {
    form.removeListItem('questions', index)
    // Update order_index for remaining questions
    form.values.questions.forEach((_, i) => {
      if (i >= index) {
        form.setFieldValue(`questions.${i}.order_index`, i)
      }
    })
  }

  const addOption = (questionIndex: number) => {
    const currentOptions = form.values.questions[questionIndex].options
    form.setFieldValue(`questions.${questionIndex}.options`, [...currentOptions, ''])
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.values.questions[questionIndex].options
    const newOptions = currentOptions.filter((_, i) => i !== optionIndex)
    form.setFieldValue(`questions.${questionIndex}.options`, newOptions)
  }

  const handleSubmit = async (values: typeof form.values) => {
    if (!userProfile) return

    setLoading(true)
    try {
      let savedFormId = formId

      if (isEditing && formId) {
        // Update existing form
        const { error: formError } = await supabase
          .from('forms')
          .update({
            title: values.title,
            description: values.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', formId)

        if (formError) throw formError

        // Delete existing questions
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('form_id', formId)

        if (deleteError) throw deleteError
      } else {
        // Create new form
        const { data: formData, error: formError } = await supabase
          .from('forms')
          .insert({
            title: values.title,
            description: values.description,
            facility_id: userProfile.facility_id,
            created_by: userProfile.id
          })
          .select()
          .single()

        if (formError) throw formError
        savedFormId = formData.id
      }

      // Insert questions
      if (values.questions.length > 0) {
        const questionsToInsert = values.questions.map((q, index) => ({
          form_id: savedFormId,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.question_type === 'multiple_choice' ? q.options.filter(opt => opt.trim()) : null,
          required: q.required,
          order_index: index
        }))

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToInsert)

        if (questionsError) throw questionsError
      }

      notifications.show({
        title: 'Success',
        message: isEditing ? 'Form updated successfully' : 'Form created successfully',
        color: 'green',
      })

      if (onFormCreated && savedFormId) {
        onFormCreated(savedFormId)
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

  const questionTypeOptions = [
    { value: 'text', label: 'Short Text' },
    { value: 'long_text', label: 'Long Text' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'yes_no', label: 'Yes/No' },
    { value: 'rating', label: 'Rating (1-5 stars)' },
    { value: 'scale', label: 'Scale (1-10)' }
  ]

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Form Details */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} size="lg" mb="md">Form Details</Text>
          <Stack gap="md">
            <TextInput
              label="Form Title"
              placeholder="e.g., Daily Wellness Check"
              required
              {...form.getInputProps('title')}
            />
            <Textarea
              label="Description"
              placeholder="Describe what this form is used for..."
              rows={3}
              {...form.getInputProps('description')}
            />
          </Stack>
        </Card>

        {/* Questions */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={500} size="lg">Questions</Text>
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addQuestion}
            >
              Add Question
            </Button>
          </Group>

          {form.values.questions.length === 0 ? (
            <Paper p="xl" style={{ textAlign: 'center' }} c="dimmed">
              <Text>No questions added yet. Click "Add Question" to get started.</Text>
            </Paper>
          ) : (
            <Stack gap="md">
              {form.values.questions.map((question, index) => (
                <Paper key={index} p="md" withBorder>
                  <Group align="flex-start" wrap="nowrap">
                    <ActionIcon variant="subtle" style={{ marginTop: 8 }}>
                      <IconGripVertical size={16} />
                    </ActionIcon>
                    
                    <Stack style={{ flex: 1 }} gap="sm">
                      <Group justify="space-between">
                        <Badge size="sm" variant="light">
                          Question {index + 1}
                        </Badge>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => removeQuestion(index)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>

                      <TextInput
                        label="Question Text"
                        placeholder="Enter your question..."
                        required
                        {...form.getInputProps(`questions.${index}.question_text`)}
                      />

                      <Group grow>
                        <Select
                          label="Question Type"
                          data={questionTypeOptions}
                          {...form.getInputProps(`questions.${index}.question_type`)}
                        />
                        <div style={{ display: 'flex', alignItems: 'end', paddingBottom: 8 }}>
                          <Switch
                            label="Required"
                            {...form.getInputProps(`questions.${index}.required`)}
                          />
                        </div>
                      </Group>

                      {/* Multiple Choice Options */}
                      {question.question_type === 'multiple_choice' && (
                        <div>
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={500}>Options</Text>
                            <Button
                              size="xs"
                              variant="light"
                              onClick={() => addOption(index)}
                            >
                              Add Option
                            </Button>
                          </Group>
                          <Stack gap="xs">
                            {question.options.map((option, optionIndex) => (
                              <Group key={optionIndex} wrap="nowrap">
                                <TextInput
                                  placeholder={`Option ${optionIndex + 1}`}
                                  style={{ flex: 1 }}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options]
                                    newOptions[optionIndex] = e.target.value
                                    form.setFieldValue(`questions.${index}.options`, newOptions)
                                  }}
                                />
                                <ActionIcon
                                  color="red"
                                  variant="light"
                                  onClick={() => removeOption(index, optionIndex)}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                            ))}
                          </Stack>
                        </div>
                      )}
                    </Stack>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Card>

        {/* Submit Button */}
        <Group justify="flex-end">
          <Button
            type="submit"
            loading={loading}
            disabled={form.values.questions.length === 0}
          >
            {isEditing ? 'Update Form' : 'Create Form'}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}