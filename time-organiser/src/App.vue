<script setup lang="ts">
import NavbarComponent from './components/NavbarComponent.vue'
//import { useRoute } from 'vue-router'
import HomeView from './views/HomeView.vue'

//const route = useRoute()
</script>

<template>
  <div>
    <header>
      <NavbarComponent />
    </header>
    <main>
      <HomeView />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
}
</style>
