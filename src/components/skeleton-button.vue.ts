/* istanbul ignore file */
import { BProp, ClassesKebap, Component, SProp } from "@rocketbase/vue-extra-decorators";
import Vue from "vue";
import render from "./skeleton-button.vue.html";

@Component({ render })
export default class SkeletonButton extends Vue {
  @SProp({}) public text!: string;
  @BProp() public primary!: boolean;
  @BProp() public submit!: boolean;

  @ClassesKebap("skeleton-button")
  private get classes() {
    const { primary } = this;
    return { primary };
  }
}
