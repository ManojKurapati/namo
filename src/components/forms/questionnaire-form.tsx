"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

// Define types locally to avoid Prisma client import issues
type ASQDomain = "COMMUNICATION" | "GROSS_MOTOR" | "FINE_MOTOR" | "PROBLEM_SOLVING" | "PERSONAL_SOCIAL";
type AnswerType = "YES" | "SOMETIMES" | "NOT_YET";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    getAllDomains,
    getDomainDisplayName,
    ANSWER_SCORE_MAP,
    formatIntervalName,
} from "@/lib/asq-utils";

// ============================================
// TYPES
// ============================================

interface Question {
    id: string;
    domain: string;
    questionText: string;
    orderIndex: number;
    helpText?: string | null;
}

interface QuestionnaireFormProps {
    childId: string;
    questions: Question[];
    asqInterval: number;
}

// Form schema
const questionAnswerSchema = z.record(
    z.string(),
    z.enum(["YES", "SOMETIMES", "NOT_YET"])
);

type FormData = z.infer<typeof questionAnswerSchema>;

// ============================================
// COMPONENT
// ============================================

export function QuestionnaireForm({
    childId,
    questions,
    asqInterval,
}: QuestionnaireFormProps) {
    const router = useRouter();
    const domains = getAllDomains();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Group questions by domain
    const questionsByDomain = domains.reduce((acc, domain) => {
        acc[domain] = questions.filter((q) => q.domain === domain);
        return acc;
    }, {} as Record<ASQDomain, Question[]>);

    // Get domains that have questions
    const activeDomains = domains.filter(
        (domain) => questionsByDomain[domain].length > 0
    );

    const currentDomain = activeDomains[currentStep];
    const currentQuestions = questionsByDomain[currentDomain] || [];
    const totalSteps = activeDomains.length;
    const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

    // Initialize form with empty answers
    const {
        watch,
        setValue,
        handleSubmit,
    } = useForm<FormData>({
        resolver: zodResolver(questionAnswerSchema),
        defaultValues: {},
    });

    const watchedAnswers = watch();

    // Check if current step is complete
    const isCurrentStepComplete = currentQuestions.every(
        (q) => watchedAnswers[q.id]
    );

    // Check if all questions are answered
    const isFormComplete = questions.every((q) => watchedAnswers[q.id]);

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFormSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const answers = Object.entries(data).map(([questionId, answer]) => ({
                questionId,
                answer: answer as AnswerType,
                score: ANSWER_SCORE_MAP[answer as keyof typeof ANSWER_SCORE_MAP],
            }));

            const response = await fetch('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    childId,
                    ageInterval: asqInterval,
                    answers,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit assessment');
            }

            // Redirect to portal on success
            router.push('/portal?success=true');
        } catch (error) {
            console.error("Error submitting questionnaire:", error);
            setSubmitError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAnswerButtonClass = (
        questionId: string,
        answer: AnswerType
    ): string => {
        const currentAnswer = watchedAnswers[questionId];
        const baseClass =
            "flex-1 py-4 px-3 rounded-lg border-2 transition-all duration-200 text-center font-medium";

        if (currentAnswer === answer) {
            switch (answer) {
                case "YES":
                    return `${baseClass} border-emerald-500 bg-emerald-500/20 text-emerald-400`;
                case "SOMETIMES":
                    return `${baseClass} border-amber-500 bg-amber-500/20 text-amber-400`;
                case "NOT_YET":
                    return `${baseClass} border-red-500 bg-red-500/20 text-red-400`;
            }
        }

        return `${baseClass} border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-700/50`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Badge
                        variant="outline"
                        className="mb-4 border-purple-500/50 text-purple-400"
                    >
                        {formatIntervalName(asqInterval)}
                    </Badge>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        ASQ Development Assessment
                    </h1>
                    <p className="text-slate-400">
                        Answer each question based on your child&apos;s current abilities
                    </p>
                    {submitError && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                            {submitError}
                        </div>
                    )}
                </div>

                {/* Progress */}
                <Card className="mb-6 bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">
                                Step {currentStep + 1} of {totalSteps}
                            </span>
                            <span className="text-sm font-medium text-purple-400">
                                {Math.round(progress)}% Complete
                            </span>
                        </div>
                        <Progress value={progress} className="h-2 bg-slate-700" />
                        <div className="flex justify-between mt-4">
                            {activeDomains.map((domain, index) => (
                                <button
                                    key={domain}
                                    onClick={() => setCurrentStep(index)}
                                    className={`text-xs px-2 py-1 rounded transition-colors ${index === currentStep
                                        ? "bg-purple-500/20 text-purple-400"
                                        : index < currentStep
                                            ? "text-emerald-400"
                                            : "text-slate-500"
                                        }`}
                                >
                                    {getDomainDisplayName(domain).split(" ")[0]}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Current Domain Card */}
                <Card className="bg-slate-800/50 border-slate-700 mb-6">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                    {currentStep + 1}
                                </span>
                            </div>
                            <div>
                                <CardTitle className="text-xl text-white">
                                    {getDomainDisplayName(currentDomain)}
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    {currentQuestions.length} questions in this section
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <form onSubmit={handleSubmit(handleFormSubmit)}>
                            {currentQuestions
                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                .map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="p-6 rounded-xl bg-slate-900/50 border border-slate-700 mb-4"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-300">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-white text-lg leading-relaxed">
                                                    {question.questionText}
                                                </p>
                                                {question.helpText && (
                                                    <p className="mt-2 text-sm text-slate-400 italic">
                                                        {question.helpText}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 ml-12">
                                            {(["YES", "SOMETIMES", "NOT_YET"] as const).map(
                                                (answer) => (
                                                    <button
                                                        key={answer}
                                                        type="button"
                                                        onClick={() =>
                                                            setValue(question.id, answer, {
                                                                shouldValidate: true,
                                                            })
                                                        }
                                                        className={getAnswerButtonClass(question.id, answer)}
                                                    >
                                                        <div className="text-sm mb-1">
                                                            {answer === "YES"
                                                                ? "Yes"
                                                                : answer === "SOMETIMES"
                                                                    ? "Sometimes"
                                                                    : "Not Yet"}
                                                        </div>
                                                        <div className="text-xs opacity-75">
                                                            ({ANSWER_SCORE_MAP[answer]} pts)
                                                        </div>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </form>
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                            ← Previous
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        {currentStep < totalSteps - 1 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={!isCurrentStepComplete}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                Next →
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit(handleFormSubmit)}
                                disabled={!isFormComplete || isSubmitting}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    "Submit Assessment"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
