/* istanbul ignore file */
import { ValidationResponse } from "@rocketbase/skeleton-key";
import { BProp, BusyState, Component, Data, On, Vue, Watch } from "@rocketbase/vue-extra-decorators";

@Component({})
export class SkeletonValidated<T = any> extends Vue {
  @BProp() public hideTitle!: boolean;
  @Data({ default: () => [] }) public messages!: string[];
  @Data({ default: () => ({}) }) public errors!: Partial<Record<keyof T | string, string[]>>;
  @Data({ default: () => ({}) }) public value!: T;
  @BusyState() public busy!: boolean;

  public tt(this: any, key: string, fallback: string) {
    return this.$t ? this.$t(key) || fallback : fallback;
  }

  public get client() {
    return this.$auth.client;
  }

  public clear() {
    this.messages = [];
    this.errors = {};
    this.value = {} as any;
  }

  @Watch("busy")
  public onBusyChange(busy: boolean) {
    this.$emit("busy", busy);
  }

  @On("error")
  public onError({ response }: any) {
    if (response?.data?.fields) this.errors = response.data.fields;
    if (response?.data?.message) this.messages = [response.data.message];
    else if (response?.status) this.messages = [`${response.status} - ${response.data ?? response.statusText}`];
    else this.messages = [this.tt("skeleton-key.error.generic", "An error occurred!")];
  }

  @On("success")
  public onSuccess() {
    this.clear();
  }

  public errorsFor({ valid, errorCodes }: ValidationResponse, field: string, form: string, fallback: string) {
    if (errorCodes) {
      if (Array.isArray(errorCodes)) return errorCodes;
      else return Object.values(errorCodes);
    } else if (!valid) return [this.tt(`skeleton-key.${form}.invalid.${field}`, fallback)];
    else return undefined;
  }

  public replaceErrors(form: string, field: string, fallback: string, response: ValidationResponse) {
    this.errors = {
      ...this.errors,
      [field]: this.errorsFor(response, field, form, fallback)
    };
  }
}

export function skeletonValidated<T>(): new () => SkeletonValidated<T> {
  return SkeletonValidated;
}
