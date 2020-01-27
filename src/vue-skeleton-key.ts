import Vue from "vue";
import { SkeletonKey, SkeletonKeyOptions } from "@rocketbase/skeleton-key";
import { VueSkeletonKeyAuth } from "src/vue-skeleton-key-auth";
import { instances } from "src/instances";
import { linkProperties } from "src/link-properties";

/**
 * Vue Wrapper for @rocketbase/skeleton-key
 * @remarks
 * All options passed to this plugin are passed to a {@link "@rocketbase/skeleton-key".SkeletonKey} instance.
 * If you want to enhance the typings of the provided auth object, you need to provide your own declaration like this:
 * ```typescript
 * declare module "vue/types/vue" {
 *   export interface Vue {
 *     $auth: VueSkeletonKeyAuth<UserExtensionType, TokenExtensionType> & SkeletonKey<UserExtensionType, TokenExtensionType>;
 *   }
 * }
 * ```
 * @example
 * ```typescript
 * import Vue from "vue";
 * import { VueSkeletonKey } from "@rocketbase/vue-skeleton-key";
 * Vue.use(VueSkeletonKey, {
 *   storageKey: "my-application-unique-key",
 *   intercept: true,
 *   // ... other options to pass to SkeletonKey
 * });
 * ```
 * @param vue - The global Vue object.
 * @param options - The options to pass to skeleton-key;
 * @public
 */
export function VueSkeletonKey<UserExtension, TokenExtension>(
  vue: typeof Vue,
  options: SkeletonKeyOptions
) {
  // Assign singleton instances
  instances.auth = new SkeletonKey<UserExtension, TokenExtension>(options);
  instances.vue = new VueSkeletonKeyAuth<UserExtension, TokenExtension>();
  const { auth, vue: instance } = instances;

  // Create proxies for auth methods, getters
  linkProperties(auth, instance);

  // Create accessor for original skeleton key auth
  Object.defineProperty(instance, "$skeletonKey", {
    get: () => instances.auth
  });

  // Create bindings for event handlers to vue event handlers, refresh data attributes
  ["action", "login", "logout", "refresh", "initialized"].forEach(event =>
    auth.on(event as any, (...params: any[]) => {
      const hasData = auth.jwtBundle && auth.user;
      instance.user = hasData ? auth.userData : null;
      instance.token = hasData ? auth.tokenData : null;
      instance.refreshToken = hasData ? auth.refreshTokenData : null;
      instance.$emit(event, ...params);
    })
  );

  // Attach vue component to Vue prototype
  vue.prototype.$auth = instance;
}
