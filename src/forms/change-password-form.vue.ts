/* istanbul ignore file */
import { Blocking, Component, Debounce, Emit, EmitError, Watch, mixins } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonValidated } from "src/components";
import render from "./change-password-form.vue.html";

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  newPassword2: string;
}

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton
  },
  render
})
export default class ChangePasswordForm extends mixins<SkeletonValidated<ChangePasswordFormData>>(SkeletonValidated) {
  @Blocking()
  @EmitError("error")
  @Emit("success")
  private async onSubmit() {
    const { value } = this;
    const { newPassword, currentPassword } = value;
    await this.client.changePassword({ currentPassword, newPassword }, this.$auth.jwtBundle!.token!);
  }

  @Watch("value.newPassword")
  @Debounce(500)
  private async onPasswordChange() {
    const val = this.value.newPassword;
    if (val) this.replaceErrors("change-password", "newPassword", "Incorrect Password", await this.client.validatePassword(val));
  }

  @Watch("value.newPassword2")
  @Debounce(500)
  private onPassword2Change() {
    const val = this.value.newPassword2;
    this.errors = {
      ...this.errors,
      newPassword2:
        val === this.value.newPassword ? undefined : [this.tt("skeleton-key.change-password.invalid.newPassword2", "Passwords don't match")]
    };
  }
}
