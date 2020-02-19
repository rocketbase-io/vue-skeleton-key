/* istanbul ignore file */
import { ClassesKebap, Component, Data, Prop, SProp } from "@rocketbase/vue-extra-decorators";
import Vue from "vue";
import render from "./skeleton-input.vue.html";

@Component({ render })
export default class SkeletonInput extends Vue {
  @Prop({ default: [] }) public messages!: string[];
  @SProp({ default: "text" }) public type!: string;
  @SProp({ default: "" }) public label!: string;
  @SProp({ default: "", model: true }) public value!: string;
  @Data({ sync: "value" }) private localValue!: string;
  @ClassesKebap()
  private get classes() {
    const { valid, invalid } = this;
    return { invalid, valid };
  }

  private get valid() {
    return !this.invalid;
  }

  private get invalid() {
    return !!this.messages.length;
  }
}
