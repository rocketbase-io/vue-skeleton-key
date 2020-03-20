/* istanbul ignore file */
import { Blocking, BProp, Component, Data, Debounce, Emit, EmitError, mixins, SProp, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonValidated } from "src/components";
import { ConfirmInviteRequest } from "@rocketbase/skeleton-key";
import render from "./invite-form.vue.html";

export interface InviteFormData extends ConfirmInviteRequest {
  password2: string;
}

@Component({
  components: {
    SkeletonForm,
    SkeletonButton,
    SkeletonInput
  },
  render
})
export default class InviteForm extends mixins<SkeletonValidated<InviteFormData>>(SkeletonValidated) {
  @BProp() public hideInvite!: boolean;
  @Data({ default: false }) private validInvite!: boolean;
  @Data() private message!: string;
  @Data() private invitor!: string;

  @SProp({
    default(this: any) {
      const query = Object.fromEntries(
        location.search
          .replace("?", "")
          .split("&")
          .map(it => it.split("=").map(decodeURIComponent))
      );
      return query.inviteId;
    }
  })
  public inviteId!: string;

  @Blocking()
  @EmitError("error")
  @Emit("success")
  private async onSubmit() {
    const { value } = this;
    await this.client.transformInviteToUser(value);
  }

  public clear() {
    this.value = {} as any;
    this.errors = {};
    this.validInvite = false;
    this.messages = [];
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
    if (val) this.replaceErrors("invite", "username", "Invalid Username", await this.client.validateUsername(val));
  }

  @Watch("value.password")
  @Debounce(500)
  private async onPasswordChange() {
    const val = this.value.password;
    if (val) this.replaceErrors("invite", "password", "Invalid Password", await this.client.validatePassword(val));
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
    if (val) this.replaceErrors("invite", "email", "Invalid Email", await this.client.validateEmail(val));
  }
}
