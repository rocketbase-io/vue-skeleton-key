/* istanbul ignore file */
import { Blocking, Component, Debounce, Emit, EmitError, mixins, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonValidated } from "src/components";
import { RegistrationRequest } from "@rocketbase/skeleton-key";
import render from "./register-form.vue.html";

export interface RegisterFormData extends RegistrationRequest {
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
export default class RegisterForm extends mixins<SkeletonValidated<RegisterFormData>>(SkeletonValidated) {
  @Blocking()
  @EmitError("error")
  @Emit("success")
  private async onSubmit() {
    const { value } = this;
    await this.client.register(value);
  }

  @Watch("value.username")
  @Debounce(500)
  private async onUsernameChange() {
    const val = this.value.username;
    if (val) this.replaceErrors("register", "username", "Invalid Username", await this.client.validateUsername(val));
  }

  @Watch("value.password")
  @Debounce(500)
  private async onPasswordChange() {
    const val = this.value.password;
    if (val) this.replaceErrors("register", "password", "Invalid Password", await this.client.validatePassword(val));
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
    if (val) this.replaceErrors("register", "email", "Invalid Email", await this.client.validateEmail(val));
  }
}
