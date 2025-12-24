import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { QuestionnaireForm } from "@/components/forms/questionnaire-form";
import { getASQInterval, calculateAgeInMonths } from "@/lib/asq-utils";
import Link from "next/link";

interface PageProps {
    params: Promise<{ childId: string }>;
}

export default async function AssessmentPage({ params }: PageProps) {
    const session = await auth();

    if (!session || session.user.role !== "PARENT") {
        redirect("/login");
    }

    const { childId } = await params;

    // Get child data
    const child = await prisma.child.findUnique({
        where: {
            id: childId,
            parentId: session.user.id
        },
    });

    if (!child) {
        notFound();
    }

    // Calculate age and ASQ interval
    const ageInMonths = calculateAgeInMonths(child.dateOfBirth);
    const asqInterval = getASQInterval(ageInMonths);

    // Get all questions for this age interval
    const questions = await prisma.questionnaire.findMany({
        where: {
            ageInterval: asqInterval,
            isActive: true,
        },
        orderBy: [
            { domain: 'asc' },
            { orderIndex: 'asc' }
        ]
    });

    // Check if child has a recent assessment for this interval
    const existingAssessment = await prisma.assessmentRecord.findFirst({
        where: {
            childId: childId,
            ageInterval: asqInterval,
        },
        orderBy: {
            completedAt: 'desc'
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            {/* Header */}
            <header className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <Link
                            href="/portal"
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Portal
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 mt-1">
                            ASQ Assessment for {child.name}
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="text-lg font-semibold text-gray-900">{ageInMonths} months</p>
                        <p className="text-xs text-emerald-600">ASQ-{asqInterval} Interval</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {existingAssessment && existingAssessment.completedAt ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h3 className="font-semibold text-amber-800">Previous Assessment Found</h3>
                                <p className="text-amber-700 text-sm mt-1">
                                    {child.name} already has an assessment for the ASQ-{asqInterval} interval completed on{" "}
                                    {new Date(existingAssessment.completedAt).toLocaleDateString()}.
                                    You can still complete a new assessment if needed.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {questions.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            No Questions Available
                        </h2>
                        <p className="text-gray-600 mb-6">
                            The ASQ-{asqInterval} questionnaire doesn&apos;t have any questions configured yet.
                            Please contact an administrator to add questions for this age interval.
                        </p>
                        <Link
                            href="/portal"
                            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            Return to Portal
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                            <h2 className="text-white font-semibold text-lg">
                                ASQ-{asqInterval} Questionnaire
                            </h2>
                            <p className="text-emerald-100 text-sm">
                                {questions.length} questions across 5 developmental domains
                            </p>
                        </div>

                        <div className="p-6">
                            <QuestionnaireForm
                                childId={childId}
                                questions={questions.map((q) => ({
                                    id: q.id,
                                    questionText: q.questionText,
                                    domain: q.domain,
                                    orderIndex: q.orderIndex,
                                    helpText: q.helpText,
                                }))}
                                asqInterval={asqInterval}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
