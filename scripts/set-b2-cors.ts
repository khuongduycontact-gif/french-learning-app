// Script chạy MỘT LẦN để bật CORS cho bucket B2, cho phép trình duyệt PUT
// thẳng lên bucket bằng presigned URL (xem src/lib/b2.ts, src/lib/uploadToB2.ts).
// Đây chính là nguyên nhân lỗi:
//   "Access to XMLHttpRequest ... has been blocked by CORS policy"
// Lỗi này KHÔNG nằm trong code Next.js — nó là 1 cấu hình ở phía bucket B2,
// nên phải gọi API để bật, không sửa được bằng cách đổi code trong app.
//
// Cách chạy (từ thư mục gốc repo):
//   npx tsx scripts/set-b2-cors.ts
//
// Cần các biến môi trường sau (đã có sẵn trong .env / .env.local vì app
// cũng dùng để upload/download qua B2 — xem src/lib/b2.ts):
//   B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, B2_ENDPOINT
//
// Lưu ý: Application Key phải có quyền quản lý CORS của bucket (một số
// Application Key tạo ở chế độ "giới hạn" chỉ có quyền đọc/ghi file, KHÔNG
// có quyền sửa cấu hình bucket — nếu script báo lỗi 401/403, cần tạo tạm
// 1 Application Key có đủ quyền, hoặc dùng Master Application Key).
//
// Chạy lại được nhiều lần không sao — PutBucketCors LUÔN GHI ĐÈ toàn bộ rule
// cũ bằng danh sách rule mới truyền vào (không cộng dồn).

process.loadEnvFile?.(); // Node 20.6+: tự nạp file .env ở thư mục hiện tại

import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const raw = process.env[name];
  if (!raw) {
    throw new Error(`Thiếu biến môi trường ${name} (kiểm tra .env / .env.local)`);
  }
  const value = raw.trim();
  if (value !== raw) {
    console.warn(
      `⚠️  ${name} có khoảng trắng/xuống dòng thừa ở đầu hoặc cuối — đã tự cắt bớt, nhưng nên sửa lại trong .env cho sạch.`
    );
  }
  return value;
}

// In vài thông tin AN TOÀN (không lộ secret) để đối chiếu với B2 console:
// - keyID: hiện đầy đủ, không phải bí mật
// - applicationKey: chỉ hiện độ dài, để kiểm tra có bị copy thiếu/dư ký tự không
function debugPrintCreds() {
  const keyId = process.env.B2_KEY_ID?.trim() || "";
  const appKey = process.env.B2_APPLICATION_KEY?.trim() || "";
  console.log("--- Kiểm tra nhanh (không lộ secret) ---");
  console.log("B2_KEY_ID:", keyId || "(trống)");
  console.log("B2_APPLICATION_KEY độ dài:", appKey.length, "ký tự");
  console.log(
    "B2_APPLICATION_KEY 4 ký tự đầu/cuối:",
    appKey ? `${appKey.slice(0, 4)}...${appKey.slice(-4)}` : "(trống)"
  );
  console.log("-----------------------------------------");
}

// Sửa/thêm origin ở đây nếu có thêm domain preview hoặc domain khác.
const ALLOWED_ORIGINS = [
  "https://francaisavecceline.vercel.app",
  "http://localhost:3000",
];

async function main() {
  const bucket = requireEnv("B2_BUCKET_NAME");
  const endpoint = requireEnv("B2_ENDPOINT");
  debugPrintCreds();

  const client = new S3Client({
    region: process.env.B2_REGION || "us-east-005",
    endpoint,
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: requireEnv("B2_KEY_ID"),
      secretAccessKey: requireEnv("B2_APPLICATION_KEY"),
    },
  });

  console.log(`Đang bật CORS cho bucket "${bucket}" tại ${endpoint} ...`);
  console.log("Origins được phép:", ALLOWED_ORIGINS);

  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ALLOWED_ORIGINS,
            AllowedMethods: ["PUT"],
            AllowedHeaders: ["content-type"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  );

  console.log("✅ Xong. Thử upload lại từ trình duyệt để kiểm tra.");
}

main().catch((err) => {
  console.error("❌ Lỗi khi bật CORS:", err);
  process.exit(1);
});