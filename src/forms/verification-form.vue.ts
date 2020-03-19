/* istanbul ignore file */
import { Component, Data, Watch, SProp, BusyState, Blocking, On, BProp, EmitError, Emit } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput } from "src/components";
import { AuthClient, ValidationResponse } from "@rocketbase/skeleton-key";
import Vue from "vue";
import render from "./verification-form.vue.html";

@Component({
  components: {
    SkeletonForm,
    SkeletonButton,
    SkeletonInput
  },
  render
})
export default class VerificationForm extends Vue {
  @BProp() public hideTitle!: boolean;

  @Data({ default: {} }) private value!: { verification?: string };
  @Data({ default: {} }) private errors!: { verification?: string[] };
  @SProp({ model: true }) public verification!: string | null;
  @Data({ sync: "verification" }) verificationLocal!: string | null;
  @Data({ default: [] }) private messages!: string[];
  @BusyState() private busy!: boolean;

  private get client(): AuthClient {
    return this.$auth.client;
  }

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  @Blocking()
  @EmitError("error")
  @Emit("success")
  private async onSubmit() {
    const { verification } = this.value;
    this.$auth.jwtBundle = await this.client.verify(verification!);
    this.errors = {};
    await this.$auth.refreshInfo();
  }

  public clear() {
    this.value = {} as any;
    this.errors = {};
    this.verificationLocal = this.verification;
    this.messages = [];
  }

  @Watch("busy")
  private busyChanged(busy: boolean) {
    this.$emit("busy", busy);
  }

  @On("error")
  private onError({ response }: any) {
    if (response?.data?.errors) this.errors = response.data.errors;
    if (response?.status) this.messages = [`${response.status} - ${response.data ?? response.statusText}`];
  }

  @On("success")
  private onSuccess() {
    this.clear();
  }

  private errorFor({ errorCodes, valid }: ValidationResponse) {
    if (valid) return;
    if (!errorCodes) return [this.tt("skeleton-key.verification.invalid.token", "Invalid Token")];
    return Array.isArray(errorCodes) ? errorCodes : Object.values(errorCodes);
  }

  @Watch("verificationLocal")
  private async onVerificationChange(val: string | null) {
    this.value.verification = val || undefined;
    this.errors = val ? { verification: this.errorFor(await this.client.validateToken(val)) } : {};
  }
}
