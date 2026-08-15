import { http } from '../lib/http.js'

export const billsApi = {
  async list() {
    const { data } = await http.get('/bills')
    return data
  },

  async create(body) {
    const { data } = await http.post('/bills', body)
    return data
  },

  async get(id) {
    const { data } = await http.get(`/bills/${id}`)
    return data
  },
}