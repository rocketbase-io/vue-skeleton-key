import Vue from "vue";
import { LoginForm, RegisterForm, VerificationForm, VueSkeletonKey } from "src/main";

Vue.use(VueSkeletonKey, {
  storageKey: "io.rocketbase.vue-skeleton-key",
  url: process.env.AUTH_URL
});

new Vue({
  components: {
    LoginForm,
    RegisterForm,
    VerificationForm
  },
  template: `
    <div>
      <login-form />
      <register-form />
      <verification-form />
    </div>
  `
}).$mount("#app");
