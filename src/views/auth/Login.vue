<template>
    <div class="auth-container">
      <h2>Login</h2>
      <form @submit.prevent="submitLogin">
        <label>
          Email:
          <input v-model="form.email" type="email" required />
        </label>
  
        <label>
          Password:
          <input v-model="form.password" type="password" required />
        </label>
  
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <router-link to="/register">Register here</router-link></p>
    </div>
  </template>
  
  <script>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'
export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const auth = useAuthStore()
    const form = reactive({
      email: '',
      password: ''
    })

    async function submitLogin() {
  try {
    await auth.login(form)
    await Swal.fire({
      icon: 'success',
      title: 'Login successful!',
      showConfirmButton: false,
      timer: 1500
    })
    router.push('/')
  } catch (err) {
    await Swal.fire({
      icon: 'error',
      title: 'Login failed',
      text: err.message,
    })
  }
}

    return { form, submitLogin }
  }
}
</script>
  
  <style scoped>
  .auth-container {
    max-width: 400px;
    margin: 4rem auto;
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px #ccc;
  }
  
  label {
    display: block;
    margin-bottom: 1rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.3rem;
    box-sizing: border-box;
  }
  
  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.7rem 1.5rem;
    cursor: pointer;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  