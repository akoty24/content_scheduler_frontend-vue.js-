<template>
    <div class="auth-container">
      <h2>Register</h2>
      <form @submit.prevent="submitRegister">
        <label>
          Name:
          <input v-model="form.name" type="text" required />
        </label>
  
        <label>
          Email:
          <input v-model="form.email" type="email" required />
        </label>
  
        <label>
          Password:
          <input v-model="form.password" type="password" required />
        </label>
  
        <label>
          Confirm Password:
          <input v-model="form.password_confirmation" type="password" required />
        </label>
  
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <router-link to="/login">Login here</router-link></p>
    </div>
  </template>
<script>
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'

export default {
  name: 'RegisterPage',
  setup() {
    const auth = useAuthStore()
    const form = reactive({
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    })

    async function submitRegister() {
        try {
            await auth.register(form)
            Swal.fire({
            icon: 'success',
            title: 'Registered successfully!',
            text: 'Please login to continue.',
            confirmButtonText: 'OK'
            })
          
        } catch (err) {
            Swal.fire({
            icon: 'error',
            title: 'Registration failed',
            text: err.message,
            confirmButtonText: 'OK'
            })
        }
}


    return { form, submitRegister }
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