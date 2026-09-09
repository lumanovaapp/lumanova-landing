// Single source of truth for password rules — shared by signup, the
// forgot-password reset flow (app/update-password), and the settings
// change-password flow, so "strong password" means the same thing and looks
// the same (checklist + strength bar) everywhere a user sets one.

export interface PasswordRequirement {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { key: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { key: "number", label: "One number", test: (p) => /[0-9]/.test(p) },
  {
    key: "special",
    label: "One special character",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export interface CheckedRequirement extends PasswordRequirement {
  met: boolean;
}

export function checkPasswordRequirements(password: string): CheckedRequirement[] {
  return PASSWORD_REQUIREMENTS.map((req) => ({ ...req, met: req.test(password) }));
}

export function passwordMeetsRequirements(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((req) => req.test(password));
}

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

// Weak/medium track how many of the 4 base rules are satisfied; once all 4
// are met, length is the tiebreaker between "medium" (just clears the bar)
// and "strong" (12+ chars) — rewards going beyond the minimum without
// requiring it, since canSubmit only ever requires the base 4.
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty";
  const metCount = PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length;
  if (metCount <= 1) return "weak";
  if (metCount <= 3) return "medium";
  return password.length >= 12 ? "strong" : "medium";
}
