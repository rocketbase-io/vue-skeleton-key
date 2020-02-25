/* istanbul ignore file */
import { Component, Data } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";
import Vue from "vue";
import render from "./forgot-form.vue.html";

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton,
    SkeletonMessage
  },
  render
})
export default class ForgotForm extends Vue {
  @Data({ default: {} }) private value!: { username: string };
  @Data({ default: [] }) private messages!: string[];
  @Data() private busy!: boolean;

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  private async onSubmit() {
    const { value } = this;
    this.busy = true;
    try {
      const { username } = value;
      await this.$auth.client.forgotPassword({
        [username.includes("@") ? "email" : "username"]: username
      });
      this.$emit("success");
    } catch ({ response }) {
      if (response?.data?.errors) this.messages = Object.values(response.data.errors).flat();
      else this.messages = [this.tt("skeleton-key.forgot.invalid", "Invalid Username or Email")];
      this.$emit("error");
    } finally {
      this.busy = false;
    }
  }
}
