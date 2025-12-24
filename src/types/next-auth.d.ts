// TypeScript type extensions for NextAuth
import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
  }
}
