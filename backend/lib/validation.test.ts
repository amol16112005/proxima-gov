import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  validateIssueSubmission,
  validateRegistrationFields,
  validateSubmissionPhoto,
} from "./validation";

describe("validation", () => {
  it("validates email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("validates registration fields", () => {
    expect(
      validateRegistrationFields({
        name: "Asha",
        email: "asha@example.com",
        constituencyId: "bangalore-south",
      }).ok
    ).toBe(true);
    expect(validateRegistrationFields({ name: "", email: "x", constituencyId: "" }).ok).toBe(
      false
    );
  });

  it("validates issue submissions and rejects oversized titles", () => {
    const ok = validateIssueSubmission({
      category: "infrastructure",
      title: "Road repair",
      description: "Potholes on main street",
      location: "Jayanagar",
    });
    expect(ok.ok).toBe(true);

    const bad = validateIssueSubmission({
      category: "infrastructure",
      title: "x".repeat(201),
      description: "desc",
      location: "loc",
    });
    expect(bad.ok).toBe(false);
  });

  it("accepts issue submissions without a photo", () => {
    const result = validateIssueSubmission({
      category: "infrastructure",
      title: "Road repair",
      description: "Potholes on main street",
      location: "Jayanagar",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.submissionPhotoUrl).toBeUndefined();
    }
  });

  it("accepts optional compressed photo data URLs", () => {
    const photoUrl = "data:image/jpeg;base64,/9j/4AAQ";
    expect(validateSubmissionPhoto(photoUrl)).toBeNull();
    const result = validateIssueSubmission({
      category: "infrastructure",
      title: "Road repair",
      description: "Potholes on main street",
      location: "Jayanagar",
      photoUrl,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.submissionPhotoUrl).toBe(photoUrl);
    }
  });

  it("rejects invalid photo payloads", () => {
    expect(validateSubmissionPhoto("https://example.com/photo.jpg")).toMatch(/JPG/i);
    expect(
      validateIssueSubmission({
        category: "infrastructure",
        title: "Road repair",
        description: "Potholes",
        location: "Jayanagar",
        photoUrl: "not-a-photo",
      }).ok
    ).toBe(false);
  });
});