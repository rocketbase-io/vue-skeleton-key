import Vue from "vue";
import { SkeletonKey, SkeletonKeyOptions } from "@rocketbase/skeleton-key";
import { VueSkeletonKeyAuth } from "src/vue-skeleton-key-auth";
import { instances } from "src/instances";

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
  Object.entries(
    Object.getOwnPropertyDescriptors(SkeletonKey.prototype)
  ).forEach(([key, desc]) => {
    Object.defineProperty(instance, key, {
      get() {
        if (desc.get) return (auth as any)[key];
        if (desc.value) return desc.value.bind(auth);
      }
    });
  });

  // Create bindings for event handlers to vue event handlers, refresh data attributes
  ["action", "login", "logout", "refresh"].forEach(event =>
    auth.on(event as any, (...params: any[]) => {
      instance.user = auth.userData || (null as any);
      instance.token = auth.tokenData || null;
      instance.refreshToken = auth.refreshTokenData || null;
      instance.$emit(event, ...params);
    })
  );

  // Attach vue component to Vue prototype
  vue.prototype.$auth = instance;
}
