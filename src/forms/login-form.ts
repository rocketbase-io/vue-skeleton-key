/* istanbul ignore file */
import { Component, Data } from "@rocketbase/vue-extra-decorators";
import Vue from "vue";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton,
    SkeletonMessage
  },
  template: `
    <skeleton-form :busy="busy" v-model="value" @submit="onSubmit" :required="['username', 'password']">
      <template #header>
        <h3>Login</h3>
      </template>
      <template #default="{ value }">
        <skeleton-input value="TEST" label="Username" v-model="value.username" />
        <skeleton-input value="TEST" type="password" label="Password" v-model="value.password" />
      </template>
      <template #footer="{ invalid }">
        <template v-if="messages" >
          <skeleton-message v-for="(message, index) in messages" :text="message" :key="index" />
        </template>
        <skeleton-button text="Login" primary submit :disabled="invalid" />
      </template>
    </skeleton-form>
  `
})
export class LoginForm extends Vue {
  @Data({ default: {} }) private value!: { username: string; password: string };
  @Data({ default: [] }) private messages!: string[];
  @Data() private busy!: boolean;

  private async onSubmit() {
    const { value } = this;
    this.busy = true;
    try {
      await this.$auth.login(value.username, value.password);
    } catch ({ response }) {
      if (response.data && response.data.errors) this.messages = Object.values(response.data.errors).flat();
      else if (response.status && response.status === 401) this.messages = ["Unknown Username or Password"];
    } finally {
      this.busy = false;
    }
  }
}
