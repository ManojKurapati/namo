import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const childSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    dateOfBirth: z.string().transform((val) => new Date(val)),
    gender: z.string().optional(),
    notes: z.string().optional(),
});

export async function GET() {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const children = await prisma.child.findMany({
            where: { parentId: session.user.id },
            include: {
                assessments: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(children);
    } catch (error) {
        console.error("Error fetching children:", error);
        return NextResponse.json(
            { error: "Failed to fetch children" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "PARENT") {
            return NextResponse.json(
                { error: "Only parents can add children" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = childSchema.parse(body);

        const child = await prisma.child.create({
            data: {
                name: validatedData.name,
                dateOfBirth: validatedData.dateOfBirth,
                gender: validatedData.gender,
                notes: validatedData.notes,
                parentId: session.user.id,
            },
        });

        return NextResponse.json(child, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error("Error creating child:", error);
        return NextResponse.json(
            { error: "Failed to add child" },
            { status: 500 }
        );
    }
}
