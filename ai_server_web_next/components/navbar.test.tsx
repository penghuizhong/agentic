import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from './navbar'
import { UserResponse } from '@/lib/api'

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

const mockUser: UserResponse = {
  id: '1',
  username: '张三',
  email: 'zhang@example.com',
  is_active: true,
  is_superuser: false,
  created_at: '2024-01-01',
  roles: ['user'],
}

const defaultProps = {
  user: null as UserResponse | null,
  isAuthenticated: false,
  onLogout: vi.fn(),
  onShowAuth: vi.fn(),
  onNavigateCourse: vi.fn(),
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the brand name "方圆智版"', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByText('方圆智版')).toBeInTheDocument()
  })

  it('renders brand name with tracking-widest and font-medium classes', () => {
    render(<Navbar {...defaultProps} />)
    const brand = screen.getByText('方圆智版')
    expect(brand.className).toContain('tracking-widest')
    expect(brand.className).toContain('font-medium')
  })

  it('renders theme toggle button', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByRole('button', { name: '切换主题' })).toBeInTheDocument()
  })

  it('shows generic User icon when not authenticated', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByRole('button', { name: '用户菜单' })).toBeInTheDocument()
  })

  it('shows user initial when authenticated', () => {
    render(<Navbar {...defaultProps} user={mockUser} isAuthenticated={true} />)
    expect(screen.getByText('张')).toBeInTheDocument()
  })

  it('has correct header layout classes', () => {
    render(<Navbar {...defaultProps} />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('absolute')
    expect(header.className).toContain('top-0')
    expect(header.className).toContain('w-full')
    expect(header.className).toContain('z-50')
  })

  it('renders avatar with h-8 w-8 rounded-full button', () => {
    render(<Navbar {...defaultProps} />)
    const avatarButton = screen.getByRole('button', { name: '用户菜单' })
    expect(avatarButton.className).toContain('h-8')
    expect(avatarButton.className).toContain('w-8')
    expect(avatarButton.className).toContain('rounded-full')
  })

  it('opens dropdown and shows login option when not authenticated', async () => {
    const user = userEvent.setup()
    render(<Navbar {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: '用户菜单' }))

    expect(await screen.findByRole('menuitem', { name: /登录/ })).toBeInTheDocument()
  })

  it('opens dropdown and shows user info and logout when authenticated', async () => {
    const user = userEvent.setup()
    render(<Navbar {...defaultProps} user={mockUser} isAuthenticated={true} />)
    await user.click(screen.getByRole('button', { name: '用户菜单' }))

    expect(await screen.findByRole('menuitem', { name: /我的课程/ })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: /退出登录/ })).toBeInTheDocument()
  })

  it('calls onShowAuth with login when clicking login item', async () => {
    const onShowAuth = vi.fn()
    const user = userEvent.setup()
    render(<Navbar {...defaultProps} onShowAuth={onShowAuth} />)
    await user.click(screen.getByRole('button', { name: '用户菜单' }))

    const loginItem = await screen.findByRole('menuitem', { name: /登录/ })
    await user.click(loginItem)
    expect(onShowAuth).toHaveBeenCalledWith('login')
  })

  it('calls onLogout when clicking logout item', async () => {
    const onLogout = vi.fn()
    const user = userEvent.setup()
    render(<Navbar {...defaultProps} user={mockUser} isAuthenticated={true} onLogout={onLogout} />)
    await user.click(screen.getByRole('button', { name: '用户菜单' }))

    const logoutItem = await screen.findByRole('menuitem', { name: /退出登录/ })
    await user.click(logoutItem)
    expect(onLogout).toHaveBeenCalled()
  })

  it('calls onNavigateCourse when clicking course item', async () => {
    const onNavigateCourse = vi.fn()
    const user = userEvent.setup()
    render(<Navbar {...defaultProps} user={mockUser} isAuthenticated={true} onNavigateCourse={onNavigateCourse} />)
    await user.click(screen.getByRole('button', { name: '用户菜单' }))

    const courseItem = await screen.findByRole('menuitem', { name: /我的课程/ })
    await user.click(courseItem)
    expect(onNavigateCourse).toHaveBeenCalled()
  })
})