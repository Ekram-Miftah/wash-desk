import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse({
          email: String(raw?.email ?? "").trim(),
          password: String(raw?.password ?? ""),
        });
        if (!parsed.success) {
          console.log("[login-debug] input rejected (email format or empty password)");
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
          console.log("[login-debug] no user found with that email");
          return null;
        }

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) {
          console.log("[login-debug] password does not match");
          return null;
        }

        console.log("[login-debug] success");
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});