import { defineStore } from 'pinia'
import { getPosts } from '@/api/home'
import { createPost } from '@/api/home'
import { deletePost } from '@/api/home'


export const useHomeStore = defineStore('home', {
  state: () => ({
    posts: [],
    stats: {
      scheduled: 0,
      published: 0,
      draft: 0
    },

  }),

  actions: {

    async loadPosts(payload) {
      try {
        const response = await getPosts(payload)
        this.posts = response.data.posts
        this.stats = response.data.stats
        this.pagination = response.data.pagination

      } catch (error) {
        console.error('Error loading home data:', error)
        throw error
      }
    },
async createPost(formData) {
    try {
      const data = await createPost(formData)
      return data // this includes status, message, and created post info
    } catch (error) {
      // Optional: handle error here or just rethrow
      throw error.response?.data?.message
        ? new Error(error.response.data.message)
        : new Error('Failed to create post')
    }
  },
  

  async deletePost(postId) {
    try {
      const response = await deletePost(postId)
      return response.data
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  
  }
  }
})
