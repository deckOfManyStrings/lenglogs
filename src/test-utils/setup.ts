import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Mantine notifications
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
  Notifications: () => null, // Add this
}))

// Mock Mantine core components that might cause issues
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  MantineProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}))