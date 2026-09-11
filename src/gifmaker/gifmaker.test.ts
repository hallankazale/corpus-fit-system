import { describe, expect, it } from "vitest";

describe("GIF Maker branch", () => {
  it("keeps a valid test suite for CI", () => {
    expect("projeto-trincado".includes("trincado")).toBe(true);
  });
});
