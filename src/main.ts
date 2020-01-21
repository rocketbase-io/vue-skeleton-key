import { SkeletonKey } from "@rocketbase/skeleton-key";
import { VueSkeletonKeyAuth } from "src/vue-skeleton-key-auth";

export * from "src/vue-skeleton-key";
export * from "src/vue-skeleton-key-auth";

/**
 * Vue Wrapper for @rocketbase/skeleton-key
 * @packageDocumentation
 */

declare module "vue/types/vue" {
  export interface Vue {
    $auth: VueSkeletonKeyAuth<any, any> & SkeletonKey<any, any>;
  }
}
