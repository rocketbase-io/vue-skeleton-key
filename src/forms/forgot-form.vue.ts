/* istanbul ignore file */
import { Blocking, Component, Emit, EmitError, mixins, SProp } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonValidated } from "src/components";
import render from "./forgot-form.vue.html";

export interface ForgotFormData {
  username: string;
}

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton
  },
  render
})
export default class ForgotForm extends mixins<SkeletonValidated<ForgotFormData>>(SkeletonValidated) {
  @SProp({ default: () => `${location.origin + location.pathname}/verification` })
  public passwordResetUrl!: string;

  @Blocking()
  @EmitError("error")
  @Emit("success")
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
}
