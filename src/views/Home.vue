<template>
  <div class="dashboard">
    <h1 v-if="user.user">Welcome, {{ user.user.name }}!</h1>
    <h1 v-else>Welcome!</h1>
    <p>This is your content scheduler dashboard.</p>

    <div class="quick-actions">
      <router-link class="btn create" to="/posts/create">📝 Create Post</router-link>
      <router-link class="btn settings" to="/settings"> ⚙️ Manage Platforms</router-link>
    </div>
<div class="calendar-view">

      <h2>📅</h2>
      <p>Scheduled Posts</p>

      <div class="calendar">
<VueCal
  :events="calendarEvents"
  default-view="week"
  time
  style="height: 800px;"
>
  <template #event="{ event }">
    <div class="custom-event">
      <strong>{{ event.title }}</strong>
      <span>{{ formatDate(event.start) }}</span>
    </div>
  </template>
  <template #day="{ date }">
    <div class="day-header">{{ date.toLocaleDateString() }}</div>
  </template>
</VueCal>



      </div>

</div>

    <!-- Stats -->
    <div class="stats">
      <div class="card">
        <h3>📅 Scheduled</h3>
        <p>{{ scheduled }}</p>
      </div>
      <div class="card">
        <h3>✅ Published</h3>
        <p>{{ published }}</p>
      </div>
      <div class="card">
        <h3>📝 draft</h3>
        <p>{{ draft }}</p>
      </div>
    </div>

    <!-- Filters -->
     <div class="filters">
      <select v-model="selectedStatus" @change="loadFilteredPosts">
        <option value="">All</option>
        <option value="draft">Draft</option>
        <option value="scheduled">Scheduled</option>
        <option value="published">Published</option>
      </select>

      <input type="date" v-model="selectedDate" @change="loadFilteredPosts" />

      
  <select v-model="perPage" @change="loadFilteredPosts">
    <option :value="5">5 per page</option>
    <option :value="10">10 per page</option>
    <option :value="20">20 per page</option>
    <option :value="50">50 per page</option>
  </select>
    </div>

<div class="post-list">
  <h2>📋 Your Posts</h2>
  <template v-if="home.posts.length">
  <div v-for="post in home.posts" :key="post.id" class="post-card">
  <h3 class="post-title">{{ post.title }}</h3>

  <div v-if="post.image_url" class="post-image">
    <img :src="post.image_url" alt="Post Image" />
  </div>

  <p class="post-content">
    {{ post.content.length > 150 ? post.content.slice(0, 150) + '...' : post.content }}
  </p>

  <div class="meta">
    <span class="badge" :class="post.status">{{ post.status }}</span>
    <span class="post-date">{{ formatDate(post.scheduled_time) }}</span>
  </div>

  <hr style="margin: 1rem 0" />
  <br>

  <div class="row" style="position: absolute; bottom: 10px; right: 10px; display: flex; gap: 8px;">
    <button class="btn-delete" @click="deletePost(post.id)">🗑️ Delete</button>
  </div>
</div>

    <div class="pagination">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">⬅️</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === home.totalPages">➡️</button>
    </div>
  </template>
  <p v-else class="no-posts-msg">No posts found.</p>
</div>


  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import { useHomeStore } from '@/stores/homeStore'
