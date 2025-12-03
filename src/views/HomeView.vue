<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToDetail = (id) => {
  router.push(`/detail/${id}`);
};
</script>

<template>
  <div class="scroll-container">
    <section class="section section-1">
      <div class="content">
        <h1>Travel Records</h1>
        <div class="interactive-block" @click="navigateToDetail(1)">
          <span>View Journey</span>
        </div>
        <p>Explore the world with me</p>
      </div>
    </section>
    
    <section class="section section-2">
      <div class="content">
        <h1>Pet Records</h1>
        <div class="interactive-block" @click="navigateToDetail(2)">
          <span>Meet My Pets</span>
        </div>
        <p>Cute moments & memories</p>
      </div>
    </section>
    
    <section class="section section-3">
      <div class="content">
        <h1>My Library</h1>
        <div class="interactive-block" @click="navigateToDetail(3)">
          <span>Enter Library</span>
        </div>
        <p>Diaries & Collections</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ... (existing styles) ... */
.scroll-container {
  height: 100vh;
  width: 100vw;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  background-color: #040404;
  
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.section {
  height: 100vh;
  width: 100vw;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.content {
  text-align: center;
  color: white;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  animation: fadeIn 1.5s ease-out;
}

.interactive-block {
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s ease;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.interactive-block:hover {
  background: rgba(100, 108, 255, 0.2);
  border-color: #646cff;
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(100, 108, 255, 0.3);
}

.interactive-block span {
  font-weight: bold;
  letter-spacing: 1px;
  font-size: 0.9rem;
}

h1 {
  font-size: 3rem;
  margin: 0;
  background: linear-gradient(to right, #fff, #646cff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

p {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
