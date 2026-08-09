import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sanitizeBlobFilename } from "./blobFilename";

export { sanitizeBlobFilename };

// Backblaze B2 dùng để lưu các tệp "raw" (tài liệu học, sách, bài tập giao,
// bài tập học sinh nộp / bài đã chữa) — thay cho Vercel Blob trước đây. Ảnh
// và video giới thiệu khoá học vẫn lưu trên Cloudinary (xem lib/cloudinary.ts).
//
// B2 có API tương thích S3 nên dùng thẳng @aws-sdk/client-s3 — chỉ cần trỏ
// `endpoint` vào endpoint S3 của B2 (VD: https://s3.us-east-005.backblazeb2.com)
// thay vì AWS thật. Cần các biến môi trường (xem README / .env.example):
//   B2_KEY_ID            — keyID của Application Key (Backblaze B2 → Application Keys)
//   B2_APPLICATION_KEY   — applicationKey tương ứng (CHỈ hiển thị 1 lần lúc tạo)
//   B2_BUCKET_NAME       — tên bucket, VD: french-learning-app
//   B2_ENDPOINT          — endpoint S3 của bucket, VD: https://s3.us-east-005.backblazeb2.com
//   B2_REGION            — tuỳ chọn, mặc định lấy phần vùng trong endpoint (us-east-005)
//
// Bucket đặt ở chế độ PRIVATE (theo yêu cầu) — nghĩa là không có URL công
// khai nào truy cập trực tiếp được tệp. Vì vậy so với Vercel Blob trước đây
// (lưu URL công khai thẳng vào DB), cách vận hành ở đây đổi khác 2 điểm:
//   1) Upload: trình duyệt không PUT thẳng vào B2 bằng 1 "client token" như
//      Vercel Blob, mà xin 1 "URL PUT có chữ ký tạm thời" (presigned URL,
//      xem getPresignedUploadUrl) từ route Next.js, rồi PUT thẳng lên URL đó.
//   2) Lưu trữ: cột `url` trong DB (files/contentUrl/gradedFiles) giờ lưu
//      OBJECT KEY (đường dẫn tệp trong bucket, VD:
//      "bonjour-francais/materials/giao-trinh-a1-x7k2p9.pdf") thay vì URL
//      đầy đủ — vì URL đầy đủ tới bucket private cũng không dùng được luôn.
//   3) Tải xuống: route /api/download tự tạo 1 "URL GET có chữ ký tạm thời"
//      (xem getPresignedDownloadUrl) ngay trước khi proxy tải tệp, không lộ
//      URL này ra ngoài trình duyệt.

const REQUIRED_ENV_VARS = ["B2_KEY_ID", "B2_APPLICATION_KEY", "B2_BUCKET_NAME", "B2_ENDPOINT"] as const;

