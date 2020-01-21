import Vue from "vue";
import { Component, Data } from "@rocketbase/vue-extra-decorators";
import { AppUserRead, JsonWebToken } from "@rocketbase/skeleton-key";
import { instances } from "src/instances";

/**
 * Vue component attached to Vue.prototype.$auth
 * @internal
 */
@Component
export class VueSkeletonKeyAuth<UserExtension, TokenExtension> extends Vue {
  @Data({ default: () => instances.auth?.userData || null })
  public user!: AppUserRead & UserExtension;
  @Data({ default: () => instances.auth?.tokenData || null })
  public token!: JsonWebToken & { payload: TokenExtension };
  @Data({ default: () => instances.auth?.refreshTokenData || null })
  public refreshToken!: JsonWebToken;
}
