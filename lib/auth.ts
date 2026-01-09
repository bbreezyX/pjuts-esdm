import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "./db";
import {
  checkRateLimit,
  incrementRateLimit,
  resetRateLimit,
  getLoginRateLimitKey,
} from "./rate-limit";

// Password requirements for enhanced security
// - Minimum 8 characters
// - At least one uppercase letter
// - At least one lowercase letter  
// - At least one number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Validation schema for sign in
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Dummy hash for timing attack prevention
// Pre-computed bcrypt hash of a random string
const DUMMY_HASH = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.E/XxH1d.sXuCGG";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@esdm.go.id" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials with Zod
          const { email, password } = await signInSchema.parseAsync(credentials);

          // Check rate limit before processing
          const rateLimitKey = getLoginRateLimitKey(email);
          const rateLimitCheck = checkRateLimit(rateLimitKey);

          if (!rateLimitCheck.success) {
            console.warn(`Rate limit exceeded for: ${email}`);
            // Still run bcrypt to prevent timing attacks
            await bcrypt.compare(password, DUMMY_HASH);
            return null;
          }

          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              isActive: true,
            },
          });

          // TIMING ATTACK PREVENTION:
          // Always compare password hash, even if user doesn't exist
          // This ensures consistent response time regardless of user existence
          const passwordToCompare = user?.password ?? DUMMY_HASH;
          const isValidPassword = await bcrypt.compare(password, passwordToCompare);

          if (!user || !isValidPassword) {
            // Increment rate limit counter on failed attempt
            incrementRateLimit(rateLimitKey);
            return null;
          }

          // Check if user account is disabled
          if (!user.isActive) {
            console.warn(`Login attempt from disabled account: ${email}`);
            return null;
          }

          // Reset rate limit on successful login
          resetRateLimit(rateLimitKey);

          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role ?? "FIELD_STAFF";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  trustHost: true,
});

// Type augmentation for NextAuth v5
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

