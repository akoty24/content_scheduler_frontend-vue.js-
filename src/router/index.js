import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/Home.vue'
import LoginPage from '../views/auth/Login.vue'
import RegisterPage from '../views/auth/Register.vue'
import { useAuthStore } from '@/stores/authStore'
import CreatePost from '../views/posts/CreatePost.vue'
import PlatformSettings from '../views/platforms/PlatformSettings.vue'
import PostsView from '../views/platforms/PostsView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage  },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  {
  path: '/',
  name: 'Home',
  component: () => import('@/views/Home.vue') 
},
 { path: '/posts/create', name: 'CreatePost', component: CreatePost, meta: { requiresAuth: true } },
{ path: '/platform/:platformId/posts', name: 'platformPosts', component: PostsView, meta: { requiresAuth: true } },

   { path: '/settings', name: 'Settings', component: PlatformSettings, meta: { requiresAuth: true } },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
  })
  
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore()
  
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      next({ name: 'Login' })
    } else if ((to.name === 'Login' || to.name === 'Register') && auth.isLoggedIn) {
      next({ name: 'Home' })
    } else {
      next()
    }
  })
  
  export default router