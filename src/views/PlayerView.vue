<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { supabase } from '../supabase';

const router = useRouter();
const route = useRoute();
const tapeId = route.params.tapeId;

const audioElement = ref(new Audio());
const isPlaying = ref(false);
const isLooping = ref(false);
const speed = ref(1);
const currentTape = ref(null);

// Initialize View
onMounted(async () => {
  
  // Set visual defaults based on ID
  const images = [
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop', 
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594623930572-305a0b480b2d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515405295579-ba7b454989d3?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop'
  ];
  const colors = ['#ff7e5f', '#feb47b', '#86a8e7', '#91eae4', '#f6d365', '#fbc2eb'];
  
  const index = parseInt(tapeId) || 1;
  
  // Load Songs from Supabase
  const { data: loadedSongs, error } = await supabase
    .from('songs')
    .select('*')
    .eq('tape_id', tapeId)
    .order('created_at', { ascending: true });

  if (error) console.error('Error loading songs:', error);

  let displaySongs = loadedSongs || [];

  // If empty, show defaults (only visually, don't save to DB)
  if (displaySongs.length === 0) {
    displaySongs = [
        { id: `default-${tapeId}-1`, title: 'Track 01 - Intro (Demo)', audio_url: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg', image_url: null },
        { id: `default-${tapeId}-2`, title: 'Track 02 - Memories', audio_url: null, image_url: null },
        { id: `default-${tapeId}-3`, title: 'Track 03 - Sunset', audio_url: null, image_url: null }
    ];
  }

  currentTape.value = {
    id: tapeId,
    title: `Mixtape #${tapeId}`,
    image: images[index % images.length] || images[0],
    color: colors[index % 6],
    songs: displaySongs
  };
  
  // Audio Event Listeners
  audioElement.value.addEventListener('ended', () => {
    if (isLooping.value) {
      audioElement.value.currentTime = 0;
      audioElement.value.play();
    } else {
      isPlaying.value = false;
    }
  });
});

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.src = '';
  }
});

const goBack = () => {
  router.back();
};

const togglePlay = () => {
  if (audioElement.value.src) {
    if (isPlaying.value) {
      audioElement.value.pause();
    } else {
      audioElement.value.play();
    }
    isPlaying.value = !isPlaying.value;
  }
  else {
    if (currentTape.value && currentTape.value.songs.length > 0) {
      playSong(currentTape.value.songs[0]);
    } else {
      alert("No tracks available.");
    }
  }
};

const toggleLoop = () => { 
  isLooping.value = !isLooping.value; 
};

const adjustSpeed = () => { 
  speed.value = speed.value === 1 ? 1.5 : (speed.value === 1.5 ? 2 : 1);
  if (audioElement.value) {
    audioElement.value.playbackRate = speed.value;
  }
};

const playSong = (song) => {
  if (song.image_url) currentTape.value.image = song.image_url;
  
  if (song.audio_url) {
    audioElement.value.src = song.audio_url;
    audioElement.value.playbackRate = speed.value;
    audioElement.value.play();
    isPlaying.value = true;
  } else {
    console.warn("No audio file for this song");
    isPlaying.value = true; // Fake play
  }
};

// Add Song Logic
const showSongModal = ref(false);
const newSong = reactive({ title: '', audioFile: null, imageFile: null });
const isUploading = ref(false);

const openSongModal = () => {
  newSong.title = '';
  newSong.audioFile = null;
  newSong.imageFile = null;
  showSongModal.value = true;
};

const handleSongUpload = (event, type) => {
  const file = event.target.files[0];
  if (!file) return;
  if (type === 'audio') newSong.audioFile = file;
  if (type === 'image') newSong.imageFile = file;
};

const uploadFile = async (file, path) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('tape-assets')
    .upload(`${path}/${fileName}`, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('tape-assets')
    .getPublicUrl(`${path}/${fileName}`);
    
  return publicUrl;
};

