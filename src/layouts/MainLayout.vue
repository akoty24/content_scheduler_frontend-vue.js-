<template>
    <div>
      <!-- Header -->
      <header>
        <h1>Content Scheduler</h1>
        <button @click="logout">Logout</button>
      </header>
  
      <!-- Main Content -->
      <main>
        <slot />
      </main>
  
      <!-- Footer -->
      <footer>
        &copy; 2025 Content Scheduler. All rights reserved.
      </footer>
    </div>
  </template>
  
  <script setup>
  import { useAuthStore } from '@/stores/authStore'
  
  const auth = useAuthStore()
  const logout = () => auth.logout()
  </script>