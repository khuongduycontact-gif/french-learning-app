export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export interface CourseMaterialFile {
  url: string;
  type: string | null;
  name: string | null;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  name: string;
  description: string | null;
  files: CourseMaterialFile[];
  order: number;
  createdAt: string;
}

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
  videoUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  materials?: CourseMaterial[];
  _count?: { enrollments: number };
  myEnrollmentStatus?: EnrollmentStatus | null;
}

export interface CourseMaterialInput {
  name: string;
  description?: string;
  files: CourseMaterialFile[];
}

export interface CourseInput {
  title: string;
  description: string;
  level: Level;
  price: number;
  duration: number;
  lessons: number;
  videoUrl?: string;
  published?: boolean;
  materials?: CourseMaterialInput[];
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
  deeplinkUrl: string | null;
  bankTransferParams: string | null;
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
