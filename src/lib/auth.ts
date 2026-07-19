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
    signIn: "/dang-nhap",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const isAdmin = ADMIN_EMAILS.includes(
          (user.email || "").toLowerCase()
        );
        // Đồng bộ role trong DB nếu email nằm trong danh sách ADMIN_EMAILS
        if (isAdmin && (user as any).role !== "ADMIN") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
          session.user.role = "ADMIN";
        } else {
          session.user.role = (user as any).role ?? "USER";
        }
      }
      return session;
    },
  },
};
