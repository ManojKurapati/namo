import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
    calculateAgeInMonths,
    getASQInterval,
    formatAge,
} from "@/lib/asq-utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ParentPortal() {
    const session = await auth();

    if (!session || session.user.role !== "PARENT") {
        redirect("/login");
    }

    // Fetch children for this parent
    const children = await prisma.child.findMany({
        where: { parentId: session.user.id },
        include: {
            assessments: {
                orderBy: { createdAt: "desc" },
                take: 1,
                include: {
                    domainScores: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-white"
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
                            <div>
                                <h1 className="text-lg font-semibold text-white">ECD Portal</h1>
                                <p className="text-xs text-slate-400">Parent Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">
                                Welcome, {session.user.name || session.user.email}
                            </span>
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut({ redirectTo: "/login" });
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-purple-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {children.length}
                                    </p>
                                    <p className="text-sm text-slate-400">Children</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-emerald-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {children.reduce((sum, c) => sum + c.assessments.length, 0)}
                                    </p>
                                    <p className="text-sm text-slate-400">Assessments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-blue-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">0</p>
                                    <p className="text-sm text-slate-400">Recommended Videos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Children Section */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">My Children</h2>
                    <Link href="/portal/children/new">
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Add Child
                        </Button>
                    </Link>
                </div>

                {children.length === 0 ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">
                                No children added yet
                            </h3>
                            <p className="text-slate-400 mb-6">
                                Add your first child to start tracking their development
                            </p>
                            <Link href="/portal/children/new">
                                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                    Add Your First Child
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {children.map((child) => {
                            const ageInMonths = calculateAgeInMonths(child.dateOfBirth);
                            const recommendedInterval = getASQInterval(ageInMonths);
                            const latestAssessment = child.assessments[0];

                            return (
                                <Card
                                    key={child.id}
                                    className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl font-bold text-white">
                                                    {child.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-white text-lg">
                                                        {child.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-slate-400">
                                                        {formatAge(ageInMonths)} old
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="border-purple-500/50 text-purple-400"
                                            >
                                                {recommendedInterval}mo ASQ
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {latestAssessment ? (
                                            <div className="space-y-4">
                                                <p className="text-sm text-slate-400">
                                                    Last assessment:{" "}
                                                    {new Date(
                                                        latestAssessment.createdAt
                                                    ).toLocaleDateString()}
                                                </p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {latestAssessment.domainScores.map((score) => (
                                                        <Badge
                                                            key={score.id}
                                                            variant={
                                                                score.needsIntervention
                                                                    ? "destructive"
                                                                    : "outline"
                                                            }
                                                            className={
                                                                score.needsIntervention
                                                                    ? ""
                                                                    : "border-emerald-500/50 text-emerald-400"
                                                            }
                                                        >
                                                            {score.domain.replace("_", " ")}:{" "}
                                                            {score.totalScore}/{score.maxPossibleScore}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400">
                                                No assessments yet
                                            </p>
                                        )}
                                        <div className="flex gap-3 mt-6">
                                            <Link
                                                href={`/portal/assessment/${child.id}`}
                                                className="flex-1"
                                            >
                                                <Button
                                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                                    size="sm"
                                                >
                                                    Start Assessment
                                                </Button>
                                            </Link>
                                            <Link href={`/portal/children/${child.id}`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                                >
                                                    View History
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
