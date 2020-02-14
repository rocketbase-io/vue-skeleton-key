/* istanbul ignore file */
import Vue from "vue";
import { InviteForm, LoginForm, RegisterForm, VerificationForm, VueSkeletonKey } from "src/main";

Vue.use(VueSkeletonKey, {
  storageKey: "io.rocketbase.vue-skeleton-key",
  url: process.env.AUTH_URL
});

new Vue({
  components: {
    LoginForm,
    RegisterForm,
    VerificationForm,
    InviteForm
  },
  template: `
    <div>
      <login-form />
      <register-form />
      <verification-form />
      <invite-form />
    </div>
  `
}).$mount("#app");
