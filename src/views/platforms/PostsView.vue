<template>
        <h1 class="title">Posts for Platform: {{ platformName }}</h1>
        <div class="post-stats">
          <div class="stat-item">📅 Scheduled: {{ postStats.scheduled }}</div>
          <div class="stat-item">✅ Published: {{ postStats.published }}</div>
        </div>

    <div class="page-header">

      <div class="header-bar">
        <input
          v-model="search"
          type="text"
          placeholder="Search posts..."
          class="search-input"
        />

          <select v-model.number="itemsPerPage" @change="resetPage" class="per-page-select">
    <option :value="5">5 per page</option>
    <option :value="10">10 per page</option>
    <option :value="15">15 per page</option>
    <option :value="25">25 per page</option>
  </select>
      </div>
      
    </div>

    <div v-if="loading" class="loading">Loading posts...</div>

    <div v-else-if="filteredPosts.length === 0" class="no-posts">No posts found.</div>

    <div v-else class="table-wrapper">
      <table class="custom-table">
        <thead>
          <tr>
            <th @click="sortBy('title')">Title</th>
            <th @click="sortBy('content')">Content</th>
            <th>Image</th>
            <th @click="sortBy('scheduled_time')">Scheduled Time</th>
            <th @click="sortBy('status')">Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in paginatedPosts" :key="post.id">
            <td>{{ post.title }}</td>
            <td>{{ post.content }}</td>
            <td>
              <img
                v-if="post.image_url"
                :src="post.image_url"
                alt="Post Image"
                class="post-img"
              />
            </td>
            <td>{{ post.scheduled_time || 'Not Scheduled' }}</td>
            <td>
              <span :class="statusClass(post.status)">
                {{ post.status }}
              </span>
            </td>
            <td>
              <button class="action-btn delete" @click="deletePost(post.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePlatformStore } from '@/stores/platformStore'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'
import { useHomeStore } from '@/stores/homeStore'

const platformStore = usePlatformStore()
const authStore = useAuthStore()
const loading = ref(true)
const platformName = ref('')
const route = useRoute()
const home = useHomeStore()
const search = ref('')
const sortKey = ref('title')
const sortOrder = ref(1)
const currentPage = ref(1)
const itemsPerPage = ref(5) 

const posts = computed(() => platformStore.platformPosts)
const postStats = computed(() => {
  const scheduled = posts.value.filter(p => p.status === 'scheduled').length
  const published = posts.value.filter(p => p.status === 'published').length
  return { scheduled, published }
})
const filteredPosts = computed(() => {
  const term = search.value.toLowerCase()
  return posts.value.filter(post =>
    (post.title?.toLowerCase().includes(term) ||
     post.content?.toLowerCase().includes(term) ||
     post.status?.toLowerCase().includes(term))
  )
})

// const sortedPosts = computed(() => {
//   return filteredPosts.value.slice().sort((a, b) => {
//     const valA = a[sortKey.value] || ''
//     const valB = b[sortKey.value] || ''
//     return valA.localeCompare(valB) * sortOrder.value
//   })
// })

const paginatedPosts = computed(() => posts.value)

 watch([sortKey, sortOrder, search, currentPage, itemsPerPage], async () => {
  loading.value = true
  try {
    const platformId = route.params.platformId
    const payload = {
      sortKey: sortKey.value,
      sortOrder: sortOrder.value,
      search: search.value,
      page: currentPage.value,
      perPage: itemsPerPage.value,
    }
    await platformStore.loadPlatformPosts(platformId, payload)
  } catch (error) {
    console.error('Error loading posts:', error)
  } finally {
    loading.value = false
  }
})

const totalPages = computed(() => platformStore.pagination?.last_page || 1)

  const deletePost = async (postId) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to recover this post!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      })
      if (result.isConfirmed) {
          try {
            await home.deletePost(postId)
            await Swal.fire({
              icon: 'success',
              title: 'Post deleted successfully!',
              showConfirmButton: false,
              timer: 1500
            })
                  location.reload();

          } catch (error) {
            console.error('Failed to delete post:', error)
            await Swal.fire({
              icon: 'error',
              title: 'Error deleting post',
              text: error.message,
            })
          }
        }
    }

function sortBy(key) {
  if (sortKey.value === key) sortOrder.value = -sortOrder.value
  else {
    sortKey.value = key
    sortOrder.value = 1
  }
}

async function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    
  }
}

async function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
   
  }
}


function statusClass(status) {
  switch (status) {
    case 'published':
      return 'status-chip bg-green'
    case 'draft':
      return 'status-chip bg-gray'
    case 'scheduled':
      return 'status-chip bg-blue'
    case 'failed':
      return 'status-chip bg-red'
    default:
      return 'status-chip bg-default'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const platformId = route.params.platformId
        const payload = {
      sortKey: sortKey.value,
      sortOrder: sortOrder.value,
      search: search.value,
      page: currentPage.value,
      perPage: itemsPerPage.value,

    }
     await platformStore.loadPlatformPosts(platformId, payload)
     const platform =await platformStore.getPlatformById(platformId)

     platformName.value = platform?.name || 'Unknown'
    await authStore.fetchUser()
  } catch (err) {
    console.error('Error loading posts:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}



.title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center; /* خلي العنوان عاليسار */
  color: #2c3e50;
  margin-top: 10px;
}

.search-input {
  flex-grow: 1; /* خلى البحث ياخد أكبر مساحة ممكنة */
  padding: 0.6rem 1rem;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.add-button {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap; /* يخلي النص في السطر */
}

.table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.custom-table {
  width: 100%; /* خلي الجدول ياخد العرض الكامل */
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.custom-table th,
.custom-table td {
  padding: 0.9rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.custom-table th {
  background: #f3f3f3;
  font-weight: 600;
  cursor: pointer;
}

.custom-table tr:last-child td {
  border-bottom: none;
}

.post-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.status-chip {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  display: inline-block;
}

.bg-green {
  background-color: #2ecc71;
}
.bg-blue {
  background-color: #3498db;
}
.bg-gray {
  background-color: #7f8c8d;
}
.bg-red {
  background-color: #e74c3c;
}
.bg-default {
  background-color: #95a5a6;
}

.action-btn {
  margin: 0 4px;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}

.action-btn.edit {
  background-color: #2980b9;
  color: #fff;
}

.action-btn.delete {
  background-color: #c0392b;
  color: #fff;
}

.pagination {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 1.1rem;
  width: 100%;
}

.pagination button {
  background-color: #34495e;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.page-header {
  display: flex;
  flex-direction: column; /* عمودي: عنوان فوق، وبعدين البحث */
  gap: 1rem; /* مسافة بين العنوان والبحث */
  margin-bottom: 1.5rem;
  width: 50%;
}

.header-bar {
  display: flex;
  gap: 1rem;
  width: 100%;
  align-items: center;
}

.post-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.stat-item {
  background-color: #ecf0f1;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}
.per-page-select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}
</style>