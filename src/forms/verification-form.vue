<template>
  <skeleton-form :busy="busy" v-model="value" :errors="errors" :required="['verification']" @submit="onSubmit">
    <template #header>
      <h3>Verification</h3>
    </template>
    <template #default="{ errors }">
      <skeleton-input v-model="verificationLocal" :messages="errors.verification" label="Token" />
    </template>
    <template #footer="{ invalid }">
      <skeleton-button text="Verify" primary submit :disabled="invalid" />
    </template>
  </skeleton-form>
</template>

<script lang="ts">
/* istanbul ignore file */
import { Component, Data, Watch, SProp } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput } from "../components";
import { AuthClient, ValidationResponse } from "@rocketbase/skeleton-key";
import Vue from "vue";

@Component({
  components: {
    SkeletonForm,
    SkeletonButton,
    SkeletonInput
  }
})
export default class VerificationForm extends Vue {
  @Data({ default: {} }) private value!: { verification?: string };
  @Data({ default: {} }) private errors!: { verification?: string[] };
  @SProp({ model: true }) public verification!: string | null;
  @Data({ sync: "verification" }) verificationLocal!: string | null;
  @Data() private busy!: boolean;

  private get client(): AuthClient {
    return this.$auth.client;
  }

  private async onSubmit() {
    const { verification } = this.value;
    this.busy = true;
    try {
      this.$auth.jwtBundle = await this.client.verify(verification!);
      this.errors = {};
      await this.$auth.refreshInfo();
    } catch ({ response }) {
      if (response.data && response.data.errors) this.errors = response.data.errors;
    } finally {
      this.busy = false;
    }
  }

  private errorFor({ errorCodes, valid }: ValidationResponse) {
    if (valid) return;
    if (!errorCodes) return ["Invalid Token"];
    return Array.isArray(errorCodes) ? errorCodes : Object.values(errorCodes);
  }

  @Watch("verificationLocal")
  private async onVerificationChange(val: string | null) {
    this.value.verification = val || undefined;
    this.errors = val ? { verification: this.errorFor(await this.client.validateToken(val)) } : {};
  }
}
</script>
