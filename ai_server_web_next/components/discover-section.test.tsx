import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiscoverSection } from './discover-section'
import { CourseResponse } from '@/lib/api'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

const mockCourses: CourseResponse[] = [
  {
    id: 'course-1',
    title: '西装领口缩水率',
    description: '深入讲解西装领口缩水率的计算方法与实际应用',
    price: '¥299',
    tag: '裁剪',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'course-2',
    title: '女装袖口规程',
    description: '女装袖口的专业规程与实操技巧',
    price: '¥199',
    tag: '工艺',
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'course-3',
    title: '领口放码技术',
    description: '领口放码的核心技术与常见问题解决',
    price: '¥399',
    tag: '放码',
    created_at: '2024-03-01T00:00:00Z',
  },
]

describe('DiscoverSection', () => {
  it('renders section heading "发现课程"', () => {
    render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    expect(screen.getByText('发现课程')).toBeInTheDocument()
  })

  it('renders heading with correct styling classes', () => {
    render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    const heading = screen.getByText('发现课程')
    expect(heading.className).toContain('text-lg')
    expect(heading.className).toContain('font-medium')
    expect(heading.className).toContain('text-muted-foreground')
    expect(heading.className).toContain('tracking-wider')
  })

  it('renders all course cards in a grid', () => {
    render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    expect(screen.getByText('西装领口缩水率')).toBeInTheDocument()
    expect(screen.getByText('女装袖口规程')).toBeInTheDocument()
    expect(screen.getByText('领口放码技术')).toBeInTheDocument()
  })

  it('renders course tags as badges', () => {
    render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    expect(screen.getByText('裁剪')).toBeInTheDocument()
    expect(screen.getByText('工艺')).toBeInTheDocument()
    expect(screen.getByText('放码')).toBeInTheDocument()
  })

  it('renders course prices', () => {
    render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    expect(screen.getByText('¥299')).toBeInTheDocument()
    expect(screen.getByText('¥199')).toBeInTheDocument()
    expect(screen.getByText('¥399')).toBeInTheDocument()
  })

  it('renders course descriptions', () => {
    render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    expect(screen.getByText('深入讲解西装领口缩水率的计算方法与实际应用')).toBeInTheDocument()
    expect(screen.getByText('女装袖口的专业规程与实操技巧')).toBeInTheDocument()
  })

  it('renders "学习" CTA button on each card', () => {
    render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    const ctaButtons = screen.getAllByRole('button', { name: '学习' })
    expect(ctaButtons).toHaveLength(3)
  })

  it('calls onCourseClick with course.id when clicking a card CTA', () => {
    const onCourseClick = vi.fn()
    render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={onCourseClick}
      />
    )
    const ctaButtons = screen.getAllByRole('button', { name: '学习' })
    fireEvent.click(ctaButtons[0])
    expect(onCourseClick).toHaveBeenCalledWith('course-1')
  })

  it('renders cards in a responsive grid layout', () => {
    const { container } = render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    const grid = container.querySelector('[class*="grid"]')
    expect(grid).toBeTruthy()
    expect(grid?.className).toContain('grid-cols-1')
    expect(grid?.className).toContain('md:grid-cols-2')
    expect(grid?.className).toContain('lg:grid-cols-3')
  })

  it('renders card with Perplexity-style rounded corners', () => {
    const { container } = render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    const cards = container.querySelectorAll('[data-slot="card"]')
    expect(cards.length).toBe(3)
    cards.forEach((card) => {
      expect(card.className).toContain('rounded-2xl')
    })
  })

  it('renders card with hover transition', () => {
    const { container } = render(
      <DiscoverSection
        courses={mockCourses}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    const cards = container.querySelectorAll('[data-slot="card"]')
    cards.forEach((card) => {
      expect(card.className).toContain('hover:bg-secondary/60')
      expect(card.className).toContain('transition-all')
    })
  })

  // Loading state
  it('shows skeleton cards when loading', () => {
    const { container } = render(
      <DiscoverSection
        courses={[]}
        loading={true}
        onCourseClick={vi.fn()}
      />
    )
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThanOrEqual(3)
  })

  it('does not show course cards when loading', () => {
    render(
      <DiscoverSection
        courses={mockCourses}
        loading={true}
        onCourseClick={vi.fn()}
      />
    )
    expect(screen.queryByText('西装领口缩水率')).not.toBeInTheDocument()
  })

  it('renders skeleton cards in same grid layout', () => {
    const { container } = render(
      <DiscoverSection
        courses={[]}
        loading={true}
        onCourseClick={vi.fn()}
      />
    )
    const grid = container.querySelector('[class*="grid"]')
    expect(grid).toBeTruthy()
    expect(grid?.className).toContain('grid-cols-1')
    expect(grid?.className).toContain('md:grid-cols-2')
    expect(grid?.className).toContain('lg:grid-cols-3')
  })

  // Empty state
  it('shows "暂无课程" when not loading and no courses', () => {
    render(
      <DiscoverSection
        courses={[]}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    expect(screen.getByText('暂无课程')).toBeInTheDocument()
  })

  it('does not show course cards when empty', () => {
    render(
      <DiscoverSection
        courses={[]}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: '学习' })).not.toBeInTheDocument()
  })

  it('renders empty state with muted styling', () => {
    render(
      <DiscoverSection
        courses={[]}
        loading={false}
        onCourseClick={vi.fn()}
      />
    )
    const emptyText = screen.getByText('暂无课程')
    expect(emptyText.className).toContain('text-muted-foreground')
  })
})