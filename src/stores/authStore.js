// stores/authStore.js
import { defineStore } from 'pinia'
import router from '../router'
import { loginUser, registerUser, getUser } from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
     async initialize() {
      if (this.token) {
        this.setTokenHeader()
        await this.fetchUser()
      }
    },
    async register(userData) {
      const response = await registerUser(userData)
      this.token = response.data.data.token
      localStorage.setItem('token', this.token)

      this.setTokenHeader()
      await this.fetchUser()
      router.push('/')
    },

    async login(credentials) {
      const response = await loginUser(credentials)
      this.token = response.data.data.token
      localStorage.setItem('token', this.token)
      
      // Set token header
      this.setTokenHeader()
      await this.fetchUser()
      router.push('/')
    },

    async fetchUser() {
      if (!this.token) return
      try {
        const response = await getUser()
        this.user =  response.data.data.user
      } catch (error) {
        this.logout()
      }
    },

    setTokenHeader() {
      if (this.token) {
        const api = require('../api/axios').default
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      const api = require('../api/axios').default
      delete api.defaults.headers.common['Authorization']
      router.push('/login')
    },
  },
})
