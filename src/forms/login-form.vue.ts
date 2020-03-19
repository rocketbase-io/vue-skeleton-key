/* istanbul ignore file */
import { Blocking, BProp, BusyState, Component, Data, Emit, EmitError, On, Watch } from "@rocketbase/vue-extra-decorators";
import { SkeletonButton, SkeletonForm, SkeletonInput, SkeletonMessage } from "src/components";
import Vue from "vue";
import render from "./login-form.vue.html";

@Component({
  components: {
    SkeletonForm,
    SkeletonInput,
    SkeletonButton,
    SkeletonMessage
  },
  render
})
export default class LoginForm extends Vue {
  @BProp() public hideTitle!: boolean;
  @Data({ default: {} }) private value!: { username: string; password: string };
  @Data({ default: [] }) private messages!: string[];
  @BusyState() private busy!: boolean;

  private tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  @Blocking()
  @EmitError("error")
  @Emit("success")
  private async onSubmit() {
    const { value } = this;
    await this.$auth.login(value.username, value.password);
  }

  public clear() {
    this.value = {} as any;
    this.messages = [];
  }

  @Watch("busy")
  private busyChanged(busy: boolean) {
    this.$emit("busy", busy);
  }

  @On("error")
  private onError({ response }: any) {
    if (response?.data?.errors) this.messages = Object.values(response.data.errors).flat();
    else this.messages = [this.tt("skeleton-key.login.invalid", "Invalid Username or Password")];
  }

  @On("success")
  private onSuccess() {
    this.clear();
  }
}
