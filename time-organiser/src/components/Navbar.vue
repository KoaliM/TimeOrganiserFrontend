<script setup lang="ts">
import {ref} from 'vue'
</script>

<template>
    <div class = "flex items-center object-top rounded-xl " >
        <RouterLink to="/">Befriend</RouterLink>
        <RouterLink to="/">Meet</RouterLink>
        <RouterLink to="/">My tasks</RouterLink>
        <RouterLink to="/" v-if="">Login/Sign up</RouterLink>
    </div>
</template>