import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MySubmissionsClient from "@/components/MySubmissionsClient";

export default async function MySubmissionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  return <MySubmissionsClient />;
}
