<template>
  <span>

    <Transition mode="in-out" :duration="1">
      <v-alert v-if="show" class="banner" variant="elevated" position="fixed" color="background" icon="mdi-cookie"
        prominent>
        <v-row>
          <v-col>
            <p class="text-center">
              We use cookies which are essential for you to access our website and/or to provide you with our services
              and allow us to measure and improve the performance of our website. <RouterLink class="cursor"
                to="/privacy-policy">Learn
                more</RouterLink>.
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="text-center">
            <v-btn color="success" @click="acceptCookies">
              Accept all cookies
            </v-btn>
            <v-btn color="grey" @click="ignoreCookies" variant="text">
              use essential cookies only
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>
    </Transition>
  </span>
</template>
<script setup>
import { useCookies } from 'vue3-cookies'
import { ref } from 'vue'

const show = ref(false)
const { cookies } = useCookies()

if (!cookies.get("cookie_consent")) {
  show.value = true
}

const acceptCookies = () => {
  cookies.set('cookie_consent', "true")
  show.value = false
}

const ignoreCookies = () => {
  show.value = false
}

</script>
<style scoped lang='scss'>
.banner {
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 10000;
}
</style>
