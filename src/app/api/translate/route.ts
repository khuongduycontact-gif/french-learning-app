import { NextRequest, NextResponse } from "next/server";

// Proxy dịch thuật qua DeepL API. Đặt ở server để không lộ API key ra
// client (nếu gọi thẳng từ trình duyệt sẽ vừa lộ key vừa dính CORS).
//
// DeepL cấp 2 loại key:
// - Key Free  (hậu tố ":fx")  -> gọi tới api-free.deepl.com
// - Key Pro   (không có hậu tố này) -> gọi tới api.deepl.com
// Route này tự nhận diện dựa trên hậu tố của key, không cần cấu hình thêm.
function resolveDeepLEndpoint(apiKey: string) {
  const isFreeKey = apiKey.trim().endsWith(":fx");
  return isFreeKey
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
}

// Route này CỐ Ý để công khai (không bắt đăng nhập) vì widget tra từ điển
// (DictionaryLookup) hiển thị cho mọi khách truy cập trang, kể cả chưa đăng
// nhập. Nhưng vì mỗi lượt gọi tốn quota/tiền DeepL của chủ site, cần chặn
// bớt lạm dụng bằng 2 lớp:
// 1. Giới hạn độ dài văn bản (đây là tra từ/cụm từ, không phải dịch văn
//    bản dài) - chặn việc lợi dụng route này để dịch miễn phí nội dung lớn.
// 2. Giới hạn số lượt gọi theo IP trong một khoảng thời gian ngắn.
const MAX_TEXT_LENGTH = 200;

// Rate limit đơn giản lưu trong bộ nhớ tiến trình (đủ dùng cho quy mô nhỏ
// của app này). LƯU Ý: không dùng được nếu deploy nhiều instance/serverless
// tách biệt vùng nhớ - khi đó nên thay bằng giải pháp có lưu trữ dùng chung
// (VD Upstash Redis) nếu lượng truy cập lớn.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Chưa cấu hình DEEPL_API_KEY trên server. Vui lòng thêm biến môi trường này (xem .env.example).",
      },
      { status: 500 }
    );
  }

  if (isRateLimited(getClientIp(req))) {
    return NextResponse.json(
      { error: "Bạn tra từ quá nhanh, vui lòng thử lại sau ít phút." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const text: string = (body?.text?.trim() || "").slice(0, MAX_TEXT_LENGTH);
  const sourceLang: string = body?.sourceLang || "FR";
  const targetLang: string = body?.targetLang || "VI";

  if (!text) {
    return NextResponse.json({ error: "Thiếu nội dung cần dịch." }, { status: 400 });
  }

  try {
    const endpoint = resolveDeepLEndpoint(apiKey);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: JSON.stringify({
        text: [text],
        source_lang: sourceLang,
        target_lang: targetLang,
      }),
    });

    if (!res.ok) {
      // DeepL trả 456 khi hết hạn mức (quota) tháng của key Free.
      const status = res.status === 456 ? 429 : res.status;
      const message =
        res.status === 456
          ? "Tài khoản DeepL đã hết hạn mức dịch trong tháng này."
          : "Không gọi được dịch vụ DeepL, vui lòng thử lại.";
      return NextResponse.json({ error: message }, { status });
    }

    const data = await res.json();
    const translated: string | undefined = data?.translations?.[0]?.text;
    if (!translated) {
      return NextResponse.json({ error: "Không tra được từ này." }, { status: 502 });
    }

    return NextResponse.json({ translation: translated });
  } catch {
    return NextResponse.json(
      { error: "Không gọi được dịch vụ DeepL, vui lòng thử lại." },
      { status: 502 }
    );
  }
}
