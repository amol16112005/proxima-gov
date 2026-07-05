import { describe, expect, it } from "vitest";
import { getMpByUsername, verifyMpCredentials } from "./mpRegistry";

describe("mpRegistry", () => {
  it("finds MPs by username case-insensitively", () => {
    const mp = getMpByUsername("MP.BANGALORE-SOUTH");
    expect(mp?.constituencyId).toBe("bangalore-south");
  });

  it("verifies correct PIN and rejects invalid credentials", () => {
    expect(verifyMpCredentials("mp.bangalore-south", "495830")?.username).toBe(
      "mp.bangalore-south"
    );
    expect(verifyMpCredentials("mp.bangalore-south", "000000")).toBeUndefined();
    expect(verifyMpCredentials("mp.unknown", "495830")).toBeUndefined();
  });
});