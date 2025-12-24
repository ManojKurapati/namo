import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDomainDisplayName, formatAge } from "@/lib/asq-utils";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

export default async function OwnerDashboard() {
    const session = await auth();

    if (!session || session.user.role !== "OWNER") {
        redirect("/login");
    }

    // Fetch analytics data (Server Component - no client fetching)
    const [
        totalParents,
        totalChildren,
        totalAssessments,
        completedAssessments,
        domainScores,
        recentAssessments,
        monthlyData,
    ] = await Promise.all([
        prisma.user.count({ where: { role: "PARENT" } }),
        prisma.child.count(),
        prisma.assessmentRecord.count(),
        prisma.assessmentRecord.count({ where: { status: "COMPLETED" } }),
        prisma.domainScore.groupBy({
            by: ["domain"],
            _avg: { totalScore: true },
            _count: true,
            where: { needsIntervention: true },
        }),
        prisma.assessmentRecord.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                child: true,
                domainScores: true,
            },
        }),
        prisma.assessmentRecord.groupBy({
            by: ["createdAt"],
            _count: true,
            orderBy: { createdAt: "desc" },
            take: 30,
        }),
    ]);

    const completionRate =
        totalAssessments > 0
            ? Math.round((completedAssessments / totalAssessments) * 100)
            : 0;

    // Process domain statistics
    const domainStats = domainScores.map((d) => ({
        domain: d.domain,
        averageScore: Math.round(d._avg.totalScore || 0),
        interventionCount: d._count,
    }));

    // Process monthly trends
    const monthlyTrends = processMonthlyData(monthlyData);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
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
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">ECD Portal</h1>
                                <p className="text-xs text-slate-400">Business Intelligence</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge
                                variant="outline"
                                className="border-amber-500/50 text-amber-400"
                            >
                                OWNER
                            </Badge>
                            <span className="text-sm text-slate-400">
                                {session.user.name || session.user.email}
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
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                                    <p className="text-2xl font-bold text-white">{totalParents}</p>
                                    <p className="text-sm text-slate-400">Active Parents</p>
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
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{totalChildren}</p>
                                    <p className="text-sm text-slate-400">Children Enrolled</p>
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
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {totalAssessments}
                                    </p>
                                    <p className="text-sm text-slate-400">Total Assessments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-amber-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {completionRate}%
                                    </p>
                                    <p className="text-sm text-slate-400">Completion Rate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <DashboardCharts
                        monthlyTrends={monthlyTrends}
                        domainStats={domainStats}
                    />
                </div>

                {/* Recent Assessments */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Assessments</CardTitle>
                        <CardDescription className="text-slate-400">
                            View anonymized aggregate data from recent assessments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                            Child Age
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                            Interval
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                            Domains Flagged
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAssessments.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-8 text-center text-slate-400"
                                            >
                                                No assessments yet
                                            </td>
                                        </tr>
                                    ) : (
                                        recentAssessments.map((assessment) => {
                                            const flaggedDomains = assessment.domainScores.filter(
                                                (d) => d.needsIntervention
                                            );
                                            const overallStatus =
                                                flaggedDomains.length > 2
                                                    ? "needs-intervention"
                                                    : flaggedDomains.length > 0
                                                        ? "needs-monitoring"
                                                        : "on-track";

                                            return (
                                                <tr
                                                    key={assessment.id}
                                                    className="border-b border-slate-700/50 hover:bg-slate-800/50"
                                                >
                                                    <td className="py-3 px-4 text-white">
                                                        {formatAge(assessment.ageAtAssessment)}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-300">
                                                        {assessment.ageInterval}mo ASQ
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                overallStatus === "on-track"
                                                                    ? "border-emerald-500/50 text-emerald-400"
                                                                    : overallStatus === "needs-monitoring"
                                                                        ? "border-amber-500/50 text-amber-400"
                                                                        : "border-red-500/50 text-red-400"
                                                            }
                                                        >
                                                            {overallStatus.replace("-", " ")}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {flaggedDomains.length === 0 ? (
                                                                <span className="text-slate-500">None</span>
                                                            ) : (
                                                                flaggedDomains.map((d) => (
                                                                    <Badge
                                                                        key={d.id}
                                                                        variant="secondary"
                                                                        className="bg-red-500/10 text-red-400 text-xs"
                                                                    >
                                                                        {getDomainDisplayName(d.domain).split(" ")[0]}
                                                                    </Badge>
                                                                ))
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-400 text-sm">
                                                        {new Date(assessment.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

function processMonthlyData(
    data: { createdAt: Date; _count: number }[]
): { month: string; count: number }[] {
    const monthCounts: Record<string, number> = {};

    data.forEach((item) => {
        const month = new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
        });
        monthCounts[month] = (monthCounts[month] || 0) + item._count;
    });

    return Object.entries(monthCounts)
        .map(([month, count]) => ({ month, count }))
        .slice(0, 6)
        .reverse();
}