import { onMounted, computed, ref } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import { watch } from 'vue'
import Swal from 'sweetalert2'
export default {
  name: 'HomePage',
  components: { VueCal },
  setup() {
    const home = useHomeStore()
    const user = useAuthStore()

    // قيم Pagination
    const currentPage = ref(1)
    const perPage = ref(5)
    const totalPages = computed(() => home.pagination?.last_page || 1)

    const selectedStatus = ref('')
    const selectedDate = ref('')
    const scheduled = computed(() => home.stats?.scheduled || 0)
    const published = computed(() => home.stats?.published || 0)
    const draft = computed(() => home.stats?.draft || 0)
    const fetchPosts = async () => {
      try {
        const payload = { 
        }
        if (perPage.value) payload.per_page = perPage.value
        if (currentPage.value) payload.page = currentPage.value
        if (selectedStatus.value) payload.status = selectedStatus.value
        if (selectedDate.value) payload.date = selectedDate.value

        await home.loadPosts(payload) 
          

      } catch (error) {
        console.error('Failed to load posts:', error)
      }
    }

    onMounted(async () => {
      await fetchPosts()
      try {
        await user.fetchUser()
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    })

    watch([selectedStatus, selectedDate], () => {
      currentPage.value = 1
      fetchPosts()
    })

  const goToPage = async (page) => {
if (page < 1 || page > totalPages.value) return
  currentPage.value = page

  const payload = {}
  if (perPage.value) payload.per_page = perPage.value
  if (currentPage.value) payload.page = currentPage.value
  if (selectedStatus.value) payload.status = selectedStatus.value
  if (selectedDate.value) payload.date = selectedDate.value

  await home.loadPosts(payload)
}

   const filteredPosts = computed(() => {
  if (!Array.isArray(home.posts)) return []
  
  return home.posts.filter(post => {
    const matchStatus = selectedStatus.value ? post.status === selectedStatus.value : true
    const matchDate = selectedDate.value
      ? new Date(post.scheduled_time).toISOString().slice(0, 10) === selectedDate.value
      : true
    return matchStatus && matchDate
  })
})
    const loadFilteredPosts = async () => {
      try {
       const payload = {}

    if (selectedStatus.value) {
      payload.status = selectedStatus.value
    }
if (perPage.value) payload.per_page = perPage.value
    if (selectedDate.value) {
      payload.date = selectedDate.value
    }
        await home.loadPosts(payload)
      } catch (err) {
        console.error('Error loading filtered posts:', err)
      }
    }

    const calendarEvents = computed(() => {
      if (!home.posts) return []
      return home.posts.filter(post => post.status === 'scheduled').map(post => {
        const start = new Date(post.scheduled_time)
        const end = new Date(start.getTime() + 60 * 60 * 1000)
        return {
          start,
          end,
          title: post.title,
          color: '#27ae60'
        }
      })
    })
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

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
  

    return {
      home,
      user,
      selectedStatus,
      selectedDate,
      calendarEvents,
      loadFilteredPosts,
      scheduled,
      published,
      draft,
      formatDate,
      deletePost,
      filteredPosts,
      VueCal,
      currentPage,
      perPage,
      totalPages,
      goToPage,
  
       
    }
  }
}

</script>

<style scoped>
.dashboard {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 15px #eee;
  text-align: center;
}

.quick-actions {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  font-weight: bold;
  transition: 0.3s ease;
}

.btn.create {
  background-color: #3498db;
}
.btn.settings {
  background-color: #2ecc71;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
}

.card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  width: 30%;
  box-shadow: 0 0 10px #ccc;
}
.filters {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.filters select,
.filters input[type="date"] {
  padding: 0.5rem 1rem;
  border: 2px solid #3498db;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  min-width: 160px;
}

.filters select:focus,
.filters input[type="date"]:focus {
  border-color: #2980b9;
  box-shadow: 0 0 6px #2980b9;
}

.filters select {
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1rem;
}
.post-list {
  margin-top: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  text-align: left;
}

.post-list h2 {
  margin-bottom: 1rem;
  font-weight: 700;
  color: #34495e;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.3rem;
}

.post-card {
  background: #fafafa;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.2rem;
  border-radius: 10px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

.post-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.post-content {
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.8rem;
  line-height: 1.5;
  white-space: pre-wrap; /* يحافظ على السطور الجديدة */
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  color: white;
  text-transform: capitalize;
  font-weight: 600;
  font-size: 0.9rem;
  user-select: none;
}

.badge.draft {
  background-color: #7f8c8d;
}

.badge.scheduled {
  background-color: #e67e22;
}

.badge.published {
  background-color: #27ae60;
}

.post-date {
  color: #999;
  font-size: 0.85rem;
  font-style: italic;
}

.btn-delete {
  align-self: flex-end;
  padding: 0.4rem 0.9rem;
  background-color: #e74c3c;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease;
}


.btn-delete:hover {
  background-color: #c0392b;
}
.no-posts-msg {
  color: #888;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 1.5rem;
  font-style: italic;
}
.calendar-view {
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
.vc-event {
  line-height: 1.5 !important; /* يزود ارتفاع السطر */
  padding: 6px 8px !important; /* يدي مساحة داخل العنصر */
  font-size: 14px !important;  /* لو عايز تزود وضوح الخط */
  height: auto !important;     /* يخلي العنصر ياخد ارتفاع طبيعي حسب المحتوى */
  display: flex;
  align-items: center;         /* يحسن محاذاة النص عموديًا */
}
.custom-event {
  padding: 8px;
  line-height: 1.6;
  font-size: 14px;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  height: 100%;
}
.post-image img {
  max-width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 1rem;
}
</style>
