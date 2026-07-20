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

  const body = await req.json().catch(() => null);
  const text: string = body?.text?.trim() || "";
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
