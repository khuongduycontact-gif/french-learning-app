import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/dang-nhap");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr]">
      <aside className="h-fit rounded-2xl border border-mist bg-white/60 p-4">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
          Quản trị
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin" className="rounded-lg px-3 py-2 font-medium text-ink hover:bg-mist">
            Tổng quan
          </Link>
          <Link
            href="/admin/courses"
            className="rounded-lg px-3 py-2 font-medium text-ink hover:bg-mist"
          >
            Khoá học
          </Link>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
