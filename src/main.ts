import { SkeletonKey } from "@rocketbase/skeleton-key";
import { VueSkeletonKeyAuth } from "src/vue-skeleton-key-auth";
import { VueSkeletonKey } from "src/vue-skeleton-key";

export * from "src/vue-skeleton-key";
export * from "src/vue-skeleton-key-auth";
export default VueSkeletonKey;

/**
 * Vue Wrapper for @rocketbase/skeleton-key
 * @packageDocumentation
 */

declare module "vue/types/vue" {
  export interface Vue {
    $auth: VueSkeletonKeyAuth<any, any> &
      SkeletonKey<any, any> & { $skeletonKey: SkeletonKey<any, any> };
  }
}
