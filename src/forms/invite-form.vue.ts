/* istanbul ignore file */
import { Component, Data, Debounce, SProp, Watch } from "@rocketbase/vue-extra-decorators";
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
  @Data({ default: {} }) private value!: ConfirmInviteRequest & { password2: string };
  @Data({ default: {} }) private errors!: any;
  @Data() private message!: string;
  @Data() private invitor!: string;
  @Data() private busy!: boolean;

  private get client(): AuthClient {
    return this.$auth.client;
  }

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  private async onSubmit() {
    const { value } = this;
    this.busy = true;
    try {
      await this.client.transformInviteToUser(value);
      this.errors = {};
    } catch ({ response }) {
      if (response?.data?.errors) this.errors = response.data.errors;
    } finally {
      this.busy = false;
    }
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
    if (!inviteId) return;
    const { email, firstName, lastName, invitor, message } = await this.client.verifyInvite(inviteId);
    Object.entries({ email, firstName, lastName }).forEach(([key, value]) => {
      if (!value) return;
      this.value = { ...this.value, [key]: value };
    });
    this.invitor = invitor;
    this.message = message!;
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
