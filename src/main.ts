import { SkeletonKey } from "@rocketbase/skeleton-key";
import { VueSkeletonKeyAuth } from "./vue-skeleton-key-auth";
import { VueSkeletonKey } from "./vue-skeleton-key";

export * from "./vue-skeleton-key";
export * from "./vue-skeleton-key-auth";
export * from "./components";
export * from "./forms";
export default VueSkeletonKey;

/**
 * Vue Wrapper for @rocketbase/skeleton-key
 * @packageDocumentation
 */

declare module "vue/types/vue" {
  export interface Vue {
    $auth: VueSkeletonKeyAuth<any, any> & SkeletonKey<any, any> & { $skeletonKey: SkeletonKey<any, any> };
  }
}
