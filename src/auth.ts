import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import authConfig from "./auth.config";

export class InvalidCredentialsError extends CredentialsSignin {
  code = "Invalid credentials";
}

export class TooManyAttemptsError extends CredentialsSignin {
  code = "Too many attempts, try later";
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new InvalidCredentialsError();
        }

        const { email, password } = parsed.data;

        const user = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!user) {
          throw new InvalidCredentialsError();
        }

        const now = new Date();

        // 1. Account lock check
        if (user.lockedUntil && user.lockedUntil > now) {
          throw new TooManyAttemptsError();
        }

        // 2. Compare password with bcrypt hash
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          const lockExpired = user.lockedUntil && user.lockedUntil <= now;
          const currentAttempts = lockExpired ? 0 : user.failedAttempts;
          const newFailedAttempts = currentAttempts + 1;
          const isLockedNow = newFailedAttempts >= 5;
          const lockedUntil = isLockedNow ? new Date(now.getTime() + 15 * 60 * 1000) : null;

          await prisma.adminUser.update({
            where: { id: user.id },
            data: {
              failedAttempts: newFailedAttempts,
              lockedUntil: isLockedNow ? lockedUntil : (lockExpired ? null : user.lockedUntil),
            },
          });

          if (isLockedNow) {
            throw new TooManyAttemptsError();
          }

          throw new InvalidCredentialsError();
        }

        // 3. Reset failed attempts & lock on successful login
        if (user.failedAttempts > 0 || user.lockedUntil !== null) {
          await prisma.adminUser.update({
            where: { id: user.id },
            data: {
              failedAttempts: 0,
              lockedUntil: null,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: "Admin",
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
});

export { requireAdmin } from "@/lib/auth";
