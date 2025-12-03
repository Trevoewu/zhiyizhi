<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed, ref, reactive } from 'vue';

const router = useRouter();
const route = useRoute();
const id = route.params.id;

const isLibrary = computed(() => id === '3');
const isTravel = computed(() => id === '1');
const isPets = computed(() => id === '2');

const pageTitle = computed(() => {
  if (isTravel.value) return 'Travel Journey';
  if (isPets.value) return 'Pet Memories';
  return 'My Library';
});

const goBack = () => {
  router.back();
};

const selectBook = (bookId) => {
  console.log('Book selected:', bookId);
  alert(`You selected book #${bookId}`);
};

// Helper to load from storage or return default
const loadData = (key, defaultData) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

// Reactive Data
const travelData = ref(loadData('travelData', [
  { date: '2023-12-01', title: 'Trip to Kyoto', text: 'The autumn leaves were breathtaking. We visited Kiyomizu-dera and ate amazing ramen.', color: '#ff7e5f', image: null },
  { date: '2023-08-15', title: 'Summer in Paris', text: 'Picnic by the Eiffel Tower. The weather was perfect, though a bit crowded.', color: '#feb47b', image: null },
  { date: '2023-04-10', title: 'Hiking the Alps', text: 'A challenging climb but the view from the top made it all worth it.', color: '#86a8e7', image: null },
  { date: '2023-01-05', title: 'New Year in NYC', text: 'Times Square ball drop! Cold but electric atmosphere.', color: '#91eae4', image: null },
]));

const petData = ref(loadData('petData', [
  { date: '2024-02-20', title: 'Got a new toy', text: 'Fluffy destroyed the squeaky toy in 5 minutes. Classic.', color: '#f6d365', image: null },
  { date: '2024-01-10', title: 'First Vet Visit', text: 'He was so brave! Just a little whine during the shot.', color: '#fda085', image: null },
  { date: '2023-12-25', title: 'Christmas Outfit', text: 'Look at him in his little Santa hat. He hates it but looks adorable.', color: '#fbc2eb', image: null },
  { date: '2023-11-05', title: 'Adoption Day', text: 'Welcome home, buddy! The start of a beautiful friendship.', color: '#a6c1ee', image: null },
]));

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
  image: null
});

