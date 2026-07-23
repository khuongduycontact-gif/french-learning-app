import { NextRequest, NextResponse } from "next/server";

// Tra loại từ (danh từ, động từ, tính từ, trạng từ...) cho từ tiếng Pháp
// bằng API công khai, miễn phí của Wiktionary (không cần API key).
// Wiktionary gộp mọi ngôn ngữ theo cùng cách viết vào 1 trang, nên ta chỉ
// lấy phần dữ liệu dưới khoá ngôn ngữ "fr" (tiếng Pháp).
export const runtime = "nodejs";

const POS_VI: Record<string, string> = {
  noun: "Danh từ",
  "proper noun": "Danh từ riêng",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
  pronoun: "Đại từ",
  preposition: "Giới từ",
  conjunction: "Liên từ",
  interjection: "Thán từ",
  article: "Mạo từ",
  determiner: "Từ hạn định",
  numeral: "Số từ",
  "proper-noun": "Danh từ riêng",
};

function normalizePos(pos: string): string {
  const key = pos.trim().toLowerCase();
  return POS_VI[key] || pos;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const word = (searchParams.get("word") || "").trim();

  if (!word) {
    return NextResponse.json({ error: "Thiếu từ cần tra" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(
        word.toLowerCase()
      )}`,
      {
        // Wikimedia khuyến nghị gửi kèm User-Agent mô tả ứng dụng gọi API
        headers: { "User-Agent": "BonjourFrancais-DictionaryLookup/1.0" },
        // Bộ nhớ đệm ngắn để đỡ gọi lặp lại với cùng 1 từ trong thời gian ngắn
        next: { revalidate: 60 * 60 * 24 },
      } as RequestInit
    );

    // Không tìm thấy mục từ (404) hoặc lỗi khác -> coi như không có dữ liệu
    // loại từ, không phải lỗi nghiêm trọng làm hỏng cả lượt tra nghĩa.
    if (!res.ok) {
      return NextResponse.json({ types: [] });
    }

    const data = await res.json().catch(() => null);
    const frEntries = Array.isArray(data?.fr) ? data.fr : [];

    const types = Array.from(
      new Set(
        frEntries
          .map((entry: any) =>
            typeof entry?.partOfSpeech === "string"
              ? normalizePos(entry.partOfSpeech)
              : null
          )
          .filter((v: string | null): v is string => !!v)
      )
    );

    return NextResponse.json({ types });
  } catch (err) {
    console.error("Lỗi tra loại từ (Wiktionary):", err);
    // Lỗi mạng/timeout khi tra loại từ -> trả rỗng, không chặn kết quả dịch chính
    return NextResponse.json({ types: [] });
  }
}
