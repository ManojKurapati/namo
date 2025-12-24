import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const videoSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    videoUrl: z.string().url(),
    domain: z.enum([
        "COMMUNICATION",
        "GROSS_MOTOR",
        "FINE_MOTOR",
        "PROBLEM_SOLVING",
        "PERSONAL_SOCIAL",
    ]),
    minAgeInterval: z.number().min(2).max(60),
    maxAgeInterval: z.number().min(2).max(60),
    scoreThreshold: z.number().min(0).max(60),
});

export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const domain = searchParams.get("domain");

        const where: any = { isActive: true };
        if (domain) where.domain = domain;

        const videos = await prisma.interventionVideo.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        return NextResponse.json(
            { error: "Failed to fetch videos" },
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
        const validatedData = videoSchema.parse(body);

        if (validatedData.minAgeInterval > validatedData.maxAgeInterval) {
            return NextResponse.json(
                { error: "Min age must be <= max age" },
                { status: 400 }
            );
        }

        const video = await prisma.interventionVideo.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                videoUrl: validatedData.videoUrl,
                domain: validatedData.domain,
                minAgeInterval: validatedData.minAgeInterval,
                maxAgeInterval: validatedData.maxAgeInterval,
                scoreThreshold: validatedData.scoreThreshold,
            },
        });

        return NextResponse.json(video, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error("Error creating video:", error);
        return NextResponse.json(
            { error: "Failed to create video" },
            { status: 500 }
        );
    }
}
