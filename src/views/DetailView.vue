<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed, ref, reactive, onMounted } from 'vue';
import { supabase } from '../supabase';

const router = useRouter();
const route = useRoute();
const id = route.params.id;

const isLibrary = computed(() => id === '3');
const isTravel = computed(() => id === '1');
const isPets = computed(() => id === '2');

const pageTitle = computed(() => {
  if (isTravel.value) return '旅行';
  if (isPets.value) return '乖康';
  return '日常';
});

const goBack = () => {
  router.back();
};

const selectTape = (tapeId) => {
  router.push(`/player/${tapeId}`);
};

// Reactive Data
const travelData = ref([]);
const petData = ref([]);

// Fetch Data from Supabase
onMounted(async () => {
  if (isLibrary.value) return; // Library is static shelves

  const category = isTravel.value ? 'travel' : 'pets';
  
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('category', category)
    .order('date', { ascending: false });

  if (error) console.error('Error fetching memories:', error);

  if (data && data.length > 0) {
    // Map DB fields to UI fields
    const mappedData = data.map(item => ({
      ...item,
      text: item.description,
      image: item.image_url
    }));

    if (isTravel.value) travelData.value = mappedData;
    if (isPets.value) petData.value = mappedData;
  } else {
    // Fallback defaults if empty
    if (isTravel.value) {
      travelData.value = [
        { date: '2023-12-01', title: '京都之旅', text: '秋天的红叶美不胜收。我们参观了清水寺，吃了美味的拉面。', color: '#ff7e5f', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop' },
        { date: '2023-08-15', title: '巴黎之夏', text: '在埃菲尔铁塔旁野餐。天气完美，虽然人有点多。', color: '#feb47b', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop' },
        { date: '2023-04-10', title: '徒步阿尔卑斯', text: '艰难的攀登，但山顶的景色让一切都值得。', color: '#86a8e7', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop' },
        { date: '2023-01-05', title: '纽约跨年', text: '时代广场的落球仪式！很冷，但气氛热烈。', color: '#91eae4', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop' },
      ];
    } else if (isPets.value) {
      petData.value = [
        { date: '2024-02-20', title: '新玩具', text: '毛球在5分钟内摧毁了那个吱吱作响的玩具。经典操作。', color: '#f6d365', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800&auto=format&fit=crop' },
        { date: '2024-01-10', title: '第一次看兽医', text: '他很勇敢！打针时只哼了一声。', color: '#fda085', image: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=800&auto=format&fit=crop' },
        { date: '2023-12-25', title: '圣诞装扮', text: '看他戴着小圣诞帽的样子。他很讨厌，但看起来太可爱了。', color: '#fbc2eb', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop' },
        { date: '2023-11-05', title: '领养日', text: '欢迎回家，小伙计！一段美好友谊的开始。', color: '#a6c1ee', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop' },
      ];
    }
  }
});

const timelineData = computed(() => {
  if (isTravel.value) return travelData.value;
  if (isPets.value) return petData.value;
  return [];
});

// Add New Card Logic
const showModal = ref(false);
const newCard = reactive({
  date: '',
  title: '',
  text: '',
  imageFile: null,
  imagePreview: null
});
const isUploading = ref(false);

const openModal = () => {
  const today = new Date().toISOString().split('T')[0];
  newCard.date = today;
  newCard.title = '';
  newCard.text = '';
  newCard.imageFile = null;
  newCard.imagePreview = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  newCard.imageFile = file;
  
  // Preview locally
  const reader = new FileReader();
  reader.onload = (e) => { newCard.imagePreview = e.target.result; };
  reader.readAsDataURL(file);
};

const saveCard = async () => {
  if (!newCard.title || !newCard.date) {
    alert('请至少填写标题和日期。');
    return;
  }

  isUploading.value = true;

  try {
    let imageUrl = null;
    if (newCard.imageFile) {
      const fileName = `memory-${Date.now()}-${newCard.imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('tape-assets')
        .upload(`memories/${fileName}`, newCard.imageFile);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('tape-assets')
        .getPublicUrl(`memories/${fileName}`);
      
      imageUrl = publicUrl;
    }

    // Random fallback color
    const fallbackColor = '#'+Math.floor(Math.random()*16777215).toString(16);

    const { data, error } = await supabase
      .from('memories')
      .insert([{
        category: isTravel.value ? 'travel' : 'pets',
        date: newCard.date,
        title: newCard.title,
        description: newCard.text, // Note: mapped to 'text' in template? Need to check usage
        image_url: imageUrl, // mapped to 'image' in template?
        color: fallbackColor
      }])
      .select();

    if (error) throw error;

    // Update Local View
    const newMemory = data[0];
    // Map DB fields to UI fields if necessary (or update template to match DB)
    // Currently template uses: item.text, item.image. DB uses: description, image_url.
    // We should standardize. Let's map it here for the UI.
    const uiMemory = {
      ...newMemory,
      text: newMemory.description,
      image: newMemory.image_url
    };

    if (isTravel.value) travelData.value.unshift(uiMemory);
    else if (isPets.value) petData.value.unshift(uiMemory);

    closeModal();
  } catch (e) {
    console.error('Save failed:', e);
    alert('Save failed: ' + e.message);
  } finally {
    isUploading.value = false;
  }
};

</script>

<template>
  <div class="detail-page">
    
    <div class="header">
      <button @click="goBack" class="back-btn-chalk" title="返回">
        <svg viewBox="0 0 50 30" width="50" height="30" class="chalk-arrow">
          <path d="M 48 15 C 38 13, 28 17, 4 15 M 6 15 C 10 10, 12 8, 16 4 M 6 14 C 10 19, 11 22, 15 26" />
        </svg>
      </button>
      <h1>{{ pageTitle }}</h1>
    </div>

    <!-- Library / Cassette View (ID 3) -->
    <div v-if="isLibrary" class="content library-content">
      <div class="cassette-rack">
        <!-- Shelf 1 -->
        <div class="wood-shelf">
          <div class="tape tape-1" @click="selectTape(1)">
            <div class="tape-label">Lo-Fi</div>
            <div class="tape-holes"><span></span><span></span></div>
          </div>
          <div class="tape tape-2" @click="selectTape(2)">
            <div class="tape-label">Jazz</div>
            <div class="tape-holes"><span></span><span></span></div>
          </div>
          <div class="tape tape-3" @click="selectTape(3)">
            <div class="tape-label">Rock</div>
            <div class="tape-holes"><span></span><span></span></div>
          </div>
        </div>
        <!-- Shelf 2 -->
        <div class="wood-shelf">
           <div class="tape tape-4" @click="selectTape(4)">
            <div class="tape-label">Pop 80s</div>
            <div class="tape-holes"><span></span><span></span></div>
           </div>
           <div class="tape tape-5" @click="selectTape(5)">
            <div class="tape-label">Synth</div>
            <div class="tape-holes"><span></span><span></span></div>
           </div>
        </div>
        <!-- Shelf 3 -->
        <div class="wood-shelf">
          <div class="tape tape-6" @click="selectTape(6)">
            <div class="tape-label">Ambient</div>
            <div class="tape-holes"><span></span><span></span></div>
          </div>
          <div class="tape tape-1" @click="selectTape(7)">
            <div class="tape-label">Piano</div>
            <div class="tape-holes"><span></span><span></span></div>
          </div>
        </div>
      </div>
      <p>选择一盘磁带播放</p>
    </div>

    <!-- Timeline View (ID 1 & 2) -->
    <div v-else class="timeline-container">
      <div class="timeline">
        <div v-for="(item, index) in timelineData" :key="index" class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-date">{{ item.date }}</div>
          <div class="card">
            <!-- Updated Image Display -->
            <div v-if="item.image" class="card-image-container">
              <img :src="item.image" alt="Memory" class="card-img-display" />
            </div>
            <div v-else class="card-image-container placeholder" :style="{ backgroundColor: item.color }">
              <span>无图片</span>
            </div>
            
            <div class="card-content">
              <h2>{{ item.title }}</h2>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>
      <button class="fab" @click="openModal">+</button>
    </div>

    <!-- Add Card Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>添加新回忆</h2>
        <div class="form-group">
          <label>日期</label>
          <input v-model="newCard.date" type="date" />
        </div>
        <div class="form-group">
          <label>标题</label>
          <input v-model="newCard.title" type="text" placeholder="发生了什么？" />
        </div>
        <div class="form-group">
          <label>图片</label>
          <input type="file" accept="image/*" @change="handleImageUpload" />
          <div v-if="newCard.image" class="image-preview">
            <img :src="newCard.image" alt="Preview" />
          </div>
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="newCard.text" rows="4" placeholder="讲述你的故事..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal" :disabled="isUploading">取消</button>
          <button class="save-btn" @click="saveCard" :disabled="isUploading">
            {{ isUploading ? '保存中...' : '保存' }}
          </button>
        </div>
        
        <!-- Loading Overlay inside Modal -->
        <div v-if="isUploading" class="modal-loading">
          <div class="spinner"></div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ... existing styles ... */

.save-btn:disabled, .cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal {
  position: relative; /* For absolute loading overlay */
}

.modal-loading {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-page {
  height: 100vh;
  width: 100vw;
  background-color: #040404;
  color: white;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  overflow-y: auto;
  overflow-x: hidden;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(4, 4, 4, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
}

.back-btn-chalk {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn-chalk:hover {
  transform: scale(1.1) translateX(-5px);
}

.chalk-arrow {
  fill: none;
  stroke: rgba(255, 255, 255, 0.95);
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1000; 
  stroke-dashoffset: 0;
  filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.5)) blur(0.4px);
}

/* Library Styles */
.library-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 150px;
  gap: 2rem;
  animation: fadeIn 0.8s ease-out;
  width: 100%;
  overflow-y: visible;
}

.cassette-rack {
  width: 80%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 30vh;
  background: transparent;
  border: none;
  box-shadow: none;
  margin-top: 5vh;
}

.wood-shelf {
  height: 15px;
  background: #5d4037;
  border-radius: 2px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 15px;
  box-shadow: 0 20px 30px rgba(0,0,0,0.5);
  border: none;
  padding: 0 20px;
  padding-bottom: 15px;
}

.tape {
  width: 35px;
  height: 140px;
  background: #222;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  bottom: 0;
  transition: transform 0.2s, bottom 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 2px 5px 10px rgba(0,0,0,0.4);
}

.tape:hover {
  transform: translateY(-10px) scale(1.05);
  z-index: 10;
}

.tape-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  background: #eee;
  color: #333;
  height: 80%;
  width: 80%;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  padding: 4px 0;
  border-radius: 2px;
  overflow: hidden;
}

.tape-holes {
  display: none;
}

/* Timeline Styles */
.timeline-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  animation: fadeIn 0.8s ease-out;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.timeline-item {
  position: relative;
  margin-bottom: 60px;
}

.timeline-marker {
  position: absolute;
  left: -34px;
  top: 20px;
  width: 10px;
  height: 10px;
  background: #646cff;
  border-radius: 50%;
  border: 2px solid #040404;
  box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.5);
}

.timeline-date {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 10px;
  font-family: monospace;
}

.card {
  background: transparent;
  border: none;
  box-shadow: none;
  margin-bottom: 20px;
}

/* New Image Styles */
.card-image-container {
  width: 100%;
  height: 300px; 
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
  background: transparent; /* Completely transparent */
}

.card-image-container.placeholder {
  color: rgba(0,0,0,0.3);
  font-weight: bold;
  font-size: 1.5rem;
  background: rgba(255,255,255,0.1); /* Keep placeholder visible */
}

.card-img-display {
  width: 100%;
  height: 100%;
  object-fit: contain; 
}

.card-content {
  padding: 0 10px; /* Reduced padding since border is gone */
}

.card-content h2 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: white;
}

.card-content p {
  margin: 0;
  color: #ccc;
  line-height: 1.6;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fab {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #646cff;
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(100, 108, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s, background 0.3s;
  z-index: 200;
}

.fab:hover {
  transform: scale(1.1) rotate(90deg);
  background: #535bf2;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: #1a1a1a;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: white;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  color: #888;
}

input[type="text"],
input[type="date"],
textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-family: inherit;
}

input[type="file"] {
  color: white;
}

textarea {
  resize: vertical;
}

.image-preview {
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.image-preview img {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
  display: block;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #666;
  color: #ccc;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.save-btn {
  background: #646cff;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.save-btn:hover {
  background: #535bf2;
}
</style>
