import type {
  AboutMethodItem,
  AboutReason,
  AboutTimelineItem,
} from "@/types";

// Sinh id ngắn, đủ ổn định để dùng làm `key` trong React và để nhận diện
// từng mục trong các mảng Json (không cần bảng riêng trong CSDL).
export function randomAboutId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Nội dung khởi tạo lần đầu (khi chưa có bản ghi AboutPage nào trong CSDL),
// phỏng theo bản thiết kế mẫu - admin có thể sửa/xoá/thêm mọi mục sau đó.
export const defaultTimeline: AboutTimelineItem[] = [
  { id: randomAboutId(), year: "2016", icon: "book", title: "Bắt đầu học tiếng Pháp", description: "Yêu thích văn hoá và ngôn ngữ Pháp, bắt đầu hành trình chinh phục tiếng Pháp." },
  { id: randomAboutId(), year: "2018", icon: "certificate", title: "Đạt DELF B2", description: "Đạt chứng chỉ DELF B2 với số điểm cao và bắt đầu dạy tiếng Pháp." },
  { id: randomAboutId(), year: "2020", icon: "plane", title: "Du học tại Pháp", description: "Sang Pháp du học ngành Ngôn ngữ và Văn hoá Pháp tại Université de Strasbourg." },
  { id: randomAboutId(), year: "2022", icon: "chalkboard", title: "Giảng dạy chuyên nghiệp", description: "Trở về Việt Nam, giảng dạy và luyện thi DELF cho học viên ở mọi trình độ." },
  { id: randomAboutId(), year: "2024", icon: "star", title: "Français avec Céline", description: "Xây dựng phương pháp giảng dạy bài bản, giúp hàng ngàn học viên đạt mục tiêu tiếng Pháp." },
];

export const defaultReasons: AboutReason[] = [
  { id: randomAboutId(), icon: "target", title: "Lộ trình rõ ràng", description: "Học theo chuẩn CEFR từ A1 đến B2." },
  { id: randomAboutId(), icon: "book", title: "Giáo trình chuẩn", description: "Tài liệu chỉnh chu, cập nhật và chọn lọc kỹ lưỡng." },
  { id: randomAboutId(), icon: "headphones", title: "Luyện thi hiệu quả", description: "Bí quyết làm bài và chiến lược đạt điểm cao DELF." },
  { id: randomAboutId(), icon: "heart", title: "Tận tâm & đồng hành", description: "Luôn lắng nghe, hỗ trợ và truyền cảm hứng." },
];

export const defaultMethods: AboutMethodItem[] = [
  { id: randomAboutId(), title: "Học qua giao tiếp", description: "Tập trung vào thực hành, giúp bạn tự tin sử dụng tiếng Pháp trong đời sống." },
  { id: randomAboutId(), title: "Nghe hiểu mỗi ngày", description: "Luyện nghe với tài liệu thực tế, đa dạng chủ đề thú vị." },
  { id: randomAboutId(), title: "Học có hệ thống", description: "Kiến thức ngữ pháp trình bày rõ ràng, dễ hiểu, dễ áp dụng." },
  { id: randomAboutId(), title: "Đánh giá & cá nhân hoá", description: "Theo sát tiến độ, điều chỉnh lộ trình phù hợp với từng học viên." },
];

export const defaultAboutContent = {
  heroKicker: "Apprendre, c'est grandir",
  heroTitle: "Giới thiệu về tôi",
  heroGreeting: "Bonjour ! Mình là Céline.",
  heroDescription:
    "Mình là giáo viên tiếng Pháp với hơn 5 năm kinh nghiệm giảng dạy và luyện thi DELF theo khung tham chiếu Châu Âu (CEFR). Mình tin rằng học một ngôn ngữ là mở ra một thế giới mới, và mình ở đây để đồng hành cùng bạn trên hành trình đó.",
  heroImageUrl: null as string | null,
  heroBadgeUrl: null as string | null,
  timeline: defaultTimeline,
  reasons: defaultReasons,
  methodTitle: "Phương pháp giảng dạy",
  methodImageUrl: null as string | null,
  methods: defaultMethods,
};
