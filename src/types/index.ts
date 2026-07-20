export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: Level;
  price: number;
  duration: number;
  sessions: number;
  lessons: number;
  imageUrl: string | null;
  videoUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { enrollments: number };
}

export interface CourseInput {
  title: string;
  description: string;
  level: Level;
  price: number;
  duration: number;
  sessions: number;
  lessons: number;
  imageUrl?: string;
  videoUrl?: string;
  published?: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
  course?: Course;
}
