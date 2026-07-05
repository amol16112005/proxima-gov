import { describe, expect, it } from "vitest";
import { stripMongoId } from "./omit";

describe("stripMongoId", () => {
  it("removes _id from mongo documents", () => {
    const doc = { _id: "abc", name: "Test", value: 1 };
    expect(stripMongoId(doc)).toEqual({ name: "Test", value: 1 });
  });
});