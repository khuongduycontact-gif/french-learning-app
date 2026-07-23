import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

// Bắt buộc chạy trên Node.js runtime (dùng Buffer/stream), không dùng được Edge runtime
export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200MB
// Tệp tài liệu học (PDF, Word, PowerPoint, âm thanh...) không giới hạn dung
// lượng ở phía ứng dụng — chỉ còn phụ thuộc vào giới hạn của gói Cloudinary
// và của nền tảng hosting (xem ghi chú trong README).

// Các định dạng tài liệu học được phép: Word, PowerPoint, PDF, văn bản thuần,
// file nén, và các định dạng âm thanh (mp3, wav, m4a, aac, ogg, flac, wma)
const DOC_EXTENSIONS = /\.(pdf|docx?|pptx?|txt|zip|rar|7z|mp3|wav|m4a|aac|ogg|flac|wma)$/i;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
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

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");
  const isDoc = !isImage && !isVideo && (isAudio || DOC_EXTENSIONS.test(file.name));

  if (!isImage && !isVideo && !isDoc) {
    return NextResponse.json(
      { error: "Định dạng tệp không được hỗ trợ" },
      { status: 400 }
    );
  }

  // Tài liệu học (bao gồm âm thanh) không giới hạn dung lượng ở đây; chỉ ảnh
  // và video giới thiệu khoá học mới bị giới hạn.
  const maxBytes = isDoc ? null : isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (maxBytes && file.size > maxBytes) {
    return NextResponse.json(
      {
        error: `Tệp quá lớn. Giới hạn ${Math.round(maxBytes / 1024 / 1024)}MB.`,
      },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const resourceType = isVideo ? "video" : isDoc ? "raw" : "image";

  try {
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: isDoc
            ? "bonjour-francais/materials"
            : "bonjour-francais/courses",
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
