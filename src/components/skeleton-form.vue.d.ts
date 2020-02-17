import Vue from "vue";

export default class SkeletonForm extends Vue {
  public errors: Record<string, string[]>;
  public value: Record<string, any>;
  public required: string[];
  public busy: boolean;
}
