import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

const app = createApp(App)

app.use(createPinia())   // لو بتستخدم Pinia
app.use(router)
const authStore = useAuthStore()
authStore.initialize()
app.mount('#app')