import { SkeletonKey } from "@rocketbase/skeleton-key";
import { VueSkeletonKeyAuth } from "src/vue-skeleton-key-auth";

/**
 * Stores the vue and skeleton key instances for ease of access
 * @internal
 */
export const instances: {
  auth?: SkeletonKey<any, any>;
  vue?: VueSkeletonKeyAuth<any, any>;
} = {};
