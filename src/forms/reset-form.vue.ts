/* istanbul ignore file */
import { ValidationResponse } from "@rocketbase/skeleton-key";
import { Component, Data, Debounce, SProp, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";
import Vue from "vue";
import render from "./reset-form.vue.html";

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton,
    SkeletonMessage
  },
  render
})
export default class ResetForm extends Vue {
  @Data({ default: {} })
  private value!: { password: string; password2: string };

  @Data({ default: {} })
  private errors!: any;

  @Data()
  private busy!: boolean;

  @SProp()
  public verification!: string;

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  private get client() {
    return this.$auth.client;
  }

  private async onSubmit() {
    const { value, verification } = this;
    this.busy = true;
    try {
      const { password } = value;
      await this.client.resetPassword({
        verification,
        password
      });
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
    } else if (!valid) return [this.tt("skeleton-key.register.invalid.password", "Invalid Password")];
    else return undefined;
  }

  private replaceErrors(field: string, response: ValidationResponse) {
    this.errors = {
      ...this.errors,
      [field]: this.errorsFor(response)
    };
  }

  @Watch("value.password")
  @Debounce(500)
  private async onPasswordChange() {
    const val = this.value.password;
    if (val) this.replaceErrors("password", await this.client.validatePassword(val));
  }

  @Watch("value.password2")
  @Debounce(500)
  private onPassword2Change() {
    const val = this.value.password2;
    this.errors = {
      ...this.errors,
      password2: val === this.value.password ? undefined : [this.tt("skeleton-key.register.invalid.password2", "Passwords don't match")]
    };
  }
}
