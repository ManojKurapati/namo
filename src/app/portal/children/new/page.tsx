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

const childSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    dateOfBirth: z.string().refine((val) => {
        const date = new Date(val);
        return date <= new Date() && date >= new Date("2018-01-01");
    }, "Please enter a valid date of birth"),
    gender: z.string().optional(),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof childSchema>;

export default function AddChildPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(childSchema),
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/children", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    dateOfBirth: new Date(data.dateOfBirth).toISOString(),
                }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Failed to add child");
            }

            router.push("/portal");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
            <div className="max-w-lg mx-auto">
                <Link
                    href="/portal"
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
                    Back to Dashboard
                </Link>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                        </div>
                        <CardTitle className="text-2xl text-white">Add a Child</CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter your child&apos;s information to start tracking their
                            development
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">
                                    Child&apos;s Name
                                </Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="Enter child's name"
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-400">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth" className="text-slate-300">
                                    Date of Birth
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    {...register("dateOfBirth")}
                                    max={new Date().toISOString().split("T")[0]}
                                    className="bg-slate-800/50 border-slate-700 text-white focus:border-purple-500"
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-sm text-red-400">
                                        {errors.dateOfBirth.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-slate-300">
                                    Gender (optional)
                                </Label>
                                <Select onValueChange={(value) => setValue("gender", value)}>
                                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white focus:border-purple-500">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="male" className="text-white">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="female" className="text-white">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="other" className="text-white">
                                            Other
                                        </SelectItem>
                                        <SelectItem value="prefer-not-to-say" className="text-white">
                                            Prefer not to say
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-slate-300">
                                    Notes (optional)
                                </Label>
                                <Textarea
                                    id="notes"
                                    {...register("notes")}
                                    placeholder="Any additional notes about your child..."
                                    rows={3}
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                                />
                            </div>

                            <div className="flex gap-4">
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
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                />
                                            </svg>
                                            Adding...
                                        </span>
                                    ) : (
                                        "Add Child"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
