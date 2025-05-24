<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">⚙️ إدارة المنصات</h1>

    <div v-if="loading" class="text-gray-500">جارٍ التحميل...</div>

    <div v-else>

<div
  v-for="platform in platforms"
  :key="platform.id"
  class="p-4 border mb-6 rounded bg-white flex flex-col"
>
  <!-- الاسم والنوع فوق -->
  <div class="mb-4">
    <h2 class="text-lg font-semibold">{{ platform.name }}</h2>
    <p class="text-sm text-gray-500">النوع: {{ platform.type }}</p>
  </div>

  <!-- الأزرار تحت الاسم والنوع -->
  <div class="flex space-x-4 justify-start">
    <button
      @click="togglePlatform(platform.id)"
      :class="isActive(platform.id) ? 'bg-red-500' : 'bg-green-500'"
      class="text-white px-4 py-1 rounded hover:opacity-90 transition"
    >
      {{ isActive(platform.id) ? 'إلغاء التفعيل' : 'تفعيل' }}
    </button>

    <button
      @click="goToPosts(platform.id)"
      class="bg-primary text-white px-4 py-1 rounded hover:opacity-90 transition"
    >
      Posts
    </button>
  </div>
</div>


    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,computed} from 'vue'
import { usePlatformStore } from '@/stores/platformStore'
import { useAuthStore } from '@/stores/authStore' 
import { useRouter } from 'vue-router'

const router = useRouter()
const platformStore = usePlatformStore()
const user = useAuthStore()
const loading = ref(true)
const activePlatformIds = ref([])

const platforms = computed(() => platformStore.platforms)
 
onMounted(async () => {
  loading.value = true
  await platformStore.loadPlatforms()

  await platformStore.loadUserPlatforms()
    activePlatformIds.value = Array.isArray(platformStore.userPlatforms)
  ? platformStore.userPlatforms.map(p => p.id)
  : []
    loading.value = false
   try {
        await user.fetchUser()
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
})


const isActive = (platformId) => {
  return activePlatformIds.value.includes(platformId)
}

const togglePlatform = async (platformId) => {
  try {
    
await platformStore.toggleUserPlatform({ platform_id: platformId })
    
    if (isActive(platformId)) {
      activePlatformIds.value = activePlatformIds.value.filter(id => id !== platformId)
    } else {
      activePlatformIds.value.push(platformId)
    }
  } catch (err) {
    console.error('فشل التبديل:', err)
  }
}
const goToPosts = (platformId) => {
    console.log('Navigating to posts for platform:', platformId)
    router.push({ name: 'platformPosts', params: { platformId } })
}



</script>
<style scoped>
/* حاوية رئيسية */
.p-6 {
  padding: 1.5rem;
  max-width: 480px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2d3748; /* لون نص داكن */
  text-align: right; /* لأن المحتوى عربي */
}

/* العنوان */
h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: #1a202c;
}

/* صندوق كل منصة */
.flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  background-color: #f7fafc;
  transition: box-shadow 0.25s ease;
}
.flex:hover {
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

/* اسم المنصة */
h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c5282;
  margin-bottom: 0.2rem;
}

/* نوع المنصة */
p {
  font-size: 0.9rem;
  color: #718096;
}

/* زر التفعيل / إلغاء التفعيل */
button {
  min-width: 110px;
  padding: 0.5rem 1.3rem;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  font-size: 1rem;
}

/* حالة التفعيل */
.bg-green-500 {
  background-color: #38a169; /* أخضر */
}
.bg-green-500:hover {
  background-color: #2f855a;
  box-shadow: 0 6px 20px rgba(56, 161, 105, 0.45);
}

/* حالة إلغاء التفعيل */
.bg-red-500 {
  background-color: #e53e3e; /* أحمر */
}
.bg-red-500:hover {
  background-color: #9b2c2c;
  box-shadow: 0 6px 20px rgba(229, 62, 62, 0.45);
}

/* نص التحميل */
.text-gray-500 {
  color: #a0aec0;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 2rem;
  text-align: center;
}
.bg-primary {
  background-color: #3b82f6; /* لون أزرق Tailwind blue-500 */
  color: white;
}
.bg-primary:hover {
  background-color: #2563eb; /* blue-600 */
}
</style>