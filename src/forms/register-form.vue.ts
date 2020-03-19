/* istanbul ignore file */
import { Blocking, BProp, BusyState, Component, Data, Debounce, Emit, EmitError, On, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";
import { AuthClient, RegistrationRequest, ValidationResponse } from "@rocketbase/skeleton-key";
import Vue from "vue";
import render from "./register-form.vue.html";

@Component({
  components: {
    SkeletonForm,
    SkeletonButton,
    SkeletonInput,
    SkeletonMessage
  },
  render
})
export default class RegisterForm extends Vue {
  @BProp() public hideTitle!: boolean;
  @Data({ default: {} }) private value!: RegistrationRequest & { password2: string };
  @Data({ default: {} }) private errors!: any;
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
    const { value } = this;
    await this.client.register(value);
    this.errors = {};
  }

  public clear() {
    this.value = {} as any;
    this.errors = {};
  }

  @Watch("busy")
  private busyChanged(busy: boolean) {
    this.$emit("busy", busy);
  }

  @On("error")
  private onError({ response }: any) {
    if (response?.data?.errors) this.errors = response.data.errors;
  }

  @On("success")
  private onSuccess() {
    this.clear();
  }

  private errorsFor({ valid, errorCodes }: ValidationResponse) {
    if (errorCodes) {
      if (Array.isArray(errorCodes)) return errorCodes;
      else return Object.values(errorCodes);
    } else if (!valid) return [this.tt("skeleton-key.register.invalid.username", "Invalid Username")];
    else return undefined;
  }

  private replaceErrors(field: string, response: ValidationResponse) {
    this.errors = {
      ...this.errors,
      [field]: this.errorsFor(response)
    };
  }

  @Watch("value.username")
  @Debounce(500)
  private async onUsernameChange() {
    const val = this.value.username;
    if (val) this.replaceErrors("username", await this.client.validateUsername(val));
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

  @Watch("value.email")
  @Debounce(500)
  private async onEmailChange() {
    const val = this.value.email;
    if (val) this.replaceErrors("email", await this.client.validateEmail(val));
  }
}
