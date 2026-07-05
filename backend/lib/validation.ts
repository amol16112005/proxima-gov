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

export function validateIssueSubmission(body: {
  category?: string;
  title?: string;
  description?: string;
  location?: string;
}): { ok: true; data: { category: string; title: string; description: string; location: string } } | { ok: false; error: string } {
  const category = body.category?.trim() ?? "";
  const title = body.title?.trim() ?? "";
  const description = body.description?.trim() ?? "";
  const location = body.location?.trim() ?? "";

  if (!category || !title || !description || !location) {
    return { ok: false, error: "All fields are required." };
  }
  if (title.length > 200) return { ok: false, error: "Title must be 200 characters or fewer." };
  if (description.length > 5000) {
    return { ok: false, error: "Description must be 5000 characters or fewer." };
  }

  return { ok: true, data: { category, title, description, location } };
}