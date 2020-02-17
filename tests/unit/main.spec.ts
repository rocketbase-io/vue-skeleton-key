import { VueSkeletonKey, VueSkeletonKeyAuth } from "../../src/main";

describe("main.ts", () => {
  it("should export the plugin function and tue vue component", () => {
    expect(VueSkeletonKey).toBeDefined();
    expect(VueSkeletonKeyAuth).toBeDefined();
  });
});
