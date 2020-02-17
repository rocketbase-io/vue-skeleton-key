import { Component, Data, Debounce, SProp, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";
import Vue from "vue";
import { AuthClient, ConfirmInviteRequest, ValidationResponse } from "@rocketbase/skeleton-key";

@Component({
  components: {
    SkeletonForm,
    SkeletonButton,
    SkeletonInput,
    SkeletonMessage
  },
  template: `
    <skeleton-form :busy="busy" v-model="value" :errors="errors" :required="['username', 'email', 'password', 'password2']" @submit="onSubmit">
      <template #header>
        <h3>Register</h3>
        <div v-if="invitor || message">
          <h4 v-text="invitor" v-if="invitor" />
          <blockquote v-text="message" v-if="message" />
        </div>
      </template>
      <template #default="{ errors, value }">
        <skeleton-input v-model="value.username" :messages="errors.username" label="Username" />
        <skeleton-input v-model="value.email" :messages="errors.email" type="email" label="Email" />
        <skeleton-input v-model="value.password" :messages="errors.password" type="password" label="Password" />
        <skeleton-input v-model="value.password2" :messages="errors.password2" type="password" label="Repeat Password" />
        <skeleton-input v-model="value.firstName" :messages="errors.firstName" label="First Name" />
        <skeleton-input v-model="value.lastName" :messages="errors.lastName" label="Last Name" />
      </template>
      <template #footer="{ invalid }">
        <skeleton-button text="Register" primary submit :disabled="invalid" />
      </template>
    </skeleton-form>
  `
})
export class InviteForm extends Vue {
  @Data({ default: {} }) private value!: ConfirmInviteRequest & { password2: string };
  @Data({ default: {} }) private errors!: any;
  @Data() private message!: string;
  @Data() private invitor!: string;
  @Data() private busy!: boolean;
  @SProp() private inviteId!: string;

  private get client(): AuthClient {
    return this.$auth.client;
  }

  private async onSubmit() {
    const { value } = this;
    this.busy = true;
    try {
      await this.client.transformInviteToUser(value);
      this.errors = {};
    } catch ({ response }) {
      if (response.data && response.data.errors) this.errors = response.data.errors;
    } finally {
      this.busy = false;
    }
  }

  private errorsFor({ valid, errorCodes }: ValidationResponse) {
    if (errorCodes) {
      if (Array.isArray(errorCodes)) return errorCodes;
      else return Object.values(errorCodes);
    } else if (!valid) return ["Invalid Username"];
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
      password2: val === this.value.password ? undefined : ["Passwords don't match"]
    };
  }

  @Watch("value.email")
  @Debounce(500)
  private async onEmailChange() {
    const val = this.value.email;
    if (val) this.replaceErrors("email", await this.client.validateEmail(val));
  }
}
