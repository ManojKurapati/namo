"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError(null);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setLoginError(result.error);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setLoginError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl });
    };

    return (
        <Card className="w-full max-w-md relative bg-slate-900/80 backdrop-blur-xl border-slate-700 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
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
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                    Welcome Back
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Sign in to ECD Portal - ASQ Assessment Platform
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {(error || loginError) && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {loginError || "Authentication failed. Please try again."}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5 shadow-lg shadow-purple-500/25 transition-all duration-200"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center">
                <p className="text-sm text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Create one
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}

function LoadingFallback() {
    return (
        <Card className="w-full max-w-md relative bg-slate-900/80 backdrop-blur-xl border-slate-700 shadow-2xl">
            <CardContent className="py-12 text-center">
                <div className="flex justify-center">
                    <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            </div>
            <Suspense fallback={<LoadingFallback />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
