import { defineStore } from 'pinia'
import { getUserPlatforms  } from '@/api/platform'
import { createPlatform } from '@/api/platform'
import { getPlatforms } from '@/api/platform'
import { toggleUserPlatform } from '@/api/platform'
import { getPlatformPosts } from '@/api/platform'
import { getPlatform } from '@/api/platform'

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    platforms: [],
    userPlatforms: [], 
    platformPosts: [],
    pagination: null,
    platform: null,
  }),
  actions: {
     async loadPlatforms(payload) {
      try {
        const response = await getPlatforms(payload)
        this.platforms = response.data.platforms
        console.log('Platforms:', this.platforms)
        this.pagination = response.data.pagination
      } catch (error) {
        console.error('Error loading platform data:', error)
        throw error
      }
    },
    async getPlatformById(id) {
      try {
        const response = await getPlatform({ id })
        this.platform = response.data.platform
        return this.platform
      } catch (error) {
        console.error('Error loading platform data:', error)
        throw error
      }
    },
   async loadUserPlatforms(payload) {
      try {
        const response = await getUserPlatforms(payload)
        this.userPlatforms  = response.data.platforms
        this.pagination = response.data.pagination
      } catch (error) {
        console.error('Error loading platform data:', error)
        throw error
      }
    },
     async createPlatform(form) {
      const token = localStorage.getItem('token');navigator
      const response =  await createPlatform(form, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });


      const data = await response.json();
      return data;
    },
    //await platformStore.loadPlatformPosts(platformId, payload)
    async loadPlatformPosts( platformId, payload) {
      try {
        const response = await getPlatformPosts(platformId, payload)
        this.platformPosts = response.data.posts
        this.pagination = response.data.pagination
        return this.platformPosts
      } catch (error) {
        console.error('Error loading platform posts:', error)
        throw error
      }
     
    },
    
     
    async toggleUserPlatform(payload) {
      try {
        const response = await toggleUserPlatform(payload);
        return response;  // response.data بالفعل مسترجعة من الدالة API
      } catch (error) {
        console.error('Error toggling user platform:', error);
        throw error;
      }
    }

    }
});