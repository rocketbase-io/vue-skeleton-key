/* istanbul ignore file */
import { Component, Data } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";
import Vue from "vue";
import render from "./login-form.vue.html";

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton,
    SkeletonMessage
  },
  render
})
export default class LoginForm extends Vue {
  @Data({ default: {} }) private value!: { username: string; password: string };
  @Data({ default: [] }) private messages!: string[];
  @Data() private busy!: boolean;

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  private async onSubmit() {
    const { value } = this;
    this.busy = true;
    try {
      await this.$auth.login(value.username, value.password);
    } catch ({ response }) {
      if (response?.data?.errors) this.messages = Object.values(response.data.errors).flat();
      else this.messages = [this.tt("skeleton-key.login.invalid", "Invalid Username or Password")];
    } finally {
      this.busy = false;
    }
  }
}
