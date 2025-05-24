import api from './axios'

export function getPlatforms(payload) {
  return api.get('/platforms', { params: payload }).then((response) => {
    return response.data
  })
  
}
export function getUserPlatforms(payload) {
  return api.get('/platforms/user', { params: payload }).then((response) => {
    return response.data
  })
  
}
export function getPlatform({ id }) {
  return api.get(`/platforms/${id}`).then((response) => {
    return response.data
  })
  
}
export function createPlatform(platformData) {
  return api.post('/platforms', platformData).then((response) => {
    return response.data
  })
}

export function toggleUserPlatform(payload) {
  return api.post('/platforms/toggle', payload).then(response => {
    return response.data;
  });
}
//const response = await getPlatformPosts(platformId, payload)
export function getPlatformPosts(platformId, payload) {
  return api.get(`/platforms/${platformId}/posts`, { params: payload }).then((response) => {
    return response.data
  })
}