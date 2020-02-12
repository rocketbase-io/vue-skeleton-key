import { ClassesKebap, Component, Data, Prop, SProp } from "@rocketbase/vue-extra-decorators";
import Vue from "vue";

@Component({
  template: `
    <div :class="classes">
      <div class="skeleton-input__outer">
        <div class="skeleton-input__label" v-if="label">
          <label class="skeleton-input__label__text" v-text="label" />
        </div>
        <div class="skeleton-input__wrapper">
          <input class="skeleton-input__inner" ref="inner" :type="type" v-model="localValue" v-bind="$attrs" />
        </div>
        <div class="skeleton-input__messages" v-if="invalid">
          <div class="skeleton-input__message" v-for="(message, index) in messages" :key="index" v-text="message" />
        </div>
      </div>
    </div>
  `
})
export class SkeletonInput extends Vue {
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
