"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseResponse } from "@/lib/api"

interface DiscoverSectionProps {
  courses: CourseResponse[]
  loading: boolean
  onCourseClick: (courseId: string) => void
}

function CourseCard({
  course,
  onCourseClick,
}: {
  course: CourseResponse
  onCourseClick: (courseId: string) => void
}) {
  return (
    <Card className="rounded-2xl border-muted/30 bg-secondary/30 hover:bg-secondary/60 transition-all cursor-pointer border-t border-white/10 shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="text-xs font-medium px-3 py-1 rounded-full">
            {course.tag}
          </Badge>
          <div className="text-2xl font-bold">{course.price}</div>
        </div>
        <CardTitle className="text-xl md:text-2xl leading-relaxed mt-2">
          {course.title}
        </CardTitle>
        <CardDescription className="text-base mt-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end pt-2 pb-6 pr-6">
        <Button
          className="rounded-full px-6 bg-foreground text-background font-semibold"
          onClick={() => onCourseClick(course.id)}
        >
          学习
        </Button>
      </CardFooter>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card className="rounded-2xl border-muted/30 bg-secondary/30">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-7 w-3/4 mt-2" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardHeader>
      <CardFooter className="flex justify-end pt-2 pb-6 pr-6">
        <Skeleton className="h-8 w-20 rounded-full" />
      </CardFooter>
    </Card>
  )
}

export function DiscoverSection({ courses, loading, onCourseClick }: DiscoverSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-medium text-muted-foreground tracking-wider mb-4">
        发现课程
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-center">暂无课程</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onCourseClick={onCourseClick} />
          ))}
        </div>
      )}
    </section>
  )
}