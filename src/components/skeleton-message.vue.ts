/* istanbul ignore file */
import { ClassesKebap, Component, SProp } from "@rocketbase/vue-extra-decorators";
import Vue from "vue";
import render from "./skeleton-message.vue.html";

@Component({ render })
export default class SkeletonMessage extends Vue {
  @SProp() public text!: string;
  @ClassesKebap("skeleton-message")
  private get classes() {
    return {};
  }
}
