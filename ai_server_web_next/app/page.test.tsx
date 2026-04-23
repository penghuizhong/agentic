import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: vi.fn(),
    theme: 'dark',
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isAuthModalOpen: false,
    authModalView: 'login' as const,
    showAuthModal: vi.fn(),
    hideAuthModal: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('@/lib/api', () => ({
  apiClient: {
    getCourses: vi.fn().mockResolvedValue({ courses: [] }),
    stream: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    invoke: vi.fn(),
  },
}))

vi.mock('@/components/navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}))

vi.mock('@/components/chat-response', () => ({
  ChatResponse: () => <div data-testid="chat-response">ChatResponse</div>,
}))

vi.mock('@/components/discover-section', () => ({
  DiscoverSection: () => <section data-testid="discover-section">DiscoverSection</section>,
}))

vi.mock('@/components/focus-selector', () => ({
  FocusSelector: () => <div data-testid="focus-selector">FocusSelector</div>,
  FocusMode: null,
}))

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}))

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Home component with brand statement', () => {
    render(<Home />)
    expect(screen.getByText(/方圆智版 · 打版智囊/i)).toBeInTheDocument()
  })
})
