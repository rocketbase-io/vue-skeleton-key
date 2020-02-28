/* istanbul ignore file */
import { Blocking, BusyState, Component, Data, Emit, EmitError, On, SProp } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";
import Vue from "vue";
import render from "./forgot-form.vue.html";

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton,
    SkeletonMessage
  },
  render
})
export default class ForgotForm extends Vue {
  @Data({ default: {} })
  private value!: { username: string };

  @Data({ default: [] })
  private messages!: string[];

  @BusyState()
  private busy!: boolean;

  @SProp({ default: () => `${location.origin + location.pathname}/verification` })
  public passwordResetUrl!: string;

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  @Blocking()
  @Emit("success")
  @EmitError("error")
  private async onSubmit() {
    const { value, passwordResetUrl } = this;
    const verificationUrl = passwordResetUrl;
    const { username } = value;
    await this.$auth.client.forgotPassword({
      [username.includes("@") ? "email" : "username"]: username,
      verificationUrl,
      passwordResetUrl
    } as any);
  }

  @On("error")
  private onError({ response }: any) {
    if (response?.data?.errors) this.messages = Object.values(response.data.errors).flat();
    else this.messages = [this.tt("skeleton-key.forgot.invalid", "Invalid Username or Email")];
  }
}
