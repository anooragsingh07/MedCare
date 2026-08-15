import { http } from '../lib/http.js'

export const studentsApi = {
  async list(search = '') {
    const params = {}
    if (search) params.search = search
    const { data } = await http.get('/students', { params })
    return data
  },

  async create(body) {
    const { data } = await http.post('/students', body)
    return data
  },

  async update(id, body) {
    const { data } = await http.patch(`/students/${id}`, body)
    return data
  },

  async deactivate(id) {
    const { data } = await http.delete(`/students/${id}`)
    return data
  },

  async importStudents(students) {
    const { data } = await http.post('/students/import', { students })
    return data
  },

  async lookupByUid(uid) {
    const { data } = await http.get('/students/lookup', { params: { uid } })
    return data
  },
}