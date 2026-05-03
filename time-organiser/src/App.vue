<script setup lang="ts">
import NavbarComponent from './components/NavbarComponent.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div>
    <header>
      <NavbarComponent />
    </header>
    <main>
      <RouterView />
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
