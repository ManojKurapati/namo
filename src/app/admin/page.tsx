import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminDashboard() {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login");
    }

    // Fetch stats
    const [questionCount, videoCount, userCount, assessmentCount] =
        await Promise.all([
            prisma.questionnaire.count({ where: { isActive: true } }),
            prisma.interventionVideo.count({ where: { isActive: true } }),
            prisma.user.count(),
            prisma.assessmentRecord.count(),
        ]);

    // Fetch recent questions
    const recentQuestions = await prisma.questionnaire.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    // Fetch recent videos
    const recentVideos = await prisma.interventionVideo.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
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
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">ECD Portal</h1>
                                <p className="text-xs text-slate-400">Admin Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge
                                variant="outline"
                                className="border-red-500/50 text-red-400"
                            >
                                ADMIN
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
                {/* Stats Grid */}
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
                                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{questionCount}</p>
                                    <p className="text-sm text-slate-400">Questions</p>
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
                                    <p className="text-2xl font-bold text-white">{videoCount}</p>
                                    <p className="text-sm text-slate-400">Videos</p>
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
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{userCount}</p>
                                    <p className="text-sm text-slate-400">Users</p>
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
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {assessmentCount}
                                    </p>
                                    <p className="text-sm text-slate-400">Assessments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Content Management */}
                <Tabs defaultValue="questions" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <TabsList className="bg-slate-800 border border-slate-700">
                            <TabsTrigger
                                value="questions"
                                className="data-[state=active]:bg-slate-700"
                            >
                                Questions
                            </TabsTrigger>
                            <TabsTrigger
                                value="videos"
                                className="data-[state=active]:bg-slate-700"
                            >
                                Videos
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex gap-3">
                            <Link href="/admin/questions/new">
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
                                    Add Question
                                </Button>
                            </Link>
                            <Link href="/admin/videos/new">
                                <Button
                                    variant="outline"
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
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
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Add Video
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <TabsContent value="questions">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Recent Questions</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Manage ASQ questionnaire items by age interval and domain
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentQuestions.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        No questions added yet. Click &quot;Add Question&quot; to get started.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-700">
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                                        Domain
                                                    </th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                                        Age (months)
                                                    </th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                                        Question
                                                    </th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                                        Status
                                                    </th>
                                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentQuestions.map((question) => (
                                                    <tr
                                                        key={question.id}
                                                        className="border-b border-slate-700/50 hover:bg-slate-800/50"
                                                    >
                                                        <td className="py-3 px-4">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-purple-500/50 text-purple-400"
                                                            >
                                                                {question.domain.replace("_", " ")}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-white">
                                                            {question.ageInterval}mo
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                                                            {question.questionText}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge
                                                                variant={
                                                                    question.isActive ? "default" : "secondary"
                                                                }
                                                                className={
                                                                    question.isActive
                                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                                                        : ""
                                                                }
                                                            >
                                                                {question.isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-slate-400 hover:text-white"
                                                            >
                                                                Edit
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="mt-4 text-center">
                                    <Link href="/admin/questions">
                                        <Button
                                            variant="outline"
                                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                        >
                                            View All Questions
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="videos">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">
                                    Intervention Videos
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Manage videos linked to ASQ domains and score thresholds
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentVideos.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        No videos added yet. Click &quot;Add Video&quot; to get started.
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {recentVideos.map((video) => (
                                            <Card
                                                key={video.id}
                                                className="bg-slate-900/50 border-slate-700"
                                            >
                                                <CardContent className="pt-4">
                                                    <div className="flex gap-4">
                                                        <div className="w-24 h-16 rounded-lg bg-slate-800 flex items-center justify-center">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-8 w-8 text-slate-600"
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
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-white">
                                                                {video.title}
                                                            </h4>
                                                            <p className="text-sm text-slate-400 mt-1">
                                                                {video.domain.replace("_", " ")} • Ages{" "}
                                                                {video.minAgeInterval}-{video.maxAgeInterval}mo
                                                            </p>
                                                            <p className="text-xs text-amber-400 mt-1">
                                                                Show if score &lt; {video.scoreThreshold}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 text-center">
                                    <Link href="/admin/videos">
                                        <Button
                                            variant="outline"
                                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                        >
                                            View All Videos
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
