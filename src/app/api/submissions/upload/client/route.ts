import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Bắt buộc chạy trên Node.js runtime, dùng getServerSession
export const runtime = "nodejs";

// Cấp "client token" để trình duyệt tải tệp bài nộp / bài đã chữa (dạng tài
// liệu — PDF, Word, PowerPoint, âm thanh, file nén...) thẳng lên Vercel
// Blob, tương tự src/app/api/upload/client/route.ts nhưng dành cho bài nộp
// (mọi người dùng đã đăng nhập, không chỉ admin). Xem giải thích lý do cần
// route riêng trong file đó.

const MAX_BYTES = 50 * 1024 * 1024; // 50MB / tệp bài tập — giữ nguyên giới hạn cũ

const DOC_EXTENSIONS =
  /\.(pdf|docx?|pptx?|xlsx?|txt|zip|rar|7z|mp3|wav|m4a|aac|ogg|flac|wma|jpe?g|png|gif|webp)$/i;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
          throw new Error("Vui lòng đăng nhập");
        }

        // Admin (gửi bài đã chữa) được tải bất kỳ định dạng tệp nào — học
        // viên nộp bài chỉ được các đuôi tệp tài liệu/âm thanh/ảnh đã liệt
        // kê, cùng điều kiện với /api/submissions/upload trước đây.
        const isAdmin = session.user.role === "ADMIN";
        if (!isAdmin && !DOC_EXTENSIONS.test(pathname)) {
          throw new Error("Định dạng tệp không được hỗ trợ");
        }

        return {
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_BYTES,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tải lên thất bại, vui lòng thử lại.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
