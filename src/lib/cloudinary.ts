import { v2 as cloudinary } from "cloudinary";

// Chỉ còn dùng Cloudinary cho ảnh/video giới thiệu khoá học (resource_type
// "image"/"video"). Tài liệu học, sách, bài tập giao và bài học sinh nộp
// (trước đây lưu dưới resource_type "raw") đã chuyển sang Vercel Blob, xem
// lib/blob.ts.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
