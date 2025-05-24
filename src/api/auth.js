
import api from './axios'


// Login
export function loginUser(data) {
  return api.post('/login', data)
}

// Register



export function registerUser(data) {
    console.log('Using baseURL:', api.defaults.baseURL)
    return api.post('/register', data)
  }

// Get User
export function getUser() {
  return api.get('/user')
}
