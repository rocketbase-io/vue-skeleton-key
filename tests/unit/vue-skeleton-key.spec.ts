import "tests/util/xhr-mock";
import Vue from "vue";
import { VueSkeletonKey } from "src/vue-skeleton-key";

Vue.use(VueSkeletonKey, {
  storageKey: "test",
  intercept: false
});

describe("vue-skeleton-key.ts", () => {
  describe("VueSkeletonKey", () => {
    it("should define an $auth property on the vue prototype", () => {
      expect(Vue.prototype.$auth).toBeDefined();
    });
    it("should correctly link methods to the internal auth instance", () => {
      expect(Vue.prototype.$auth.isLoggedIn()).toBeFalsy();
    });
    it("should correctly link getters to the internal auth instance", () => {
      const user = (Vue.prototype.$auth.$skeletonKey.user = { name: "test" });
      expect(Vue.prototype.$auth.userData).toBe(user);
      Vue.prototype.$auth.$skeletonKey.user = undefined;
    });
    it("should correctly forward events from the internal auth instance", () => {
      const spy = jest.fn();
      Vue.prototype.$auth.$on("login", spy as any);
      Vue.prototype.$auth.$skeletonKey.emitSync("login", "test");
      expect(spy).toHaveBeenCalledWith("test");
    });
    it("should replace data property values on the vue instance", () => {
      Vue.prototype.$auth.user = {} as any;
      Vue.prototype.$auth.$skeletonKey.emitSync("login", "test");
      expect(Vue.prototype.$auth.user).toBeNull();
    });
  });
});
