/* istanbul ignore file */
import { Blocking, Component, Emit, EmitError, mixins } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonValidated } from "src/components";
import render from "./login-form.vue.html";

export interface LoginFormData {
  username: string;
  password: string;
}

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton
  },
  render
})
export default class LoginForm extends mixins<SkeletonValidated<LoginFormData>>(SkeletonValidated) {
  @Blocking()
  @EmitError("error")
  @Emit("success")
  private async onSubmit() {
    const { value } = this;
    await this.$auth.login(value.username, value.password);
  }
}
