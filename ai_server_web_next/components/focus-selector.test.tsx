import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FocusSelector, type FocusMode } from './focus-selector'

vi.mock('radix-ui', async () => {
  const React = await import('react')

  const Root = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dropdown-root' }, children)

  const Trigger = React.forwardRef(
    ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }, ref: React.Ref<HTMLButtonElement>) =>
      React.createElement('button', { ref, 'data-testid': 'dropdown-trigger', ...props }, children as React.ReactNode)
  )
  Trigger.displayName = 'DropdownMenuTrigger'

  const Portal = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dropdown-portal' }, children)

  const Content = React.forwardRef(
    ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }, ref: React.Ref<HTMLDivElement>) =>
      React.createElement('div', { ref, 'data-testid': 'dropdown-content', ...props }, children as React.ReactNode)
  )
  Content.displayName = 'DropdownMenuContent'

  const Item = React.forwardRef(
    ({ children, onSelect, ...props }: { children: React.ReactNode; onSelect?: (e: Event) => void; [key: string]: unknown }, ref: React.Ref<HTMLDivElement>) =>
      React.createElement('div', {
        ref,
        'data-testid': 'dropdown-item',
        role: 'menuitem',
        onClick: (e: React.MouseEvent) => { onSelect?.(e.nativeEvent ?? e) },
        ...props,
      }, children as React.ReactNode)
  )
  Item.displayName = 'DropdownMenuItem'

  const Label = React.forwardRef(
    ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }, ref: React.Ref<HTMLDivElement>) =>
      React.createElement('div', { ref, 'data-testid': 'dropdown-label', ...props }, children as React.ReactNode)
  )
  Label.displayName = 'DropdownMenuLabel'

  const Separator = React.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) =>
      React.createElement('div', { ref, 'data-testid': 'dropdown-separator', role: 'separator', ...props })
  )
  Separator.displayName = 'DropdownMenuSeparator'

  return {
    DropdownMenu: { Root, Portal, Trigger, Content, Item, Label, Separator },
  }
})

describe('FocusSelector', () => {
  const defaultProps = {
    focusMode: null as FocusMode,
    setFocusMode: vi.fn(),
    onSwitchToCourse: vi.fn(),
  }

  it('renders the "+" trigger button', () => {
    render(<FocusSelector {...defaultProps} />)
    expect(screen.getByRole('button', { name: /选择专注模式/i })).toBeInTheDocument()
  })

  it('displays all 4 focus mode options', () => {
    render(<FocusSelector {...defaultProps} />)
    expect(screen.getByText('裁剪建议')).toBeInTheDocument()
    expect(screen.getByText('缩水率查询')).toBeInTheDocument()
    expect(screen.getByText('面料知识')).toBeInTheDocument()
    expect(screen.getByText('课程学习')).toBeInTheDocument()
  })

  it('shows emoji icons for each mode', () => {
    render(<FocusSelector {...defaultProps} />)
    expect(screen.getByText('✂️')).toBeInTheDocument()
    expect(screen.getByText('📐')).toBeInTheDocument()
    expect(screen.getByText('🧵')).toBeInTheDocument()
    expect(screen.getByText('📖')).toBeInTheDocument()
  })

  it('calls setFocusMode when a mode is clicked', async () => {
    const setFocusMode = vi.fn()
    render(<FocusSelector {...defaultProps} setFocusMode={setFocusMode} />)

    const cuttingItem = screen.getByText('裁剪建议')
    await userEvent.click(cuttingItem)
    expect(setFocusMode).toHaveBeenCalledWith('裁剪建议')
  })

  it('calls onSwitchToCourse when 课程学习 is selected', async () => {
    const onSwitchToCourse = vi.fn()
    const setFocusMode = vi.fn()
    render(
      <FocusSelector
        {...defaultProps}
        setFocusMode={setFocusMode}
        onSwitchToCourse={onSwitchToCourse}
      />
    )

    const courseItem = screen.getByText('课程学习')
    await userEvent.click(courseItem)
    expect(setFocusMode).toHaveBeenCalledWith('课程学习')
    expect(onSwitchToCourse).toHaveBeenCalled()
  })

  it('displays a badge when a focus mode is selected', () => {
    render(<FocusSelector {...defaultProps} focusMode="裁剪建议" />)
    expect(screen.getByRole('button', { name: '裁剪建议' })).toBeInTheDocument()
    expect(screen.getAllByText('裁剪建议')).toHaveLength(1)
  })

  it('does not show badge when no mode is selected', () => {
    render(<FocusSelector {...defaultProps} focusMode={null} />)
    expect(screen.getAllByText('裁剪建议')).toHaveLength(1)
  })

  it('allows clearing the focus mode by clicking the badge', async () => {
    const setFocusMode = vi.fn()
    render(<FocusSelector {...defaultProps} focusMode="裁剪建议" setFocusMode={setFocusMode} />)

    const badge = screen.getByRole('button', { name: /裁剪建议/i })
    await userEvent.click(badge)
    expect(setFocusMode).toHaveBeenCalledWith(null)
  })

  it('renders with correct FocusMode type values', () => {
    const modes: FocusMode[] = ['裁剪建议', '缩水率查询', '面料知识', '课程学习', null]
    expect(modes).toHaveLength(5)
    expect(modes.filter(m => m !== null)).toHaveLength(4)
  })
})