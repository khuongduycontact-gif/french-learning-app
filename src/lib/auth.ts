import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const isAdmin = ADMIN_EMAILS.includes(
          (user.email || "").toLowerCase()
        );
        const currentRole = (user as any).role ?? "USER";
        // Đồng bộ role trong DB theo đúng danh sách ADMIN_EMAILS hiện tại:
        // - Email có trong danh sách nhưng DB chưa phải ADMIN -> nâng quyền.
        // - Email KHÔNG còn trong danh sách nhưng DB vẫn đang là ADMIN ->
        //   hạ quyền lại về USER (trường hợp admin bị gỡ khỏi ADMIN_EMAILS).
        // Nếu không xử lý nhánh hạ quyền, một tài khoản từng là admin sẽ giữ
        // quyền ADMIN vĩnh viễn trong DB dù đã bị xoá khỏi ADMIN_EMAILS.
        const targetRole = isAdmin ? "ADMIN" : "USER";
        if (currentRole !== targetRole) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: targetRole },
          });
          session.user.role = targetRole;
        } else {
          session.user.role = currentRole;
        }
      }
      return session;
    },
  },
};
