import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["PARENT", "OWNER", "ADMIN"]).default("PARENT"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hash(validatedData.password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
                role: validatedData.role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return NextResponse.json(
            { message: "User created successfully", user },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
