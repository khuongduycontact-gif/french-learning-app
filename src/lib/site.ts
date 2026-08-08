// Hằng số cấu hình chung của site (URL, tên hiển thị).
//
// Lưu ý: KHÔNG export các hằng số này từ src/app/layout.tsx. layout.tsx là
// file đặc biệt của Next.js App Router — Next chỉ cho phép các export cố định
// (default, metadata, generateMetadata, viewport, ...) trong các file
// page/layout/route. Export thêm biến tuỳ ý (VD: SITE_URL) sẽ làm hỏng
// type-check của Next lúc `next build` (route export type-check) và khiến
// build production fail. Vì vậy các hằng số dùng chung được đặt riêng ở đây.

// TODO: khi mua domain riêng (vd: francaisavecceline.com), đổi giá trị này —
// toàn bộ metadata, sitemap.xml, robots.txt sẽ tự dùng domain mới.
export const SITE_URL = "https://francaisavecceline.vercel.app";
export const SITE_NAME = "Français avec Céline";
