import { http } from '../lib/http.js'

export const medicinesApi = {
  async list(search = '') {
    const params = {}
    if (search) params.search = search
    const { data } = await http.get('/medicines', { params })
    return data
  },

  async create(body) {
    const { data } = await http.post('/medicines', body)
    return data
  },

  async update(id, body) {
    const { data } = await http.patch(`/medicines/${id}`, body)
    return data
  },

  async adjustStock(id, delta) {
    const { data } = await http.post(`/medicines/${id}/stock`, { delta })
    return data
  },

  async deactivate(id) {
    const { data } = await http.delete(`/medicines/${id}`)
    return data
  },
}