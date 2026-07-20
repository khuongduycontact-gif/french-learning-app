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
  status: EnrollmentStatus;
  paidAmount: number;
  paymentNote: string | null;
  confirmedAt: string | null;
  createdAt: string;
  course?: Course;
  user?: { id: string; name: string | null; email: string | null; image: string | null };
}

export type EnrollmentStatus =
  | "PENDING_PAYMENT"
  | "AWAITING_CONFIRMATION"
  | "CONFIRMED";

export interface PaymentInfo {
  qrUrl: string | null;
  amount: number;
  addInfo: string;
  bankName: string;
  accountNo: string;
  accountName: string;
}

export type NotificationType =
  | "PAYMENT_SUBMITTED"
  | "ENROLLMENT_CONFIRMED"
  | "PAYMENT_REJECTED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}
