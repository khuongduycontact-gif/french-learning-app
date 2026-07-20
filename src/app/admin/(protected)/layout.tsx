import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen">
      <AdminHeader />

      <div className="grid gap-8 px-6 py-10 md:grid-cols-[minmax(220px,auto)_1fr] md:px-10">
        <AdminSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
