import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildObjectKey, getPresignedUploadUrl } from "@/lib/b2";

// Bắt buộc chạy trên Node.js runtime, dùng getServerSession
export const runtime = "nodejs";

// Route này CHỈ cấp 1 "URL PUT có chữ ký tạm thời" (presigned URL) để trình
// duyệt tải tệp thẳng lên Backblaze B2 (không đi qua server) — dùng cho tài
// liệu học / sách (PDF, Word, PowerPoint, âm thanh, file nén...) ở khu vực
// quản trị.
//
// Vì sao cần route riêng (không dùng chung /api/upload như trước): tải qua
// server (multipart form-data trong POST body) sẽ luôn dính giới hạn 4.5MB
// body request của Vercel Functions (lỗi 413 khi tệp lớn hơn, ví dụ PDF
// 31MB). Route này chỉ trả về 1 URL ngắn hạn (chỉ vài trăm byte, không phải
// nội dung tệp — nên không bao giờ vượt giới hạn), rồi trình duyệt PUT thẳng
// file lên URL đó. Xem PdfUploader.tsx và CourseMaterialsEditor.tsx (dùng
// uploadDocToB2() từ "@/lib/uploadToB2" trỏ handleUploadUrl vào route này).
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Chỉ admin được tải tài liệu học/sách lên — cùng điều kiện với
    // /api/upload trước đây.
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { filename, contentType } = (await request.json()) as {
      filename?: string;
      contentType?: string;
    };
    if (!filename) {
      return NextResponse.json({ error: "Thiếu tên tệp" }, { status: 400 });
    }

    const key = buildObjectKey("materials", filename);
    const uploadUrl = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tải lên thất bại, vui lòng thử lại.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
