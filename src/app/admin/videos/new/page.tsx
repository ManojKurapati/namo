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

const videoSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    videoUrl: z.string().url("Must be a valid URL"),
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

type FormData = z.infer<typeof videoSchema>;

export default function AddVideoPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(videoSchema),
        defaultValues: {
            minAgeInterval: 2,
            maxAgeInterval: 60,
            scoreThreshold: 25,
        },
    });

    const onSubmit = async (data: FormData) => {
        if (data.minAgeInterval > data.maxAgeInterval) {
            setError("Minimum age must be less than or equal to maximum age");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/admin/videos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Failed to add video");
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
                            Add Intervention Video
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Link a video to a specific domain with score-based display logic
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
                                <Label htmlFor="title" className="text-slate-300">
                                    Video Title
                                </Label>
                                <Input
                                    id="title"
                                    {...register("title")}
                                    placeholder="Enter video title"
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-400">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="videoUrl" className="text-slate-300">
                                    Video URL
                                </Label>
                                <Input
                                    id="videoUrl"
                                    {...register("videoUrl")}
                                    placeholder="https://youtube.com/watch?v=... or Vimeo/Cloud URL"
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                />
                                <p className="text-xs text-slate-500">
                                    Supports YouTube, Vimeo, or Google Cloud Storage URLs
                                </p>
                                {errors.videoUrl && (
                                    <p className="text-sm text-red-400">
                                        {errors.videoUrl.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-300">
                                    Description (optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    {...register("description")}
                                    placeholder="Brief description of the video content..."
                                    rows={3}
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="domain" className="text-slate-300">
                                    Target Domain
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minAgeInterval" className="text-slate-300">
                                        Min Age (months)
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("minAgeInterval", parseInt(value))
                                        }
                                        defaultValue="2"
                                    >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                            <SelectValue />
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
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxAgeInterval" className="text-slate-300">
                                        Max Age (months)
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("maxAgeInterval", parseInt(value))
                                        }
                                        defaultValue="60"
                                    >
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                            <SelectValue />
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
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <div className="space-y-2">
                                    <Label htmlFor="scoreThreshold" className="text-amber-400">
                                        Score Threshold
                                    </Label>
                                    <Input
                                        id="scoreThreshold"
                                        type="number"
                                        min={0}
                                        max={60}
                                        {...register("scoreThreshold", { valueAsNumber: true })}
                                        className="bg-slate-800/50 border-slate-700 text-white w-32"
                                    />
                                    <p className="text-sm text-amber-400/80">
                                        Video will be shown to parents if their child&apos;s domain
                                        score is below this threshold
                                    </p>
                                </div>
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
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                >
                                    {isSubmitting ? "Adding..." : "Add Video"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
