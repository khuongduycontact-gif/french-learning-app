import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSignInButton from "./AdminSignInButton";

export default async function AdminDangNhapPage() {
  const session = await getServerSession(authOptions);

  // Đã đăng nhập sẵn -> đưa thẳng vào đúng nơi thay vì hiện lại form đăng nhập
  if (session?.user) {
    if (session.user.role === "ADMIN") redirect("/admin");
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment px-6">
      <div className="w-full max-w-sm rounded-2xl border border-mist bg-white/60 p-10 text-center">
        <span className="font-display text-sm italic text-bordeaux">
          Khu vực quản trị
        </span>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          Đăng nhập Quản trị
        </h1>
        <div className="ribbon-rule my-6 mx-auto" />
        <p className="mb-6 text-sm text-ink/70">
          Đăng nhập bằng tài khoản Google được cấp quyền quản trị để truy cập
          trang quản lý khoá học.
        </p>
        <AdminSignInButton />
      </div>
    </div>
  );
}
