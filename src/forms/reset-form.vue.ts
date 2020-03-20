/* istanbul ignore file */
import { ValidationResponse } from "@rocketbase/skeleton-key";
import { Blocking, BProp, BusyState, Component, Data, Debounce, Emit, EmitError, On, SProp, Watch } from "@rocketbase/vue-extra-decorators";
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
  @BProp() public hideTitle!: boolean;
  @Data({ default: false }) private validVerification!: boolean;
  @Data({ default: {} }) private value!: { password: string; password2: string };
  @Data({ default: {} }) private errors!: any;
  @Data({ default: [] }) private messages!: string[];
  @BusyState() private busy!: boolean;

  @SProp({
    default(this: any) {
      const query = Object.fromEntries(
        location.search
          .replace("?", "")
          .split("&")
          .map(it => it.split("=").map(decodeURIComponent))
      );
      return query.verification;
    }
  })
  public verification!: string;

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  private get client() {
    return this.$auth.client;
  }

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
  @Emit("success")
  @EmitError("error")
  private async onSubmit() {
    const { value, verification } = this;
    const { password } = value;
    await this.client.resetPassword({
      verification,
      password
    });
    this.errors = {};
  }

  public clear() {
    this.value = {} as any;
    this.errors = {};
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
