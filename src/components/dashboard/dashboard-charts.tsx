"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Define types inline since Prisma enums are generated at db push
type ASQDomain =
    | "COMMUNICATION"
    | "GROSS_MOTOR"
    | "FINE_MOTOR"
    | "PROBLEM_SOLVING"
    | "PERSONAL_SOCIAL";

const DOMAIN_DISPLAY_NAMES: Record<ASQDomain, string> = {
    COMMUNICATION: "Communication",
    GROSS_MOTOR: "Gross Motor",
    FINE_MOTOR: "Fine Motor",
    PROBLEM_SOLVING: "Problem Solving",
    PERSONAL_SOCIAL: "Personal-Social",
};

interface DashboardChartsProps {
    monthlyTrends: { month: string; count: number }[];
    domainStats: {
        domain: ASQDomain;
        averageScore: number;
        interventionCount: number;
    }[];
}

const COLORS = [
    "#8b5cf6", // purple
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
];

export function DashboardCharts({
    monthlyTrends,
    domainStats,
}: DashboardChartsProps) {
    const pieData = domainStats.map((d) => ({
        name: DOMAIN_DISPLAY_NAMES[d.domain].split(" ")[0],
        value: d.interventionCount,
    }));

    return (
        <>
            {/* Monthly Trends Chart */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Assessment Trends</CardTitle>
                    <CardDescription className="text-slate-400">
                        Monthly assessment completion over time
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {monthlyTrends.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500">
                            No data available yet
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f2937",
                                        border: "1px solid #374151",
                                        borderRadius: "8px",
                                        color: "#f3f4f6",
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="url(#colorGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <defs>
                                    <linearGradient
                                        id="colorGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Domain Interventions Pie Chart */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Interventions by Domain</CardTitle>
                    <CardDescription className="text-slate-400">
                        Distribution of flagged assessments across development areas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pieData.every((d) => d.value === 0) ? (
                        <div className="h-64 flex items-center justify-center text-slate-500">
                            No interventions flagged yet
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f2937",
                                        border: "1px solid #374151",
                                        borderRadius: "8px",
                                        color: "#f3f4f6",
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ color: "#9ca3af" }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
