/**
 * ASQ (Ages & Stages Questionnaires) Utility Functions
 * 
 * The ASQ-3 is organized by age intervals. This module handles:
 * - Calculating a child's age in months from their date of birth
 * - Determining the appropriate ASQ questionnaire interval
 * - Domain scoring and threshold checking
 */

// Define ASQDomain type locally since Prisma types are generated at db push
export type ASQDomain =
    | "COMMUNICATION"
    | "GROSS_MOTOR"
    | "FINE_MOTOR"
    | "PROBLEM_SOLVING"
    | "PERSONAL_SOCIAL";

// ASQ-3 age intervals in months
export const ASQ_AGE_INTERVALS = [
    2, 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30, 33, 36, 42, 48, 54, 60,
] as const;

// Age window for each interval (in days from target age)
const AGE_WINDOW_DAYS = 15;

/**
 * Calculate a child's age in months from their date of birth
 */
export function calculateAgeInMonths(dateOfBirth: Date): number {
    const now = new Date();
    const dob = new Date(dateOfBirth);

    let months = (now.getFullYear() - dob.getFullYear()) * 12;
    months += now.getMonth() - dob.getMonth();

    // Adjust if the day of month hasn't been reached yet
    if (now.getDate() < dob.getDate()) {
        months--;
    }

    return Math.max(0, months);
}

/**
 * Calculate age in months with decimal precision
 */
export function calculatePreciseAgeInMonths(dateOfBirth: Date): number {
    const now = new Date();
    const dob = new Date(dateOfBirth);

    const diffMs = now.getTime() - dob.getTime();
    const msPerMonth = 30.44 * 24 * 60 * 60 * 1000; // Average days per month

    return Math.max(0, diffMs / msPerMonth);
}

/**
 * Determine the appropriate ASQ interval for a given age in months
 * 
 * Rules:
 * - For each interval, the questionnaire can be administered within a window
 * - If between intervals, select the closest one
 * - If younger than 2 months, return 2 (earliest)
 * - If older than 60 months, return 60 (latest)
 */
export function getASQInterval(ageInMonths: number): number {
    // Handle edge cases
    if (ageInMonths < 2) return 2;
    if (ageInMonths >= 60) return 60;

    // Find the closest interval
    let closestInterval: number = ASQ_AGE_INTERVALS[0];
    let minDifference = Math.abs(ageInMonths - closestInterval);

    for (const interval of ASQ_AGE_INTERVALS) {
        const difference = Math.abs(ageInMonths - interval);

        // If we're past the target age, prefer the higher interval
        // e.g., a 7-month-old gets the 8-month questionnaire
        if (difference < minDifference) {
            minDifference = difference;
            closestInterval = interval;
        } else if (difference === minDifference && interval > closestInterval) {
            closestInterval = interval;
        }
    }

    return closestInterval;
}

/**
 * Get the next higher ASQ interval for a child's age
 * This is useful when a child is between intervals and should receive
 * the questionnaire for the upcoming age
 */
export function getNextASQInterval(ageInMonths: number): number {
    for (const interval of ASQ_AGE_INTERVALS) {
        if (interval > ageInMonths) {
            return interval;
        }
    }
    return 60; // Maximum interval
}

/**
 * Check if a child is within the valid age window for a specific interval
 */
export function isWithinAgeWindow(
    ageInMonths: number,
    interval: number
): boolean {
    const ageInDays = ageInMonths * 30.44;
    const intervalInDays = interval * 30.44;
    const difference = Math.abs(ageInDays - intervalInDays);

    return difference <= AGE_WINDOW_DAYS * 2; // Allow ±15 days
}

/**
 * Get all available intervals for a child's current age
 */
export function getAvailableIntervals(ageInMonths: number): number[] {
    return ASQ_AGE_INTERVALS.filter((interval) =>
        isWithinAgeWindow(ageInMonths, interval)
    );
}

// ============================================
// ASQ-3 CUTOFF SCORES BY DOMAIN AND AGE
// ============================================

// Cutoff scores indicate developmental concern
// Scores at or below these values suggest further evaluation
export const ASQ_CUTOFF_SCORES: Record<
    number | string,
    Record<ASQDomain, { cutoff: number; monitoring: number }>
