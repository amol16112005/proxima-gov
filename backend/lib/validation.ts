import { normalizeFreeText } from "@/lib/security/sanitize";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function validateRegistrationFields(input: {
  name?: string;
  email?: string;
  constituencyId?: string;
}): { ok: true; data: { name: string; email: string; constituencyId: string } } | { ok: false; error: string } {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const constituencyId = input.constituencyId?.trim() ?? "";

  if (!name) return { ok: false, error: "Please enter your full name." };
  if (!email || !isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!constituencyId) return { ok: false, error: "Please select your constituency." };

  return { ok: true, data: { name, email, constituencyId } };
}

const SUBMISSION_PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_SUBMISSION_PHOTO_LENGTH = 700_000;

export function validateSubmissionPhoto(photoUrl: unknown): string | null {
  if (photoUrl === undefined || photoUrl === null || photoUrl === "") return null;
  if (typeof photoUrl !== "string") return "Invalid photo format.";
  if (!SUBMISSION_PHOTO_RE.test(photoUrl)) {
    return "Photo must be a JPG, PNG, or WebP image.";
  }
  if (photoUrl.length > MAX_SUBMISSION_PHOTO_LENGTH) {
    return "Photo is too large. Please use a smaller image.";
  }
  return null;
}

export function validateIssueSubmission(body: {
  category?: string;
  title?: string;
  description?: string;
  location?: string;
  photoUrl?: unknown;
}):
  | {
      ok: true;
      data: {
        category: string;
        title: string;
        description: string;
        location: string;
        submissionPhotoUrl?: string;
      };
    }
  | { ok: false; error: string } {
  const categoryRaw = body.category?.trim() ?? "";
  const titleRaw = body.title?.trim() ?? "";
  const descriptionRaw = body.description?.trim() ?? "";
  const locationRaw = body.location?.trim() ?? "";

  if (!categoryRaw || !titleRaw || !descriptionRaw || !locationRaw) {
    return { ok: false, error: "All fields are required." };
  }
  if (titleRaw.length > 200) return { ok: false, error: "Title must be 200 characters or fewer." };
  if (descriptionRaw.length > 5000) {
    return { ok: false, error: "Description must be 5000 characters or fewer." };
  }
  if (locationRaw.length > 300) {
    return { ok: false, error: "Location must be 300 characters or fewer." };
  }

  const category = normalizeFreeText(categoryRaw, 80);
  const title = normalizeFreeText(titleRaw, 200);
  const description = normalizeFreeText(descriptionRaw, 5000);
  const location = normalizeFreeText(locationRaw, 300);

  const photoError = validateSubmissionPhoto(body.photoUrl);
  if (photoError) return { ok: false, error: photoError };

  const submissionPhotoUrl =
    typeof body.photoUrl === "string" && body.photoUrl.trim() ? body.photoUrl.trim() : undefined;

  return {
    ok: true,
    data: { category, title, description, location, submissionPhotoUrl },
  };
}