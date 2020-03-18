/* istanbul ignore file */
import { Blocking, BProp, BusyState, Component, Data, Debounce, Emit, EmitError, On, SProp, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";
import { AuthClient, ConfirmInviteRequest, ValidationResponse } from "@rocketbase/skeleton-key";
import Vue from "vue";
import render from "./invite-form.vue.html";

@Component({
  components: {
    SkeletonForm,
    SkeletonButton,
    SkeletonInput,
    SkeletonMessage
  },
  render
})
export default class InviteForm extends Vue {
  @SProp() public inviteId!: string;
  @BProp() public hideTitle!: boolean;
  @BProp() public hideInvite!: boolean;
  @Data({ default: false }) private validInvite!: boolean;
  @Data({ default: {} }) private value!: ConfirmInviteRequest & { password2: string };
  @Data({ default: {} }) private errors!: any;
  @Data() private message!: string;
  @Data() private invitor!: string;
  @BusyState() private busy!: boolean;

  private get client(): AuthClient {
    return this.$auth.client;
  }

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  @Blocking()
  @Emit("success")
  @EmitError("error")
  private async onSubmit() {
    const { value } = this;
    await this.client.transformInviteToUser(value);
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

  private errorsFor({ valid, errorCodes }: ValidationResponse) {
    if (errorCodes) {
      if (Array.isArray(errorCodes)) return errorCodes;
      else return Object.values(errorCodes);
    } else if (!valid) return [this.tt("skeleton-key.invite.invalid.username", "Invalid Username")];
    else return undefined;
  }

  private replaceErrors(field: string, response: ValidationResponse) {
    this.errors = {
      ...this.errors,
      [field]: this.errorsFor(response)
    };
  }

  @Watch({ prop: "inviteId", immediate: true })
  private async onInviteChange(inviteId: string) {
    this.value = { ...this.value, inviteId };
    if (!inviteId) {
      this.validInvite = false;
      return;
    }
    try {
      const appInviteRead = await this.client.verifyInvite(inviteId);
      const { email, firstName, lastName, invitor, message } = appInviteRead;
      Object.entries({ email, firstName, lastName }).forEach(([key, value]) => {
        if (!value) return;
        this.value = { ...this.value, [key]: value };
      });
      this.invitor = invitor;
      this.message = message!;

      this.$emit("invite", appInviteRead);
      this.validInvite = true;
    } catch (e) {
      this.validInvite = false;
    }
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
      password2: val === this.value.password ? undefined : [this.tt("skeleton-key.invite.invalid.password2", "Passwords don't match")]
    };
  }

  @Watch("value.email")
  @Debounce(500)
  private async onEmailChange() {
    const val = this.value.email;
    if (val) this.replaceErrors("email", await this.client.validateEmail(val));
  }
}
