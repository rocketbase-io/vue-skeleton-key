/* istanbul ignore file */
import { ClassesKebap, Component, SProp } from "@rocketbase/vue-extra-decorators";
import Vue from "vue";

@Component({
  template: `
    <div :class="classes">
      <div class="skeleton-message__inner" v-text="text" />
    </div>
  `
})
export class SkeletonMessage extends Vue {
  @SProp() public text!: string;
  @ClassesKebap()
  private get classes() {
    return {};
  }
}
