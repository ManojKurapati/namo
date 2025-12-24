"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "PARENT" as "PARENT" | "OWNER" | "ADMIN",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }

            router.push("/login?registered=true");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative bg-slate-900/80 backdrop-blur-xl border-slate-700 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white"
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
                    <CardTitle className="text-2xl font-bold text-white">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Join ECD Portal - ASQ Assessment Platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                required
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-slate-300">
                                Role
                            </Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        role: value as "PARENT" | "OWNER" | "ADMIN",
                                    })
                                }
                            >
                                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="PARENT" className="text-white">
                                        Parent - Manage child profiles & assessments
                                    </SelectItem>
                                    <SelectItem value="OWNER" className="text-white">
                                        Owner - View business analytics
                                    </SelectItem>
                                    <SelectItem value="ADMIN" className="text-white">
                                        Admin - Manage content & videos
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                required
                                minLength={8}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-300">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                }
                                required
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2.5 shadow-lg shadow-emerald-500/25 transition-all duration-200"
                        >
                            {isLoading ? (
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
                                    Creating account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center">
                    <p className="text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