const saveNewSong = async () => {
  if (!newSong.title) return alert('Please enter a title');
  if (!newSong.audioFile) return alert('Please upload an audio file');

  isUploading.value = true;

  try {
    // Upload files
    let audioUrl = null;
    let imageUrl = null;

    if (newSong.audioFile) {
      audioUrl = await uploadFile(newSong.audioFile, 'audio');
    }
    if (newSong.imageFile) {
      imageUrl = await uploadFile(newSong.imageFile, 'images');
    }

    // Save to DB
    const { data, error } = await supabase
      .from('songs')
      .insert([
        {
          tape_id: tapeId,
          title: newSong.title,
          audio_url: audioUrl,
          image_url: imageUrl
        }
      ])
      .select();

    if (error) throw error;

    // Update UI
    if (data) {
      currentTape.value.songs.push(data[0]);
    }
    
    showSongModal.value = false;
  } catch (e) {
    console.error("Upload failed", e);
    alert("Upload failed: " + e.message);
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <div class="player-page">
    
    <!-- Retro Media Player UI -->
    <div class="retro-player" v-if="currentTape">
        <div class="player-header">
          <svg class="doodle-icon side-btn" viewBox="0 0 50 50" @click="toggleLoop" :style="{ opacity: isLooping ? 1 : 0.5 }">
            <path d="M 10 25 C 10 10, 40 10, 40 25 C 40 40, 10 40, 10 25 M 35 20 L 40 25 L 35 30" />
          </svg>
          
          <!-- Exit / Back Button -->
          <svg class="doodle-icon side-btn" viewBox="0 0 50 50" @click="goBack">
            <path d="M 15 15 L 35 35 M 35 15 L 15 35" />
          </svg>
        </div>
        
        <!-- Cover Art -->
        <div class="cover-art-container">
          <img :src="currentTape.image || 'https://via.placeholder.com/280'" alt="Cover Art" class="cover-art" :class="{ 'playing': isPlaying }" />
        </div>
        
        <!-- Progress Bar Area -->
        <div class="progress-area">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>

        <!-- Main Controls -->
        <div class="controls-row">
          <svg class="doodle-icon side-btn" viewBox="0 0 50 50" @click="adjustSpeed">
            <path d="M 10 40 L 10 10 L 30 25 Z M 30 40 L 30 10 L 50 25 Z" /> 
            <text x="15" y="45" font-size="10" fill="white" stroke="none">{{ speed }}x</text>
          </svg>

          <svg class="doodle-icon side-btn" viewBox="0 0 50 50">
            <path d="M 40 10 L 15 25 L 40 40 M 15 10 L 15 40" />
          </svg>

          <svg class="doodle-icon play-btn" viewBox="0 0 60 60" @click="togglePlay">
            <circle cx="30" cy="30" r="28" stroke-dasharray="5,5" /> 
            <path v-if="!isPlaying" d="M 25 15 L 45 30 L 25 45 Z" fill="none" /> 
            <path v-else d="M 22 15 L 22 45 M 38 15 L 38 45" /> 
          </svg>

          <svg class="doodle-icon side-btn" viewBox="0 0 50 50">
            <path d="M 10 10 L 35 25 L 10 40 M 35 10 L 35 40" />
          </svg>

          <div class="side-btn"></div> 
        </div>

        <!-- Song List Section -->
        <div class="song-list-container">
          <div class="song-list-header">
            <span>Tracks</span>
            <button class="add-song-btn" @click="openSongModal">+</button>
          </div>
          <ul class="song-list">
            <li v-for="song in currentTape.songs" :key="song.id" @click="playSong(song)" class="song-item">
              {{ song.title }}
            </li>
          </ul>
        </div>
    </div>
    <div v-else>Loading...</div>

    <!-- Add Song Modal -->
    <div v-if="showSongModal" class="modal-overlay" @click.self="showSongModal = false">
      <div class="modal">
        <h2>添加新歌曲</h2>
        <div class="form-group">
          <label>歌名</label>
          <input v-model="newSong.title" type="text" />
        </div>
        <div class="form-group">
          <label>音频文件</label>
          <input type="file" accept="audio/*" @change="(e) => handleSongUpload(e, 'audio')" />
        </div>
        <div class="form-group">
          <label>封面图片</label>
          <input type="file" accept="image/*" @change="(e) => handleSongUpload(e, 'image')" />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showSongModal = false" :disabled="isUploading">取消</button>
          <button class="save-btn" @click="saveNewSong" :disabled="isUploading">
            {{ isUploading ? '保存中...' : '保存' }}
          </button>
        </div>
        
        <div v-if="isUploading" class="modal-loading">
          <div class="spinner"></div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ... existing styles ... */
.modal { position: relative; }
.save-btn:disabled, .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-loading {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  border-radius: 16px;
}
.spinner {
  width: 30px; height: 30px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.player-page {
  height: 100vh;
  width: 100vw;
  background-color: #040404;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* Re-use styles from DetailView, slightly adjusted for full page centering */
.retro-player {
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  color: white;
}

.player-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.doodle-icon {
  fill: none;
  stroke: white;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.5));
  cursor: pointer;
  transition: transform 0.2s;
}
.doodle-icon:hover { transform: scale(1.1); stroke: #646cff; }
.doodle-icon:active { transform: scale(0.9); }

.progress-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  position: relative;
}
.progress-fill {
  height: 100%;
  background: white;
  width: 40%;
  position: relative;
}
.progress-fill::after { 
  content: '';
  position: absolute;
  right: -5px; top: -5px;
  width: 14px; height: 14px;
  border: 2px solid white;
  border-radius: 50%;
  background: black;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
}
.play-btn { width: 60px; height: 60px; }
.side-btn { width: 40px; height: 40px; }

.cover-art-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 10px 0;
}
.cover-art {
  width: 280px;
  height: 280px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  transition: transform 0.5s ease;
}
.cover-art.playing {
  transform: scale(1.05);
}

.song-list-container {
  width: 100%;
  margin-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 10px;
  max-height: 20vh; /* responsive height */
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.song-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #ccc;
}
.add-song-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.5);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  line-height: 1;
}
.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}
.song-list li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-size: 0.9rem;
  color: #eee;
}
.song-item { cursor: pointer; transition: background 0.2s; }
.song-item:hover { background: rgba(255,255,255,0.1); padding-left: 5px; }

/* Modal Styles (Copy from DetailView) */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 600;
}
.modal {
  background: #1a1a1a;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 8px;
  color: white;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.cancel-btn, .save-btn {
  padding: 10px 20px; border-radius: 6px; cursor: pointer;
}
.cancel-btn { background: transparent; border: 1px solid #666; color: #ccc; }
.save-btn { background: #646cff; border: none; color: white; }
</style>