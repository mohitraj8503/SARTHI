import { EducationLevel, PlatformSegment } from "@prisma/client";

/**
 * Educational classification mapping:
 *
 * CRITICAL BUSINESS RULES:
 * 1. Existing confirmed MAIN users ALWAYS remain MAIN, even if educationLevel is missing/null.
 * 2. Existing confirmed JUNIOR users ALWAYS remain JUNIOR.
 * 3. For new/unclassified users:
 *    - CLASS_6 through CLASS_12 -> JUNIOR
 *    - GRADUATION, POST_GRADUATION, WORKING_PROFESSIONAL -> MAIN
 *    - OTHER:
 *        school-related evidence -> JUNIOR
 *        college/degree evidence -> MAIN
 *        unresolved -> PENDING
 *    - null / empty:
 *        -> PENDING (prompts onboarding)
 */

const JUNIOR_LEVELS: EducationLevel[] = [
  EducationLevel.CLASS_6,
  EducationLevel.CLASS_7,
  EducationLevel.CLASS_8,
  EducationLevel.CLASS_9,
  EducationLevel.CLASS_10,
  EducationLevel.CLASS_11,
  EducationLevel.CLASS_12,
];

const MAIN_LEVELS: EducationLevel[] = [
  EducationLevel.GRADUATION,
  EducationLevel.POST_GRADUATION,
  EducationLevel.WORKING_PROFESSIONAL,
];

const SCHOOL_KEYWORDS = [
  "school",
  "vidyalaya",
  "academy",
  "dps",
  "dav",
  "convent",
  "matric",
  "matriculation",
  "secondary",
  "high school",
  "k-12",
  "k12",
  "s.k.v",
  "skv",
  "public school",
];

const COLLEGE_KEYWORDS = [
  "university",
  "college",
  "institute",
  "iilm",
  "arka jain",
  "psit",
  "sies",
  "iit",
  "nit",
  "engineering",
  "technology",
  "b.tech",
  "btech",
  "bca",
  "mca",
  "b.sc",
  "bsc",
  "bba",
  "mba",
  "degree",
  "polytechnic",
];

export interface ClassificationContext {
  existingSegment?: PlatformSegment | string | null;
  collegeOrSchoolName?: string | null;
  gradeOrStream?: string | null;
  lastQualification?: string | null;
  currentCourse?: string | null;
  hasInternshipHistory?: boolean;
}

/**
 * Single source of truth for platform segment classification.
 */
export function determinePlatformSegment(
  educationLevel?: EducationLevel | string | null,
  context?: ClassificationContext
): PlatformSegment {
  // Rule 1: An established MAIN user always stays MAIN
  if (context?.existingSegment === PlatformSegment.MAIN || context?.existingSegment === "MAIN") {
    return PlatformSegment.MAIN;
  }

  // Rule 2: An established JUNIOR user stays JUNIOR unless explicitly re-classified
  if (context?.existingSegment === PlatformSegment.JUNIOR || context?.existingSegment === "JUNIOR") {
    // If they explicitly onboarded into graduation/college, allow upward progression
    if (educationLevel && MAIN_LEVELS.includes(educationLevel as EducationLevel)) {
      return PlatformSegment.MAIN;
    }
    return PlatformSegment.JUNIOR;
  }

  // Rule 3: Direct EducationLevel match
  if (educationLevel) {
    if (JUNIOR_LEVELS.includes(educationLevel as EducationLevel)) {
      return PlatformSegment.JUNIOR;
    }
    if (MAIN_LEVELS.includes(educationLevel as EducationLevel)) {
      return PlatformSegment.MAIN;
    }
  }

  // Rule 4: Contextual analysis for OTHER or missing level
  if (context) {
    if (context.hasInternshipHistory) {
      return PlatformSegment.MAIN;
    }

    const combinedText = [
      context.collegeOrSchoolName,
      context.gradeOrStream,
      context.lastQualification,
      context.currentCourse,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (combinedText) {
      const hasCollegeSignal = COLLEGE_KEYWORDS.some((kw) => combinedText.includes(kw));
      const hasSchoolSignal = SCHOOL_KEYWORDS.some((kw) => combinedText.includes(kw));

      if (hasCollegeSignal) {
        return PlatformSegment.MAIN;
      }
      if (hasSchoolSignal) {
        return PlatformSegment.JUNIOR;
      }
    }
  }

  // If level was explicit OTHER but without clear signals
  if (educationLevel === EducationLevel.OTHER) {
    return PlatformSegment.PENDING;
  }

  // Default for unclassified / incomplete new users
  return PlatformSegment.PENDING;
}

/**
 * Returns user-friendly human-readable label for education level.
 */
export function formatEducationLevel(level?: EducationLevel | string | null): string {
  if (!level) return "Profile Incomplete";
  const str = String(level);
  if (str.startsWith("CLASS_")) {
    return `Class ${str.replace("CLASS_", "")}`;
  }
  switch (str) {
    case "GRADUATION":
      return "Graduation / College";
    case "POST_GRADUATION":
      return "Post Graduation";
    case "WORKING_PROFESSIONAL":
      return "Working Professional";
    case "OTHER":
      return "Other";
    default:
      return str;
  }
}