function getRequiredEnv(name: (typeof REQUIRED_ENV_VARS)[number]): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Thiếu biến môi trường ${name} — xem hướng dẫn cấu hình Backblaze B2 trong README / .env.example`
    );
  }
  return value;
}

function guessRegionFromEndpoint(endpoint: string): string {
  // Endpoint B2 có dạng https://s3.<region>.backblazeb2.com
  const match = endpoint.match(/s3\.([a-z0-9-]+)\.backblazeb2\.com/i);
  return match ? match[1] : "us-east-005";
}

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  const endpoint = getRequiredEnv("B2_ENDPOINT");
  cachedClient = new S3Client({
    region: process.env.B2_REGION || guessRegionFromEndpoint(endpoint),
    endpoint,
    credentials: {
      accessKeyId: getRequiredEnv("B2_KEY_ID"),
      secretAccessKey: getRequiredEnv("B2_APPLICATION_KEY"),
    },
    // Backblaze B2 cần path-style (https://endpoint/bucket/key) thay vì
    // virtual-hosted-style (https://bucket.endpoint/key) mà AWS S3 dùng mặc định.
    forcePathStyle: true,
    // Từ @aws-sdk/client-s3 3.729.0 trở lên (bản đang cài: xem
    // node_modules/@aws-sdk/client-s3/package.json), SDK mặc định tự thêm
    // checksum CRC32 vào MỌI request PutObject — kể cả khi tạo presigned
    // URL không có Body (như getPresignedUploadUrl bên dưới), SDK tính
    // checksum "rỗng" rồi nhúng vào URL. Vì URL này dùng để PUT tệp thật,
    // checksum rỗng đó không khớp, B2 sẽ từ chối request PUT (sau khi CORS
    // đã được cấu hình đúng — xem CORS rules trên Bucket Settings/b2 CLI).
    // "WHEN_REQUIRED" tắt hành vi tự thêm checksum này.
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
  return cachedClient;
}

// Mọi object của app đều nằm trong "thư mục" ảo này, để dễ phân biệt với
// dữ liệu khác nếu sau này bucket được dùng chung, và để kiểm tra hợp lệ
// trước khi tạo presigned URL tải xuống (tránh truy cập object ngoài ý muốn).
const APP_PREFIX = "bonjour-francais/";

// Kiểm tra 1 chuỗi có phải là object key hợp lệ do chính app tạo ra không —
// dùng ở route /api/download trước khi tạo presigned URL, để không ai lợi
// dụng tham số ?url= truyền vào 1 key tuỳ ý (dù bucket private nên rủi ro đã
// thấp, đây là lớp phòng thủ thêm).
export function isAppObjectKey(key: string): boolean {
  if (!key) return false;
  if (key.includes("..") || key.startsWith("/") || key.includes("://")) return false;
  return key.startsWith(APP_PREFIX);
}

// Sinh object key mới cho 1 tệp sắp tải lên, đặt trong "thư mục" ảo theo
// mục đích sử dụng (folder, VD: "materials", "submissions"), kèm hậu tố
// ngẫu nhiên để tránh trùng tên — tương đương addRandomSuffix của Vercel Blob.
export function buildObjectKey(folder: string, filename: string): string {
  const safeFolder = (folder || "misc").replace(/[^a-zA-Z0-9_-]/g, "") || "misc";
  const safeName = sanitizeBlobFilename(filename || "tep");
  const randomSuffix = Math.random().toString(36).slice(2, 10);

  const idx = safeName.lastIndexOf(".");
  const base = idx > 0 ? safeName.slice(0, idx) : safeName;
  const ext = idx > 0 ? safeName.slice(idx) : "";

  return `${APP_PREFIX}${safeFolder}/${base}-${randomSuffix}${ext}`;
}

// URL PUT có chữ ký tạm thời — trình duyệt PUT thẳng nội dung tệp lên URL
// này, KHÔNG đi qua server Next.js, nên không bị giới hạn body request của
// Vercel Functions (4.5MB). Hết hạn sau `expiresInSeconds` (mặc định 10 phút
// — đủ thời gian để trình duyệt bắt đầu PUT ngay sau khi xin URL).
export async function getPresignedUploadUrl(
  key: string,
  contentType?: string,
  expiresInSeconds = 600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getRequiredEnv("B2_BUCKET_NAME"),
    Key: key,
    ContentType: contentType || undefined,
  });
  return getSignedUrl(getClient(), command, { expiresIn: expiresInSeconds });
}

// URL GET có chữ ký tạm thời — vì bucket ở chế độ Private nên đây là cách
// DUY NHẤT để đọc được nội dung tệp. Chỉ dùng ngay lập tức ở server (route
// /api/download fetch rồi proxy lại cho trình duyệt), KHÔNG trả thẳng URL
// này ra ngoài. Hết hạn sau `expiresInSeconds` (mặc định 60 giây).
export async function getPresignedDownloadUrl(key: string, expiresInSeconds = 60): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getRequiredEnv("B2_BUCKET_NAME"),
    Key: key,
  });
  return getSignedUrl(getClient(), command, { expiresIn: expiresInSeconds });
}

// Tải 1 tệp raw lên thẳng từ server (Node) — dùng cho script/cron nếu sau
// này cần, tương đương uploadRawToBlob trước đây. Các route /api/upload và
// /api/submissions/upload không dùng hàm này cho nhánh tài liệu (xem lý do
// trong src/lib/uploadToB2.ts) — chỉ giữ lại như tiện ích hợp lệ.
export async function uploadRawToB2(folder: string, file: File): Promise<{ key: string }> {
  const key = buildObjectKey(folder, file.name);
  const bytes = new Uint8Array(await file.arrayBuffer());
  await getClient().send(
    new PutObjectCommand({
      Bucket: getRequiredEnv("B2_BUCKET_NAME"),
      Key: key,
      Body: bytes,
      ContentType: file.type || undefined,
    })
  );
  return { key };
}

// --- Tương thích ngược với dữ liệu cũ ---
// Những tệp tài liệu đã tải lên TRƯỚC khi chuyển từ Vercel Blob sang
// Backblaze B2 vẫn còn URL công khai dạng
// https://<store-id>.public.blob.vercel-storage.com/... đang lưu sẵn trong
// DB. Vẫn cho route /api/download proxy tiếp các URL này (chỉ đọc, không
// upload mới) để không làm hỏng tài liệu/bài nộp cũ. Nếu muốn dọn hẳn sang
// B2, cần chạy 1 script di chuyển dữ liệu riêng (tải từng tệp cũ về rồi
// upload lại lên B2, cập nhật lại cột url trong DB) — có thể hỏi thêm nếu
// cần.
const LEGACY_VERCEL_BLOB_HOSTNAME_SUFFIX = ".public.blob.vercel-storage.com";

export function isLegacyVercelBlobHost(hostname: string): boolean {
  return hostname.toLowerCase().endsWith(LEGACY_VERCEL_BLOB_HOSTNAME_SUFFIX);
}
