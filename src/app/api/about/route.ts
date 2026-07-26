import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAboutPage, serializeAboutPage } from "@/lib/about";

// GET /api/about - công khai, ai cũng xem được (trang Giới thiệu)
export async function GET() {
  const about = await getAboutPage();
  return NextResponse.json(about);
}

function isNonEmptyString(v: unknown) {
  return typeof v === "string" && v.trim().length > 0;
}

// PUT /api/about - chỉ ADMIN, ghi đè toàn bộ nội dung trang Giới thiệu
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const {
    heroKicker,
    heroTitle,
    heroGreeting,
    heroDescription,
    heroImageUrl,
    heroBadgeUrl,
    timeline,
    reasons,
    methodTitle,
    methodImageUrl,
    methods,
  } = body;

  if (
    !isNonEmptyString(heroTitle) ||
    !isNonEmptyString(heroGreeting) ||
    !isNonEmptyString(heroDescription)
  ) {
    return NextResponse.json(
      { error: "Vui lòng nhập đầy đủ tiêu đề, lời chào và mô tả giới thiệu." },
      { status: 400 }
    );
  }

  const arrays = { timeline, reasons, methods };
  for (const [key, val] of Object.entries(arrays)) {
    if (val !== undefined && !Array.isArray(val)) {
      return NextResponse.json(
        { error: `Dữ liệu mục "${key}" không hợp lệ.` },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.aboutPage.upsert({
    where: { id: "main" },
    update: {
      ...(heroKicker !== undefined ? { heroKicker } : {}),
      heroTitle: heroTitle.trim(),
      heroGreeting: heroGreeting.trim(),
      heroDescription: heroDescription.trim(),
      ...(heroImageUrl !== undefined ? { heroImageUrl: heroImageUrl || null } : {}),
      ...(heroBadgeUrl !== undefined ? { heroBadgeUrl: heroBadgeUrl || null } : {}),
      ...(timeline !== undefined ? { timeline } : {}),
      ...(reasons !== undefined ? { reasons } : {}),
      ...(methodTitle !== undefined ? { methodTitle } : {}),
      ...(methodImageUrl !== undefined ? { methodImageUrl: methodImageUrl || null } : {}),
      ...(methods !== undefined ? { methods } : {}),
    },
    create: {
      id: "main",
      heroKicker: heroKicker || "Apprendre, c'est grandir",
      heroTitle: heroTitle.trim(),
      heroGreeting: heroGreeting.trim(),
      heroDescription: heroDescription.trim(),
      heroImageUrl: heroImageUrl || null,
      heroBadgeUrl: heroBadgeUrl || null,
      timeline: timeline || [],
      reasons: reasons || [],
      methodTitle: methodTitle || "Phương pháp giảng dạy",
      methodImageUrl: methodImageUrl || null,
      methods: methods || [],
    },
  });

  return NextResponse.json(serializeAboutPage(updated));
}
