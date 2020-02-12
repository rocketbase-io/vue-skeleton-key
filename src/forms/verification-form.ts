import { Component, Data, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput } from "src/components";
import Vue from "vue";
import { AuthClient, ValidationResponse } from "@rocketbase/skeleton-key";

@Component({
  components: {
    SkeletonForm,
    SkeletonButton,
    SkeletonInput
  },
  template: `
    <skeleton-form v-model="value" :errors="errors" :required="['verification']" @submit="onSubmit">
      <template #header>
        <h3>Verification</h3>
      </template>
      <template #default="{ errors, value }">
        <skeleton-input v-model="value.verification" :messages="errors.verification" label="Token" />
      </template>
      <template #footer="{ invalid }">
        <skeleton-button text="Verify" primary submit :disabled="invalid" />
      </template>
    </skeleton-form>
  `
})
export class VerificationForm extends Vue {
  @Data({ default: {} }) private value!: { verification: string };
  @Data({ default: {} }) private errors!: { verification?: string[] };

  private get client(): AuthClient {
    return this.$auth.$skeletonKey.client;
  }

  private async onSubmit() {
    const { verification } = this.value;
    try {
      this.$auth.$skeletonKey.jwtBundle = await this.client.verify(verification);
      this.errors = {};
      await this.$auth.refreshInfo();
    } catch ({ response }) {
      if (response.data && response.data.errors) this.errors = response.data.errors;
    }
  }

  private errorFor({ errorCodes, valid }: ValidationResponse) {
    if (valid) return;
    if (!errorCodes) return ["Invalid Token"];
    return Array.isArray(errorCodes) ? errorCodes : Object.values(errorCodes);
  }

  @Watch("value.verification")
  private async onVerificationChange(val: string) {
    if (val)
      this.errors = {
        verification: this.errorFor(await this.client.validateToken(val))
      };
  }
}
