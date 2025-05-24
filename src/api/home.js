import api from './axios'

export function getPosts(payload) {
  return api.get('/posts', { params: payload }).then((response) => {
    return response.data
  })
  
}
export function createPost(postData) {
  return api.post('/posts', postData).then((response) => response.data)
}

export function deletePost(postId) {
  return api.delete(`/posts/${postId}`).then((response) => response.data)
}


