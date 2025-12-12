<script setup>
import { useRouter } from 'vue-router';
import { ref, reactive, onMounted } from 'vue';
import { supabase } from '../supabase';

const router = useRouter();

// Default Data (Fallback)
const defaultSections = [
  { 
    id: 1, 
    title: '旅行', 
    subtitle: '和我一起探索世界', 
    actionText: '查看旅程', 
    videoUrl: 'https://www.xiqianyangyi.com/imgs23/videos/fazitianran.mp4',
    poster: 'https://www.xiqianyangyi.com/imgs23/videos/fazitianran-cover.png'
  },
  { 
    id: 2, 
    title: '乖康', 
    subtitle: '可爱的瞬间与回忆', 
    actionText: '遇见我的宠物',
    videoUrl: 'https://www.xiqianyangyi.com/imgs23/videos/fazitianran.mp4',
    poster: 'https://www.xiqianyangyi.com/imgs23/videos/fazitianran-cover.png'
  },
  { 
    id: 4, 
    title: '谷子', 
    subtitle: '我的周边与收藏', 
    actionText: '查看收藏',
    videoUrl: 'https://www.xiqianyangyi.com/imgs23/videos/fazitianran.mp4',
    poster: 'https://www.xiqianyangyi.com/imgs23/videos/fazitianran-cover.png'
  },
  { 
    id: 3, 
    title: '日常', 
    subtitle: '日记与收藏', 
    actionText: '进入书房',
    videoUrl: 'https://www.xiqianyangyi.com/imgs23/videos/fazitianran.mp4',
    poster: 'https://www.xiqianyangyi.com/imgs23/videos/fazitianran-cover.png'
  }
];

// State
const sections = ref(defaultSections);

// Fetch from Supabase
onMounted(async () => {
  const { data, error } = await supabase
    .from('home_sections')
    .select('*')
    .order('id', { ascending: true }); // Ensure fixed order: 1, 2, 3, 4

  if (error) {
    console.error('Error fetching sections:', error);
    return;
  }

  if (data && data.length > 0) {
    // Custom sort to match desired visual order: 1 (Travel), 2 (Pets), 4 (Guzi), 3 (Daily)
    // We can just rely on the template loop, but let's reorder the array to match our design preference
    // The DB has IDs 1, 2, 3, 4. 
    // We want order: 1, 2, 4, 3
    
    // Map DB (snake_case) to UI (camelCase)
    const mapped = data.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      actionText: item.action_text,
      videoUrl: item.video_url,
      poster: item.poster
    }));

    // Sort manually to match: 1, 2, 4, 3
    const desiredOrder = [1, 2, 4, 3];
    mapped.sort((a, b) => desiredOrder.indexOf(a.id) - desiredOrder.indexOf(b.id));

    sections.value = mapped;
  }
});

const navigateToDetail = (id) => {
  router.push(`/detail/${id}`);
};

// Settings Modal Logic
const showSettings = ref(false);
const currentEditId = ref(null);
const isSaving = ref(false);
const selectedVideoFile = ref(null); // New state for file
const editForm = reactive({
  title: '',
  subtitle: '',
  videoUrl: ''
});

const openSettings = (section) => {
  currentEditId.value = section.id;
  editForm.title = section.title;
  editForm.subtitle = section.subtitle;
  editForm.videoUrl = section.videoUrl;
  selectedVideoFile.value = null; // Reset file
  showSettings.value = true;
};

const closeSettings = () => {
  showSettings.value = false;
  currentEditId.value = null;
};

const handleVideoFile = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedVideoFile.value = file;
  }
};

