<template>
  <div id="app">
    <nav class="navbar">
      <div class="container">
        <router-link to="/" class="logo">Content Scheduler</router-link>
        <ul class="nav-links">
          <template v-if="!isAuthenticated">
            <li><router-link to="/login">Login</router-link></li>
            <li><router-link to="/register">Register</router-link></li>
          </template>
          <template v-else>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/settings">Platforms</router-link> </li>
            <li><a href="#" @click.prevent="logout">Logout</a></li>
          </template>
        </ul>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false,
    }
  },
  created() {
    this.isAuthenticated = !!localStorage.getItem('token')
  },
  methods: {
logout() {
  localStorage.removeItem('token')
  this.isAuthenticated = false
  window.location.href = '/login' // Full page reload
}
  },
  watch: {
    '$route'() {
      this.isAuthenticated = !!localStorage.getItem('token')
    }
  }
}
</script>

<style scoped>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
}

.navbar {
  background-color: #2c3e50;
  padding: 1rem 0;
  color: #fff;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  margin: auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1rem;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  font-weight: bold;
}

.nav-links a.router-link-active {
  text-decoration: underline;
}

.main-content {
  padding: 2rem;
}
</style>
