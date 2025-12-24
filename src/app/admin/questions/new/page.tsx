"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ASQ_AGE_INTERVALS, getAllDomains, getDomainDisplayName } from "@/lib/asq-utils";

const questionSchema = z.object({
    domain: z.enum([
        "COMMUNICATION",
        "GROSS_MOTOR",
        "FINE_MOTOR",
        "PROBLEM_SOLVING",
        "PERSONAL_SOCIAL",
    ]),
    ageInterval: z.number().min(2).max(60),
    questionText: z.string().min(10, "Question must be at least 10 characters"),
    orderIndex: z.number().min(1).max(10),
    helpText: z.string().optional(),
});

type FormData = z.infer<typeof questionSchema>;

export default function AddQuestionPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            orderIndex: 1,
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/admin/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Failed to add question");
            }

            router.push("/admin");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const domains = getAllDomains();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/admin"
                    className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to Admin Dashboard
                </Link>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">
                            Add ASQ Question
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Create a new questionnaire item for a specific domain and age
                            interval
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="domain" className="text-slate-300">
                                        Domain
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("domain", value as FormData["domain"])
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                            <SelectValue placeholder="Select domain" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            {domains.map((domain) => (
                                                <SelectItem
                                                    key={domain}
                                                    value={domain}
                                                    className="text-white"
                                                >
                                                    {getDomainDisplayName(domain)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.domain && (
                                        <p className="text-sm text-red-400">
                                            {errors.domain.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ageInterval" className="text-slate-300">
                                        Age Interval (months)
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("ageInterval", parseInt(value))
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                            <SelectValue placeholder="Select age" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            {ASQ_AGE_INTERVALS.map((age) => (
                                                <SelectItem
                                                    key={age}
                                                    value={age.toString()}
                                                    className="text-white"
                                                >
                                                    {age} months
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.ageInterval && (
                                        <p className="text-sm text-red-400">
                                            {errors.ageInterval.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="questionText" className="text-slate-300">
                                    Question Text
                                </Label>
                                <Textarea
                                    id="questionText"
                                    {...register("questionText")}
                                    placeholder="Enter the question text..."
                                    rows={4}
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                />
                                {errors.questionText && (
                                    <p className="text-sm text-red-400">
                                        {errors.questionText.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="helpText" className="text-slate-300">
                                    Help Text (optional)
                                </Label>
                                <Textarea
                                    id="helpText"
                                    {...register("helpText")}
                                    placeholder="Additional instructions or examples..."
                                    rows={2}
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="orderIndex" className="text-slate-300">
                                    Question Order (1-10)
                                </Label>
                                <Input
                                    id="orderIndex"
                                    type="number"
                                    min={1}
                                    max={10}
                                    {...register("orderIndex", { valueAsNumber: true })}
                                    className="bg-slate-800/50 border-slate-700 text-white w-24"
                                />
                                {errors.orderIndex && (
                                    <p className="text-sm text-red-400">
                                        {errors.orderIndex.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                    {isSubmitting ? "Adding..." : "Add Question"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
