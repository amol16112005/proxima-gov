import { describe, expect, it } from "vitest";
import { parseSessionToken, signSession } from "./session";

describe("session", () => {
  it("round-trips a signed session token", () => {
    const token = signSession({
      id: "c-1",
      role: "citizen",
      name: "Test",
      phone: "9876543210",
      constituencyId: "bangalore-south",
    });
    const payload = parseSessionToken(token);
    expect(payload?.id).toBe("c-1");
    expect(payload?.role).toBe("citizen");
  });

  it("rejects tampered tokens", () => {
    const token = signSession({
      id: "c-1",
      role: "citizen",
      name: "Test",
      phone: "9876543210",
      constituencyId: "bangalore-south",
    });
    const tampered = `${token.slice(0, -4)}xxxx`;
    expect(parseSessionToken(tampered)).toBeNull();
  });
});