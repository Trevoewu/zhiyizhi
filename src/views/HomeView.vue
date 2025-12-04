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
        <h1>旅行</h1>
        <div class="interactive-block" @click="navigateToDetail(1)">
          <span>查看旅程</span>
        </div>
        <p>和我一起探索世界</p>
      </div>
    </section>
    
    <section class="section section-2">
      <div class="content">
        <h1>乖康</h1>
        <div class="interactive-block" @click="navigateToDetail(2)">
          <span>遇见我的宠物</span>
        </div>
        <p>可爱的瞬间与回忆</p>
      </div>
    </section>
    
    <section class="section section-3">
      <div class="content">
        <h1>日常</h1>
        <div class="interactive-block" @click="navigateToDetail(3)">
          <span>进入书房</span>
        </div>
        <p>日记与收藏</p>
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
  color: white; /* Changed from gradient to white */
}

p {
  font-size: 1rem;
  color: #ccc; /* Lighter grey/white for better visibility */
  margin: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
