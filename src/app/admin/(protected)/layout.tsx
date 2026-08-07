import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import AdminShell from "@/components/AdminShell";
import { AdminDrawerProvider } from "@/components/AdminDrawerContext";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <AdminDrawerProvider>
      <div className="min-h-screen">
        <AdminHeader />
        <AdminShell>{children}</AdminShell>
      </div>
    </AdminDrawerProvider>
  );
}
