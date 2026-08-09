import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Bắt buộc chạy trên Node.js runtime, dùng getServerSession
export const runtime = "nodejs";

// Route này CHỈ cấp "client token" để trình duyệt tải tệp thẳng lên Vercel
// Blob (không đi qua server) — dùng cho tài liệu học / sách (PDF, Word,
// PowerPoint, âm thanh, file nén...) ở khu vực quản trị.
//
// Vì sao cần route riêng (không dùng chung /api/upload như trước): tải qua
// server (multipart form-data trong POST body) sẽ luôn dính giới hạn 4.5MB
// body request của Vercel Functions (lỗi 413 khi tệp lớn hơn, ví dụ PDF
// 31MB). Cách của Vercel Blob là: trình duyệt gọi route này để lấy 1 token
// ngắn hạn (chỉ vài trăm byte, không phải nội dung tệp — nên không bao giờ
// vượt giới hạn), rồi trình duyệt dùng token đó PUT thẳng file lên Blob
// storage. Xem PdfUploader.tsx và CourseMaterialsEditor.tsx (dùng
// upload() từ "@vercel/blob/client" trỏ handleUploadUrl vào route này).
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Chỉ admin được tải tài liệu học/sách lên — cùng điều kiện với
        // /api/upload trước đây.
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
          throw new Error("Không có quyền truy cập");
        }

        return {
          addRandomSuffix: true,
          // Không giới hạn dung lượng ở đây (giống hành vi cũ) — chỉ còn
          // phụ thuộc giới hạn của gói Vercel Blob.
        };
      },
      // Không cần onUploadCompleted: URL trả về thẳng cho trình duyệt qua
      // Promise của upload(), component tự lưu vào state — không cần server
      // ghi gì thêm vào lúc này (việc lưu vào MySQL diễn ra khi admin bấm
      // Lưu khoá học/sách, qua các route khác).
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tải lên thất bại, vui lòng thử lại.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
