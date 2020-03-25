/* istanbul ignore file */
import { Blocking, Component, Data, Debounce, Emit, EmitError, mixins, SProp, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonValidated } from "src/components";
import { queryParam } from "src/query-param";
import render from "./reset-form.vue.html";

export interface ResetFormData {
  password: string;
  password2: string;
}

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton
  },
  render
})
export default class ResetForm extends mixins<SkeletonValidated<ResetFormData>>(SkeletonValidated) {
  @Data({ default: false }) private validVerification!: boolean;

  @SProp({ default: () => queryParam("verification") || "" })
  public verification!: string;

  @Watch({ prop: "verification", immediate: true })
  private async onVerificationChange(verification: string) {
    try {
      const validationResponse = await this.client.validateToken(verification);
      this.validVerification = validationResponse.valid;
    } catch (e) {
      this.validVerification = false;
    }
  }

  @Blocking()
  @EmitError("error")
  @Emit("success")
  private async onSubmit() {
    const { value, verification } = this;
    const { password } = value;
    await this.client.resetPassword({
      verification,
      password
    });
    this.errors = {};
  }

  @Watch("value.password")
  @Debounce(500)
  private async onPasswordChange() {
    const val = this.value.password;
    if (val) this.replaceErrors("reset", "password", "Invalid Password", await this.client.validatePassword(val));
  }

  @Watch("value.password2")
  @Debounce(500)
  private onPassword2Change() {
    const val = this.value.password2;
    this.errors = {
      ...this.errors,
      password2: val === this.value.password ? undefined : [this.tt("skeleton-key.reset.invalid.password2", "Passwords don't match")]
    };
  }
}
