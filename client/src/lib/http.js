import axios from 'axios'

export const http = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medcare_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medcare_token')
      localStorage.removeItem('medcare_user')
      window.dispatchEvent(new CustomEvent('medcare:unauthorized'))
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new Error(
          'Request timed out. Start the API (cd server && npm run dev) and ensure it is on port 5000.',
        ),
      )
    }
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed'
    return Promise.reject(new Error(msg))
  },
)