// Tải 1 tệp thẳng từ trình duyệt lên Backblaze B2 (không đi qua server Next.js)
// — tránh giới hạn 4.5MB body request của Vercel Functions, thay cho
// upload() của "@vercel/blob/client" trước đây. File này KHÔNG import gì
// khác ngoài kiểu dữ liệu, để dùng an toàn trong "use client" component
// (không kéo theo @aws-sdk/client-s3, vốn chỉ chạy được ở server).
//
// Gồm 2 bước:
// 1) Gọi `handleUploadUrl` (route Next.js, có kiểm tra đăng nhập/quyền —
//    xem src/app/api/upload/client/route.ts và
//    src/app/api/submissions/upload/client/route.ts) để xin 1 URL PUT có
//    chữ ký tạm thời (presigned URL) trỏ thẳng vào B2, cùng object `key`
//    tương ứng.
// 2) PUT nội dung tệp thẳng lên presigned URL đó bằng XMLHttpRequest (dùng
//    XHR thay vì fetch để lấy được sự kiện tiến trình tải lên, tương đương
//    onUploadProgress của @vercel/blob/client trước đây).
export type B2UploadResult = { key: string };

export async function uploadDocToB2({
  file,
  handleUploadUrl,
  onUploadProgress,
}: {
  file: File;
  handleUploadUrl: string;
  onUploadProgress?: (percentage: number) => void;
}): Promise<B2UploadResult> {
  const res = await fetch(handleUploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || undefined,
      size: file.size,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}) as { error?: string });
    throw new Error(data.error || "Tải lên thất bại, vui lòng thử lại.");
  }

  const { uploadUrl, key } = (await res.json()) as { uploadUrl: string; key: string };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    if (file.type) xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onUploadProgress) {
        onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("Tải lên thất bại, vui lòng thử lại."));
    };
    xhr.onerror = () => reject(new Error("Lỗi kết nối, vui lòng thử lại."));

    xhr.send(file);
  });

  return { key };
}