> = {
    2: {
        COMMUNICATION: { cutoff: 15.31, monitoring: 24.96 },
        GROSS_MOTOR: { cutoff: 22.45, monitoring: 33.89 },
        FINE_MOTOR: { cutoff: 16.30, monitoring: 27.93 },
        PROBLEM_SOLVING: { cutoff: 21.29, monitoring: 31.75 },
        PERSONAL_SOCIAL: { cutoff: 17.87, monitoring: 28.59 },
    },
    4: {
        COMMUNICATION: { cutoff: 17.01, monitoring: 27.68 },
        GROSS_MOTOR: { cutoff: 19.04, monitoring: 33.02 },
        FINE_MOTOR: { cutoff: 20.24, monitoring: 33.15 },
        PROBLEM_SOLVING: { cutoff: 23.29, monitoring: 35.13 },
        PERSONAL_SOCIAL: { cutoff: 20.00, monitoring: 32.55 },
    },
    6: {
        COMMUNICATION: { cutoff: 13.52, monitoring: 26.19 },
        GROSS_MOTOR: { cutoff: 7.13, monitoring: 24.47 },
        FINE_MOTOR: { cutoff: 18.88, monitoring: 32.00 },
        PROBLEM_SOLVING: { cutoff: 21.09, monitoring: 34.05 },
        PERSONAL_SOCIAL: { cutoff: 16.47, monitoring: 29.44 },
    },
    8: {
        COMMUNICATION: { cutoff: 17.12, monitoring: 30.17 },
        GROSS_MOTOR: { cutoff: 17.53, monitoring: 33.81 },
        FINE_MOTOR: { cutoff: 24.04, monitoring: 38.01 },
        PROBLEM_SOLVING: { cutoff: 25.66, monitoring: 38.33 },
        PERSONAL_SOCIAL: { cutoff: 20.06, monitoring: 33.36 },
    },
    // Default thresholds for intervals not specifically defined
    default: {
        COMMUNICATION: { cutoff: 20, monitoring: 30 },
        GROSS_MOTOR: { cutoff: 20, monitoring: 30 },
        FINE_MOTOR: { cutoff: 20, monitoring: 30 },
        PROBLEM_SOLVING: { cutoff: 20, monitoring: 30 },
        PERSONAL_SOCIAL: { cutoff: 20, monitoring: 30 },
    },
};

/**
 * Get cutoff scores for a specific age interval and domain
 */
export function getCutoffScore(
    ageInterval: number,
    domain: ASQDomain
): { cutoff: number; monitoring: number } {
    const intervalScores =
        ASQ_CUTOFF_SCORES[ageInterval] || ASQ_CUTOFF_SCORES["default"];
    return intervalScores[domain];
}

/**
 * Determine if a score indicates the need for intervention
 */
export function needsIntervention(
    score: number,
    ageInterval: number,
    domain: ASQDomain
): boolean {
    const { cutoff } = getCutoffScore(ageInterval, domain);
    return score <= cutoff;
}

/**
 * Determine if a score indicates monitoring is needed
 */
export function needsMonitoring(
    score: number,
    ageInterval: number,
    domain: ASQDomain
): boolean {
    const { cutoff, monitoring } = getCutoffScore(ageInterval, domain);
    return score > cutoff && score <= monitoring;
}

/**
 * Get the development status based on score
 */
export function getDevelopmentStatus(
    score: number,
    ageInterval: number,
    domain: ASQDomain
): "on-track" | "needs-monitoring" | "needs-intervention" {
    if (needsIntervention(score, ageInterval, domain)) {
        return "needs-intervention";
    }
    if (needsMonitoring(score, ageInterval, domain)) {
        return "needs-monitoring";
    }
    return "on-track";
}

// ============================================
// ANSWER SCORING
// ============================================

export const ANSWER_SCORE_MAP = {
    YES: 10,
    SOMETIMES: 5,
    NOT_YET: 0,
} as const;

export type AnswerValue = keyof typeof ANSWER_SCORE_MAP;

/**
 * Calculate total score for a domain based on answers
 */
export function calculateDomainScore(
    answers: { answer: AnswerValue; score?: number }[]
): number {
    return answers.reduce((total, answer) => {
        const score = answer.score ?? ANSWER_SCORE_MAP[answer.answer];
        return total + score;
    }, 0);
}

/**
 * Calculate maximum possible score for a number of questions
 */
export function calculateMaxScore(questionCount: number): number {
    return questionCount * 10; // Each question max is 10 (YES)
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format age in months as a readable string
 */
export function formatAge(ageInMonths: number): string {
    if (ageInMonths < 12) {
        return `${ageInMonths} month${ageInMonths !== 1 ? "s" : ""}`;
    }

    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;

    if (months === 0) {
        return `${years} year${years !== 1 ? "s" : ""}`;
    }

    return `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""
        }`;
}

/**
 * Format interval as questionnaire name
 */
export function formatIntervalName(interval: number): string {
    return `${interval}-Month ASQ-3`;
}

/**
 * Get domain display name
 */
export function getDomainDisplayName(domain: ASQDomain): string {
    const names: Record<ASQDomain, string> = {
        COMMUNICATION: "Communication",
        GROSS_MOTOR: "Gross Motor",
        FINE_MOTOR: "Fine Motor",
        PROBLEM_SOLVING: "Problem Solving",
        PERSONAL_SOCIAL: "Personal-Social",
    };
    return names[domain];
}

/**
 * Get all ASQ domains in order
 */
export function getAllDomains(): ASQDomain[] {
    return [
        "COMMUNICATION",
        "GROSS_MOTOR",
        "FINE_MOTOR",
        "PROBLEM_SOLVING",
        "PERSONAL_SOCIAL",
    ];
}
