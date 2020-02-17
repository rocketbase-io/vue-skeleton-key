<template>
  <form :class="classes" @submit.prevent="$emit('submit', $event)" v-bind="$attrs">
    <div class="skeleton-form__header">
      <slot
        name="header"
        :errors="errors"
        :error-array="errorArray"
        :error-count="errorCount"
        :valid="valid"
        :invalid="invalid"
        :value="localValue"
        v-if="localValue"
      />
    </div>
    <div class="skeleton-form__body">
      <slot
        :errors="errors"
        :error-array="errorArray"
        :error-count="errorCount"
        :valid="valid"
        :invalid="invalid"
        :value="localValue"
        v-if="localValue"
      />
    </div>
    <div class="skeleton-form__footer">
      <slot
        name="footer"
        :errors="errors"
        :error-array="errorArray"
        :error-count="errorCount"
        :valid="valid"
        :invalid="invalid"
        :value="localValue"
        v-if="localValue"
      />
    </div>
  </form>
</template>

<script lang="ts">
/* istanbul ignore file */
import { BProp, ClassesKebap, Component, Data, Prop } from "@rocketbase/vue-extra-decorators";
import Vue from "vue";

@Component
export default class SkeletonForm extends Vue {
  @Prop({ literal: {} }) public errors!: Record<string, string[]>;
  @Prop({ literal: {} }) public value!: Record<string, any>;
  @Prop({ literal: [] }) public required!: string[];
  @BProp() public busy!: boolean;
  @Data({ sync: "value" }) private localValue!: Record<string, any>;

  @ClassesKebap()
  private get classes() {
    const { valid, invalid, busy } = this;
    return { valid, invalid, busy };
  }

  public get errorArray() {
    return Object.values(this.errors)
      .flat()
      .filter(it => it != null);
  }

  public get errorCount() {
    return this.errorArray.length;
  }

  private get valid() {
    return this.errorCount === 0 && !this.required.find(it => this.value[it] == null || this.value[it] === "");
  }

  private get invalid() {
    return !this.valid;
  }
}
</script>
