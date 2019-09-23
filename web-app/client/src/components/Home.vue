<template>
  <div class="posts">
    <h1>2020 Presidential Election</h1>
    <h3>If you are a registered voter, enter your voterId below</h3>
    <!--span><b>{{ response }}</b></span><br /-->
    <form v-on:submit="validateVoter">
      <input type="text" v-model="loginData.email" placeholder="Enter email">
      <input type="password" v-model="loginData.password" placeholder="Enter password">

      <br>

      <input type="submit" value="Login">
      <br>
      <br>
      <span v-if="loginReponse">
        <b>{{ loginReponse }}</b>
      </span>
      <br>
    </form>

    <br>
    <h3>Otherwise, fill out the form below to register!</h3>
    <form v-on:submit="registerVoter">
      <input type="text" v-model="registerData.name" placeholder="name">
      <br>
      <input type="text" v-model="registerData.email" placeholder="email">
      <br>
      <input type="text" v-model="registerData.password" placeholder="password">
      <br>

      <input type="submit" value="Register">
    </form>
    <br>
    <span v-if="registerReponse">
      <b>{{ registerReponse.data }}</b>
    </span>
    <br>
    <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "response",
  data() {
    return {
      loginData: {},
      registerData: {},
      registerReponse: {
        data: ""
      },
      loginReponse: {
        data: ""
      }
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async registerVoter() {

      await this.runSpinner();
      const apiResponse = await PostsService.registerVoter(
        this.registerData.name,
        this.registerData.email,
        this.registerData.password,
      );

      console.log(apiResponse);
      this.registerReponse = apiResponse;
      await this.hideSpinner();
    },

    async validateVoter() {
      await this.runSpinner();

      if (!this.loginData.email) {
        console.log("!thislogin");
        let response = 'Please enter a email';
        this.loginReponse.data = response;
        await this.hideSpinner();
      } else {
        const apiResponse = await PostsService.validateVoter(
          this.loginData.email,
          this.loginData.password
        );
        console.log("apiResponse");
        console.log(apiResponse.data);

        // if (apiResponse.data.error) {
        //   // console.log(apiResponse);
        //   console.log(apiResponse.data.error);
        //   this.loginReponse = apiResponse.data.error;
        // } else {
        //   this.$router.push("castBallot");
        // }

        console.log(apiResponse);
        this.loginReponse = apiResponse;
        // this.$router.push('castBallot')
        await this.hideSpinner();
      }
    },
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    }
  }
};
</script>
