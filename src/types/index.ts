// Type definitions for ECD Portal

// Define types locally since Prisma types are generated at db push
export type Role = "ADMIN" | "OWNER" | "PARENT";

export type ASQDomain =
    | "COMMUNICATION"
    | "GROSS_MOTOR"
    | "FINE_MOTOR"
    | "PROBLEM_SOLVING"
    | "PERSONAL_SOCIAL";

export type AnswerType = "YES" | "SOMETIMES" | "NOT_YET";

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    role: Role;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends AuthCredentials {
    name: string;
    role?: Role;
}

// ============================================
// CHILD TYPES
// ============================================

export interface ChildProfile {
    id: string;
    name: string;
    dateOfBirth: Date;
    gender?: string | null;
    notes?: string | null;
    parentId: string;
    ageInMonths: number;
}

export interface CreateChildInput {
    name: string;
    dateOfBirth: Date;
    gender?: string;
    notes?: string;
}

// ============================================
// ASQ QUESTIONNAIRE TYPES
// ============================================

export interface ASQQuestion {
    id: string;
    domain: ASQDomain;
    ageInterval: number;
    questionText: string;
    orderIndex: number;
    helpText?: string | null;
}

export interface ASQAnswer {
    questionId: string;
    answer: AnswerType;
    score: number;
}

export interface DomainScoreResult {
    domain: ASQDomain;
    totalScore: number;
    maxPossibleScore: number;
    threshold: number;
    needsIntervention: boolean;
}

export interface AssessmentResult {
    id: string;
    childId: string;
    childName: string;
    ageAtAssessment: number;
    ageInterval: number;
    domainScores: DomainScoreResult[];
    completedAt: Date;
}

// ============================================
// ASQ INTERVAL MAPPING
// ============================================

// ASQ-3 age intervals in months
export const ASQ_INTERVALS = [
    2, 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30, 33, 36, 42, 48, 54, 60,
] as const;

export type ASQInterval = (typeof ASQ_INTERVALS)[number];

// Answer scoring
export const ANSWER_SCORES: Record<AnswerType, number> = {
    YES: 10,
    SOMETIMES: 5,
    NOT_YET: 0,
};

// Domain display names
export const DOMAIN_LABELS: Record<ASQDomain, string> = {
    COMMUNICATION: "Communication",
    GROSS_MOTOR: "Gross Motor",
    FINE_MOTOR: "Fine Motor",
    PROBLEM_SOLVING: "Problem Solving",
    PERSONAL_SOCIAL: "Personal-Social",
};

// ============================================
// INTERVENTION VIDEO TYPES
// ============================================

export interface InterventionVideoData {
    id: string;
    title: string;
    description?: string | null;
    videoUrl: string;
    thumbnailUrl?: string | null;
    duration?: number | null;
    domain: ASQDomain;
    minAgeInterval: number;
    maxAgeInterval: number;
    scoreThreshold: number;
}

// ============================================
// DASHBOARD ANALYTICS TYPES
// ============================================

export interface DashboardMetrics {
    totalParents: number;
    totalChildren: number;
    totalAssessments: number;
    completionRate: number;
    assessmentsByMonth: MonthlyData[];
    scoresByDomain: DomainAnalytics[];
    recentAssessments: RecentAssessment[];
}

export interface MonthlyData {
    month: string;
    count: number;
}

export interface DomainAnalytics {
    domain: ASQDomain;
    averageScore: number;
    interventionRate: number;
}

export interface RecentAssessment {
    id: string;
    childAge: number;
    ageInterval: number;
    completedAt: Date;
    overallStatus: "on-track" | "needs-monitoring" | "needs-intervention";
}

// ============================================
// FORM TYPES
// ============================================

export interface QuestionnaireFormData {
    childId: string;
    answers: Record<string, AnswerType>;
}

export interface QuestionFormInput {
    domain: ASQDomain;
    ageInterval: number;
    questionText: string;
    orderIndex: number;
    helpText?: string;
}

export interface VideoFormInput {
    title: string;
    description?: string;
    videoUrl: string;
    domain: ASQDomain;
    minAgeInterval: number;
    maxAgeInterval: number;
    scoreThreshold: number;
}
