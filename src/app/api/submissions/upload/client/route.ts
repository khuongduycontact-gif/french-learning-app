import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildObjectKey, getPresignedUploadUrl } from "@/lib/b2";

// Bắt buộc chạy trên Node.js runtime, dùng getServerSession
export const runtime = "nodejs";

// Cấp 1 "URL PUT có chữ ký tạm thời" (presigned URL) để trình duyệt tải tệp
// bài nộp / bài đã chữa (dạng tài liệu — PDF, Word, PowerPoint, âm thanh,
// file nén...) thẳng lên Backblaze B2, tương tự
// src/app/api/upload/client/route.ts nhưng dành cho bài nộp (mọi người dùng
// đã đăng nhập, không chỉ admin). Xem giải thích lý do cần route riêng
// trong file đó.

const MAX_BYTES = 50 * 1024 * 1024; // 50MB / tệp bài tập — giữ nguyên giới hạn cũ

const DOC_EXTENSIONS =
  /\.(pdf|docx?|pptx?|xlsx?|txt|zip|rar|7z|mp3|wav|m4a|aac|ogg|flac|wma|jpe?g|png|gif|webp)$/i;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { filename, contentType, size } = (await request.json()) as {
      filename?: string;
      contentType?: string;
      size?: number;
    };
    if (!filename) {
      return NextResponse.json({ error: "Thiếu tên tệp" }, { status: 400 });
    }

    // Admin (gửi bài đã chữa) được tải bất kỳ định dạng tệp nào — học viên
    // nộp bài chỉ được các đuôi tệp tài liệu/âm thanh/ảnh đã liệt kê, cùng
    // điều kiện với /api/submissions/upload trước đây.
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && !DOC_EXTENSIONS.test(filename)) {
      return NextResponse.json({ error: "Định dạng tệp không được hỗ trợ" }, { status: 400 });
    }

    // LƯU Ý: đây chỉ là kiểm tra dựa trên `size` do trình duyệt khai báo —
    // không có gì đảm bảo trình duyệt khai đúng, vì tệp được PUT thẳng lên
    // B2 sau đó bằng presigned URL (server không đọc lại nội dung tệp để
    // đếm byte thật). Muốn giới hạn chắc chắn ở phía server cần chuyển sang
    // dùng presigned POST kèm điều kiện content-length-range — có thể hỏi
    // thêm nếu cần triển khai chặt hơn.
    if (typeof size === "number" && size > MAX_BYTES) {
      return NextResponse.json({ error: "Tệp vượt quá 50MB" }, { status: 400 });
    }

    const key = buildObjectKey("submissions", filename);
    const uploadUrl = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tải lên thất bại, vui lòng thử lại.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
