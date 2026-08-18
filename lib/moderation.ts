const forbiddenPhrases = [
  "admin",
  "official support",
  "sahaan admin",
  "support team",
  "system account"
];

const profanityFragments = [
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "whore",
  "slut",
  "nigger",
  "faggot"
];

const urlPattern = /(https?:\/\/|www\.|\.com\b|\.net\b|\.org\b|\.io\b)/i;
const repeatedPattern = /(.)\1{5,}/u;
const symbolHeavyPattern = /^[^\p{L}\p{N}]+$/u;

export function moderationIssue(value: string, field: "fullName" | "jobSkill"): string | null {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  if (trimmed.length < 2) return `${field} is too short.`;
  if (trimmed.length > (field === "fullName" ? 80 : 120)) return `${field} is too long.`;
  if (urlPattern.test(trimmed)) return "URLs are not allowed in profile fields.";
  if (repeatedPattern.test(trimmed)) return "Repeated characters are not allowed.";
  if (symbolHeavyPattern.test(trimmed)) return "Profile fields must contain a name or skill, not only symbols.";
  if ((trimmed.match(/[^\p{L}\p{N}\s.'-]/gu) ?? []).length > 4) {
    return "Profile fields contain too many symbols.";
  }

  if (field === "fullName") {
    const normalized = lower.replace(/\s+/g, " ");
    if (forbiddenPhrases.some((phrase) => normalized === phrase || normalized.includes(phrase))) {
      return "Names cannot impersonate Sahaan Admin Hub or support accounts.";
    }
  }

  if (profanityFragments.some((fragment) => lower.includes(fragment))) {
    return "Profile fields cannot contain profanity, slurs or harassment.";
  }

  return null;
}

export function validateModeratedProfile(fullName: string, jobSkill: string) {
  const fullNameIssue = moderationIssue(fullName, "fullName");
  if (fullNameIssue) return { ok: false as const, issue: fullNameIssue };

  const jobSkillIssue = moderationIssue(jobSkill, "jobSkill");
  if (jobSkillIssue) return { ok: false as const, issue: jobSkillIssue };

  return { ok: true as const };
}
