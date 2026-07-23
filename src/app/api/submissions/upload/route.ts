import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

// Bắt buộc chạy trên Node.js runtime (dùng Buffer/stream), không dùng được Edge runtime
export const runtime = "nodejs";

// Dùng riêng cho tệp bài nộp / bài đã chữa: khác với /api/upload (chỉ admin
// được dùng, cho ảnh/video/tài liệu khoá học), route này cho phép bất kỳ
// người dùng đã đăng nhập nào tải lên (học viên nộp bài, admin gửi bài đã
// chữa), và lưu vào một thư mục riêng trên Cloudinary.

const MAX_BYTES = 50 * 1024 * 1024; // 50MB / tệp bài tập

const DOC_EXTENSIONS = /\.(pdf|docx?|pptx?|xlsx?|txt|zip|rar|7z|mp3|wav|m4a|aac|ogg|flac|wma|jpe?g|png|gif|webp)$/i;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Thiếu tệp tải lên" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "Tệp rỗng (0 byte), vui lòng chọn tệp có nội dung." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Tệp quá lớn. Giới hạn ${Math.round(MAX_BYTES / 1024 / 1024)}MB.` },
      { status: 400 }
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");
  // Admin (gửi bài đã chữa) được tải lên bất kỳ định dạng tệp nào — chỉ
  // giới hạn định dạng ở phía học viên (nộp bài làm).
  const isDoc = !isImage && !isVideo && (isAdmin || isAudio || DOC_EXTENSIONS.test(file.name));

  if (!isAdmin && !isImage && !isVideo && !isDoc) {
    return NextResponse.json(
      { error: "Định dạng tệp không được hỗ trợ" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const resourceType = isVideo ? "video" : isImage ? "image" : "raw";

  try {
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "bonjour-francais/submissions",
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      fileName: file.name,
      fileType: file.type,
    });
  } catch (err) {
    console.error("Lỗi tải lên Cloudinary:", err);
    const detail =
      err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message)
        : "";
    return NextResponse.json(
      {
        error: detail
          ? `Tải lên thất bại: ${detail}`
          : "Tải lên thất bại, vui lòng thử lại.",
      },
      { status: 500 }
    );
  }
}
