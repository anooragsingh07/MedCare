import axios from 'axios'

export const http = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
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
