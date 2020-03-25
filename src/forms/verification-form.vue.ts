/* istanbul ignore file */
import { Component, Data, Watch, SProp, Blocking, EmitError, Emit, mixins } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonValidated } from "src/components";
import render from "./verification-form.vue.html";

export interface VerificationFormData {
  verification: string;
}

@Component({
  components: {
    SkeletonForm,
    SkeletonButton,
    SkeletonInput
  },
  render
})
export default class VerificationForm extends mixins<SkeletonValidated<VerificationFormData>>(SkeletonValidated) {
  @SProp({ model: true }) public verification!: string | null;
  @Data({ sync: "verification" }) verificationLocal!: string | null;

  @Blocking()
  @EmitError("error")
  @Emit("success")
  private async onSubmit() {
    const { verification } = this.value;
    this.$auth.jwtBundle = await this.client.verify(verification!);
    await this.$auth.refreshInfo();
  }

  public clear() {
    this.value = {} as any;
    this.errors = {};
    this.messages = [];
    this.verificationLocal = this.verification;
  }

  @Watch("verificationLocal")
  private async onVerificationChange(val: string | null) {
    this.value.verification = val || (undefined as any);
    if (val) this.replaceErrors("verification", "verification", "Invalid Verification Token", await this.client.validateToken(val));
    else this.errors = {};
  }
}
