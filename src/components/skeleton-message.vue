<template>
  <div :class="classes">
    <div class="skeleton-message__inner" v-text="text" />
  </div>
</template>

<script lang="ts">
/* istanbul ignore file */
import { ClassesKebap, Component, SProp } from "@rocketbase/vue-extra-decorators";
import Vue from "vue";

@Component
export default class SkeletonMessage extends Vue {
  @SProp() public text!: string;
  @ClassesKebap()
  private get classes() {
    return {};
  }
}
</script>
