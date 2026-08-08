import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const website = await prisma.trustedWebsite.findUnique({ where: { id: params.id } });
  if (!website) {
    return NextResponse.json({ error: "Không tìm thấy website" }, { status: 404 });
  }
  return NextResponse.json(website);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const { name, link, description, coverImage } = body;

  const website = await prisma.trustedWebsite.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(link !== undefined ? { link } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(coverImage !== undefined ? { coverImage: coverImage || null } : {}),
    },
  });

  return NextResponse.json(website);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  await prisma.trustedWebsite.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
