export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

// "lecture" = tệp tài liệu bài giảng, "exercise" = tệp tài liệu bài tập.
// Dữ liệu cũ chưa có trường này sẽ được coi mặc định là "lecture".
export type MaterialFileCategory = "lecture" | "exercise";

export interface CourseMaterialFile {
  url: string;
  type: string | null;
  name: string | null;
  category?: MaterialFileCategory | null;
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

export interface Achievement {
  id: string;
  level: Level;
  studentName: string;
  evidenceUrl: string;
  thankYouUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AchievementInput {
  level: Level;
  studentName: string;
  evidenceUrl?: string;
  thankYouUrls?: string[];
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
  | "PAYMENT_REJECTED"
  | "SUBMISSION_RECEIVED"
  | "SUBMISSION_GRADED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export type SubmissionStatus = "SUBMITTED" | "GRADED";

export interface SubmissionFile {
  url: string;
  name?: string;
  type?: string;
}

export interface Submission {
  id: string;
  courseId: string;
  materialId: string;
  userId: string;
  files: SubmissionFile[];
  note: string | null;
  status: SubmissionStatus;
  gradedFiles: SubmissionFile[] | null;
  gradedNote: string | null;
  gradedById: string | null;
  gradedAt: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  course?: { id: string; title: string };
  material?: { id: string; name: string };
  user?: { id: string; name: string | null; email: string | null; image: string | null };
  gradedBy?: { id: string; name: string | null } | null;
}
