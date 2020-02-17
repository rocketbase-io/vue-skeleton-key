/* istanbul ignore file */
import { BProp, ClassesKebap, Component, SProp } from "@rocketbase/vue-extra-decorators";
import Vue from "vue";

@Component({
  template: `
    <button :type="submit ? 'submit' : 'button'" :class="classes" v-bind="$attrs">
      <div class="skeleton-button__inner" v-text="text" />
    </button>
  `
})
export class SkeletonButton extends Vue {
  @SProp({}) public text!: string;
  @BProp() public primary!: boolean;
  @BProp() public submit!: boolean;
  @ClassesKebap()
  private get classes() {
    const { primary } = this;
    return { primary };
  }
}