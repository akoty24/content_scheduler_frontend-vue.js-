<template>
  <div class="create-post">
    <h2>Create New Post</h2>
    
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          maxlength="100"
          placeholder="Enter post title"
        />
        <small>{{ form.title.length }}/100</small>
      </div>

      <div class="form-group">
        <label for="content">Post Content</label>
        <textarea
          id="content"
          v-model="form.content"
          required
          maxlength="500"
          placeholder="Write your post content here..."
          @input="updateCharCount"
        ></textarea>
        <small>{{ charCount }}/500 characters</small>
      </div>

      <div class="form-group">
        <label for="image">Image Upload</label>
        <input id="image" type="file" @change="handleImageUpload" accept="image/*" />
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Image Preview" />
        </div>
      </div>

  <div class="form-group">
    <label for="platforms">Platforms</label>
    <Multiselect
      v-model="form.platform_ids"
      :options="platforms"
      :multiple="true"
      :close-on-select="false"
      :clear-on-select="false"
      :preserve-search="true"
      placeholder="Select one or more platforms"
      label="name"
      track-by="id"
      :custom-label="option => option.name"
      open-direction="bottom"
    />
  </div>

      <div class="form-group">
        <label for="scheduled_time">Schedule Time</label>
        <input
          type="datetime-local"
          id="scheduled_time"
          v-model="form.scheduled_time"
        />
      </div>

      <button type="submit">Create Post</button>
    </form>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useHomeStore } from '@/stores/homeStore'
import { usePlatformStore } from '@/stores/platformStore'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

// Stores
const postStore = useHomeStore()
const platformStore = usePlatformStore()
const router = useRouter()

// Form state
const form = ref({
  title: '',
  content: '',
  image: null,
  platform_ids: [],
  scheduled_time: '',
})

// Additional reactive states
const platforms = ref([])
const charCount = ref(0)
const imagePreview = ref(null)

// Fetch platforms from backend dynamically using platformStore
const fetchUserPlatforms = async () => {
  try {
    await platformStore.loadUserPlatforms()
    platforms.value = platformStore.userPlatforms
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message,
    })
  }
}

// Update character counter for content textarea
const updateCharCount = () => {
  charCount.value = form.value.content.length
}

// Handle image upload and show preview
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.image = file
    imagePreview.value = URL.createObjectURL(file)
  } else {
    form.value.image = null
    imagePreview.value = null
  }
}

const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('content', form.value.content)
    formData.append('scheduled_time', form.value.scheduled_time)
    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    // Append platform_ids
      form.value.platform_ids.forEach(platform => {
        formData.append('platform_ids[]', platform.id)
      })

    const response = await postStore.createPost(formData, token)
    console.log("Response:", response)
if (response.status !== 'success') {
  throw new Error(response.message || 'Failed to create post')
}
    await Swal.fire({
      toast: true,
      icon: 'success',
      title: 'Post Created',
      text: 'Your post has been created successfully!'
    })
    router.push('/')
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message
    })
  }
}


// عند تحميل المكون، قم بجلب المنصات
onMounted(async () => {
  await fetchUserPlatforms()
})
</script>


<style scoped>
.create-post {
  max-width: 600px;
  margin: auto;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px #ccc;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}
select[multiple] {
  height: 40px; /* Show approx. one option height */
  overflow-y: auto;
}
input[type="text"],
textarea,
select,
input[type="datetime-local"],
input[type="file"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  background-color: #2c3e50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.limited-select {
  height: 40px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 4px;
  resize: none;
}

.image-preview img {
  margin-top: 1rem;
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}
</style>
