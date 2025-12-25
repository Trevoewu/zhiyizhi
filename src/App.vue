<script setup>
import { RouterView } from 'vue-router'
import { ref } from 'vue'
import SnowEffect from './components/SnowEffect.vue'

const isSnowing = ref(false)

const toggleSnow = () => {
  isSnowing.value = !isSnowing.value
}
</script>

<template>
  <button class="snow-button" @click="toggleSnow">
    {{ isSnowing ? 'Stop Snow ❄️' : 'Let it Snow ❄️' }}
  </button>
  
  <SnowEffect v-if="isSnowing" />

  <RouterView v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
</template>

<style scoped>
.snow-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  backdrop-filter: blur(5px);
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.snow-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
