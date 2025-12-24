import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
    calculateDomainScore,
    getCutoffScore,
    needsIntervention,
} from "@/lib/asq-utils";

// Define types inline since Prisma enums are generated at db push
type ASQDomain =
    | "COMMUNICATION"
    | "GROSS_MOTOR"
    | "FINE_MOTOR"
    | "PROBLEM_SOLVING"
    | "PERSONAL_SOCIAL";

type AnswerType = "YES" | "SOMETIMES" | "NOT_YET";

const assessmentSchema = z.object({
    childId: z.string(),
    ageInterval: z.number(),
    answers: z.array(
        z.object({
            questionId: z.string(),
            answer: z.enum(["YES", "SOMETIMES", "NOT_YET"]),
            score: z.number(),
        })
    ),
});

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "PARENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = assessmentSchema.parse(body);

        // Verify child belongs to parent
        const child = await prisma.child.findFirst({
            where: {
                id: validatedData.childId,
                parentId: session.user.id,
            },
        });

        if (!child) {
            return NextResponse.json({ error: "Child not found" }, { status: 404 });
        }

        // Calculate age at assessment
        const ageAtAssessment = Math.floor(
            (Date.now() - child.dateOfBirth.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
        );

        // Create assessment record
        const assessment = await prisma.assessmentRecord.create({
            data: {
                childId: validatedData.childId,
                ageAtAssessment,
                ageInterval: validatedData.ageInterval,
                status: "COMPLETED",
                completedAt: new Date(),
                answers: {
                    create: validatedData.answers.map((a: { questionId: string; answer: AnswerType; score: number }) => ({
                        questionId: a.questionId,
                        answer: a.answer,
                        score: a.score,
                    })),
                },
            },
            include: {
                answers: {
                    include: {
                        question: true,
                    },
                },
            },
        });

        // Calculate domain scores
        const domains: ASQDomain[] = [
            "COMMUNICATION",
            "GROSS_MOTOR",
            "FINE_MOTOR",
            "PROBLEM_SOLVING",
            "PERSONAL_SOCIAL",
        ];

        for (const domain of domains) {
            const domainAnswers = assessment.answers.filter(
                (a: { question: { domain: string } }) => a.question.domain === domain
            );

            if (domainAnswers.length > 0) {
                const totalScore = domainAnswers.reduce((sum: number, a: { score: number }) => sum + a.score, 0);
                const maxPossibleScore = domainAnswers.length * 10;
                const { cutoff } = getCutoffScore(validatedData.ageInterval, domain as any);
                const needsHelp = needsIntervention(
                    totalScore,
                    validatedData.ageInterval,
                    domain as any
                );

                await prisma.domainScore.create({
                    data: {
                        assessmentId: assessment.id,
                        domain,
                        totalScore,
                        maxPossibleScore,
                        threshold: Math.round(cutoff),
                        needsIntervention: needsHelp,
                    },
                });
            }
        }

        // Fetch complete assessment with scores
        const completeAssessment = await prisma.assessmentRecord.findUnique({
            where: { id: assessment.id },
            include: {
                domainScores: true,
                child: true,
            },
        });

        return NextResponse.json(completeAssessment, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error("Error creating assessment:", error);
        return NextResponse.json(
            { error: "Failed to create assessment" },
            { status: 500 }
        );
    }
}