const saveSettings = async () => {
  if (!currentEditId.value) return;
  isSaving.value = true;

  try {
    let finalVideoUrl = editForm.videoUrl;

    // Upload Video if file selected
    if (selectedVideoFile.value) {
      const file = selectedVideoFile.value;
      const fileExt = file.name.split('.').pop();
      const fileName = `videos/section-${currentEditId.value}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tape-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tape-assets')
        .getPublicUrl(fileName);

      finalVideoUrl = publicUrl;
    }

    const { error } = await supabase
      .from('home_sections')
      .update({
        title: editForm.title,
        subtitle: editForm.subtitle,
        video_url: finalVideoUrl
      })
      .eq('id', currentEditId.value);

    if (error) throw error;

    // Update Local State on success
    const index = sections.value.findIndex(s => s.id === currentEditId.value);
    if (index !== -1) {
      sections.value[index].title = editForm.title;
      sections.value[index].subtitle = editForm.subtitle;
      sections.value[index].videoUrl = finalVideoUrl;
    }
    
    closeSettings();
  } catch (err) {
    console.error(err);
    alert('Failed to save settings: ' + err.message);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="scroll-container">
    
    <section 
      v-for="section in sections" 
      :key="section.id" 
      class="section"
    >
      <div class="settings-btn" @click.stop="openSettings(section)">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </div>

      <div class="content">
        <h1>{{ section.title }}</h1>
        
        <!-- Video Wrapper Component -->
        <div class="videoWrapper___XGPv0" @click="navigateToDetail(section.id)">
          <div class="fazi___2Kd-r"></div>
          <div class="tianran___vnish"></div>
          <video 
            :src="section.videoUrl" 
            loop 
            muted
            autoplay
            class="video___1hJEZ" 
            x5-playsinline="true" 
            playsinline="" 
            webkit-playsinline="true" 
            x-webkit-airplay="true" 
            x5-video-orientation="portraint" 
            :poster="section.poster"
          ></video>
        </div>

        <p>{{ section.subtitle }}</p>
      </div>
    </section>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="modal-overlay" @click.self="closeSettings">
      <div class="modal">
        <h2>编辑版块</h2>
        <div class="form-group">
          <label>标题</label>
          <input v-model="editForm.title" type="text" />
        </div>
        <div class="form-group">
          <label>副标题</label>
          <input v-model="editForm.subtitle" type="text" />
        </div>
        <div class="form-group">
          <label>上传视频</label>
          <input type="file" accept="video/*" @change="handleVideoFile" />
          <p v-if="editForm.videoUrl && !selectedVideoFile" class="hint">当前使用链接: {{ editForm.videoUrl.substring(0, 30) }}...</p>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeSettings" :disabled="isSaving">取消</button>
          <button class="save-btn" @click="saveSettings" :disabled="isSaving">
            {{ isSaving ? '上传保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.scroll-container {
  height: 100vh;
  width: 100vw;
  overflow-y: scroll;
  scroll-snap-type: y mandatory; /* Enable snapping */
  background-color: #040404;
  
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
  word-break: break-all;
}

.section {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  scroll-snap-align: start; /* Snap each section */
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

.settings-btn {
  position: absolute;
  top: 40px;
  right: 40px;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  z-index: 10;
  transition: color 0.3s;
  padding: 10px;
}

.settings-btn:hover {
  color: white;
}

/* Video Wrapper Styles */
.videoWrapper___XGPv0 {
  width: calc(100vw - 40px); /* Fill screen width minus 20px margins each side */
  max-width: 500px; /* Cap width for desktop */
  aspect-ratio: 9/16; /* Maintain portrait aspect ratio */
  height: auto;
  max-height: 70vh; /* Prevent vertical overflow on small screens */
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: none;
  margin: 0 20px; /* 20px margin on sides */
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  background: black;
}

.videoWrapper___XGPv0:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(100, 108, 255, 0.3);
}

.video___1hJEZ {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Text Overlays in Video (Empty for now, but positioned) */
.fazi___2Kd-r, .tianran___vnish {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  /* Add gradients or text styles here if needed */
}

h1 {
  font-size: 3rem;
  margin: 0;
  color: white;
}

p {
  font-size: 1rem;
  color: #ccc;
  margin: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
}

.modal {
  background: #1a1a1a;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.modal h2 {
  margin-top: 0;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.form-group label {
  font-size: 0.9rem;
  color: #888;
}

input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
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
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.save-btn {
  background: #646cff;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
</style>
