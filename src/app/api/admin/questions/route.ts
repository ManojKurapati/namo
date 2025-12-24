import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const questionSchema = z.object({
    domain: z.enum([
        "COMMUNICATION",
        "GROSS_MOTOR",
        "FINE_MOTOR",
        "PROBLEM_SOLVING",
        "PERSONAL_SOCIAL",
    ]),
    ageInterval: z.number().min(2).max(60),
    questionText: z.string().min(10),
    orderIndex: z.number().min(1).max(10),
    helpText: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const domain = searchParams.get("domain");
        const ageInterval = searchParams.get("ageInterval");
        const search = searchParams.get("search");

        const where: any = { isActive: true };

        if (domain) where.domain = domain;
        if (ageInterval) where.ageInterval = parseInt(ageInterval);
        if (search) {
            where.questionText = { contains: search, mode: "insensitive" };
        }

        const questions = await prisma.questionnaire.findMany({
            where,
            orderBy: [{ ageInterval: "asc" }, { domain: "asc" }, { orderIndex: "asc" }],
        });

        return NextResponse.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json(
            { error: "Failed to fetch questions" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = questionSchema.parse(body);

        const question = await prisma.questionnaire.create({
            data: {
                domain: validatedData.domain,
                ageInterval: validatedData.ageInterval,
                questionText: validatedData.questionText,
                orderIndex: validatedData.orderIndex,
                helpText: validatedData.helpText,
            },
        });

        return NextResponse.json(question, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error("Error creating question:", error);
        return NextResponse.json(
            { error: "Failed to create question" },
            { status: 500 }
        );
    }
}
