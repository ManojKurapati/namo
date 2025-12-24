import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Define Role type locally since Prisma types are generated at db push
type Role = "ADMIN" | "OWNER" | "PARENT";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    throw new Error("No user found with this email");
                }

                const isPasswordValid = await compare(password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role as Role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email!;
                token.name = user.name;
                token.role = (user as { role: Role }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string | null;
                session.user.role = token.role as Role;
            }
            return session;
        },
        async signIn({ user, account }) {
            // For OAuth providers, create user if doesn't exist
            if (account?.provider === "google" && user.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "",
                            password: "", // OAuth users don't have passwords
                            role: "PARENT", // Default role for OAuth users
                            emailVerified: new Date(),
                        },
                    });
                }
            }
            return true;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    trustHost: true,
});
