import { http } from '../lib/http.js'

export const patientsApi = {
  /**
   * @param {string} [search] - optional case-insensitive name filter (server-side)
   */
  async list(search = '') {
    const params = {}
    if (search) params.search = search
    const { data } = await http.get('/patients', { params })
    return data
  },

  async create(body) {
    const { data } = await http.post('/patients', body)
    return data
  },

  async update(id, body) {
    const { data } = await http.patch(`/patients/${id}`, body)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/patients/${id}`)
    return data
  },
}
