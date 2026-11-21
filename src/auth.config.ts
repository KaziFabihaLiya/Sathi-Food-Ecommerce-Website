import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        (session.user as { id?: string; email?: string; role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Initialized in auth.ts
};

export default authConfig;
