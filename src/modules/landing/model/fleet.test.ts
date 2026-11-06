import { describe, expect, it } from "vitest";
import { photoSrcSet, photoUrl } from "./fleet";

describe("fleet", () => {
  it("monta o endereço fixo e o srcset", () => {
    expect(photoUrl("p1", 640, "https://api.test/api")).toBe("https://api.test/api/public/photos/p1/w/640");
    expect(photoSrcSet("p1", "https://api.test/api")).toBe(
      "https://api.test/api/public/photos/p1/w/640 640w, https://api.test/api/public/photos/p1/w/1280 1280w, https://api.test/api/public/photos/p1/w/1920 1920w",
    );
  });
});