const openModal = () => {
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  newCard.date = today;
  newCard.title = '';
  newCard.text = '';
  newCard.image = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Max dimensions
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG with 0.7 quality
      newCard.image = canvas.toDataURL('image/jpeg', 0.7);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const saveCard = () => {
  if (!newCard.title || !newCard.date) {
    alert('Please fill in at least the Title and Date.');
    return;
  }

  const cardToAdd = {
    date: newCard.date,
    title: newCard.title,
    text: newCard.text,
    image: newCard.image,
    color: '#'+Math.floor(Math.random()*16777215).toString(16) // Random color fallback
  };

  // Re-sort by date descending
  travelData.value.sort((a, b) => new Date(b.date) - new Date(a.date));
  petData.value.sort((a, b) => new Date(b.date) - new Date(a.date));

  try {
    if (isTravel.value) {
      localStorage.setItem('travelData', JSON.stringify(travelData.value));
    } else if (isPets.value) {
      localStorage.setItem('petData', JSON.stringify(petData.value));
    }
  } catch (e) {
    console.error("Storage failed:", e);
    alert("Storage full! The image might be too large. Try a smaller image or clear some data.");
    // Optionally revert the addition if strict consistency is needed, 
    // but for now we keep it in memory so the user doesn't lose their text.
  }

  closeModal();
};
</script>

<template>
  <div class="detail-page">
    
    <div class="header">
      <button @click="goBack" class="back-btn-chalk" title="Go Back">
        <svg viewBox="0 0 50 30" width="50" height="30" class="chalk-arrow">
          <!-- More wobbly, doodle-style path -->
          <path d="M 48 15 C 38 13, 28 17, 4 15 M 6 15 C 10 10, 12 8, 16 4 M 6 14 C 10 19, 11 22, 15 26" />
        </svg>
      </button>
      <h1>{{ pageTitle }}</h1>
    </div>

    <!-- Library View (ID 3) -->
    <div v-if="isLibrary" class="content library-content">
      <div class="bookshelf">
        <!-- Shelf 1 -->
        <div class="shelf">
          <div class="book book-1" @click="selectBook(1)"></div>
          <div class="book book-2" @click="selectBook(2)"></div>
          <div class="book book-3" @click="selectBook(3)"></div>
          <div class="book book-4" @click="selectBook(4)"></div>
        </div>
        <!-- Shelf 2 -->
        <div class="shelf">
           <div class="book book-2" @click="selectBook(5)"></div>
           <div class="book book-5" @click="selectBook(6)"></div>
           <div class="book book-1" @click="selectBook(7)"></div>
           <div class="book book-3" @click="selectBook(8)"></div>
           <div class="book book-4" @click="selectBook(9)"></div>
        </div>
        <!-- Shelf 3 -->
        <div class="shelf">
          <div class="book book-3" @click="selectBook(10)"></div>
          <div class="book book-4" @click="selectBook(11)"></div>
          <div class="book book-1" @click="selectBook(12)"></div>
        </div>
      </div>
      <p>Select a book to read</p>
    </div>

    <!-- Timeline View (ID 1 & 2) -->
    <div v-else class="timeline-container">
      <div class="timeline">
        <div v-for="(item, index) in timelineData" :key="index" class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-date">{{ item.date }}</div>
          <div class="card">
            <!-- Display uploaded image if exists, else fallback color block -->
            <div v-if="item.image" class="card-image" :style="{ backgroundImage: `url(${item.image})` }"></div>
            <div v-else class="card-image" :style="{ backgroundColor: item.color }">
              <span>No Image</span>
            </div>
            
            <div class="card-content">
              <h2>{{ item.title }}</h2>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Floating Add Button -->
      <button class="fab" @click="openModal">+</button>
    </div>

    <!-- Add Card Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>Add New Memory</h2>
        
        <div class="form-group">
          <label>Date</label>
          <input v-model="newCard.date" type="date" />
        </div>
        
        <div class="form-group">
          <label>Title</label>
          <input v-model="newCard.title" type="text" placeholder="What happened?" />
        </div>
        
        <div class="form-group">
          <label>Image</label>
          <input type="file" accept="image/*" @change="handleImageUpload" />
          <div v-if="newCard.image" class="image-preview">
            <img :src="newCard.image" alt="Preview" />
          </div>
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newCard.text" rows="4" placeholder="Tell the story..."></textarea>
        </div>
        
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">Cancel</button>
          <button class="save-btn" @click="saveCard">Save Memory</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.detail-page {
  height: 100vh; /* Fixed height to viewport */
  width: 100vw;
  background-color: #040404;
  color: white;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  overflow-y: auto; /* Enable vertical scrolling */
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
  background: linear-gradient(to right, #fff, #646cff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
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
  /* Rough/Uneven stroke effect */
  stroke-dasharray: 1000; 
  stroke-dashoffset: 0;
  filter: url(#roughpaper); /* If we had an SVG filter, but here just use drop-shadow + blur */
  filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.5)) blur(0.4px);
}

/* Library Styles */
.library-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  animation: fadeIn 0.8s ease-out;
}

.bookshelf {
  width: 320px;
  padding: 10px;
  background: #1a1a1a;
  border: 4px solid #333;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.shelf {
  height: 80px;
  border-bottom: 4px solid #5d4037;
  display: flex;
  align-items: flex-end;
  padding: 0 10px;
  gap: 5px;
  background: rgba(0,0,0,0.2);
}

.book {
  width: 20px;
  border-radius: 2px 2px 0 0;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  position: relative;
}

.book:hover {
  transform: translateY(-5px) scale(1.1);
  z-index: 10;
  box-shadow: 0 5px 10px rgba(0,0,0,0.5);
}

.book-1 { height: 65px; background: #ef5350; }
.book-2 { height: 75px; background: #42a5f5; }
.book-3 { height: 60px; background: #66bb6a; }
.book-4 { height: 70px; background: #ffa726; }
.book-5 { height: 55px; background: #ab47bc; }

.book::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255,255,255,0.2);
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
  padding-left: 30px; /* Space for the line */
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
  left: -34px; /* Adjust based on padding-left of timeline */
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  border-color: rgba(100, 108, 255, 0.3);
}

.card-image {
  height: 200px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0,0,0,0.3);
  font-weight: bold;
  font-size: 1.5rem;
  text-transform: uppercase;
  background-size: cover;
  background-position: center;
}

.card-content {
  padding: 20px;
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

/* Floating Action Button */
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

/* Modal Styles */
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
