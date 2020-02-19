/* istanbul ignore file */
import { ValidationResponse } from "@rocketbase/skeleton-key";
import { Component, Data, Debounce, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";
import Vue from "vue";
import render from "./change-password-form.vue.html";

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton,
    SkeletonMessage
  },
  render
})
export default class ChangePasswordForm extends Vue {
  @Data({ default: {} }) private value!: { currentPassword: string; newPassword: string; newPassword2: string };
  @Data({ default: {} }) private errors!: any;
  @Data() private busy!: boolean;

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  private get client() {
    return this.$auth.client;
  }

  private async onSubmit() {
    const { value } = this;
    this.busy = true;
    try {
      const { newPassword, currentPassword } = value;
      await this.client.changePassword({ currentPassword, newPassword }, this.$auth.jwtBundle!.token!);
      this.errors = {};
      this.$emit("success");
    } catch ({ response }) {
      if (response?.data?.errors) this.errors = response.data.errors;
      this.$emit("error");
    } finally {
      this.busy = false;
    }
  }

  private errorsFor({ valid, errorCodes }: ValidationResponse) {
    if (errorCodes) {
      if (Array.isArray(errorCodes)) return errorCodes;
      else return Object.values(errorCodes);
    } else if (!valid) return [this.tt("skeleton-key.change-password.invalid.newPassword", "Invalid Password")];
    else return undefined;
  }

  private replaceErrors(field: string, response: ValidationResponse) {
    this.errors = {
      ...this.errors,
      [field]: this.errorsFor(response)
    };
  }

  @Watch("value.newPassword")
  @Debounce(500)
  private async onPasswordChange() {
    const val = this.value.newPassword;
    if (val) this.replaceErrors("newPassword", await this.client.validatePassword(val));
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
