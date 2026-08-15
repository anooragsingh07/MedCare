import { http } from '../lib/http.js'

export const membersApi = {
  async list(search = '') {
    const params = {}
    if (search) params.search = search
    const { data } = await http.get('/members', { params })
    return data
  },

  async create(body) {
    const { data } = await http.post('/members', body)
    return data
  },

  async update(id, body) {
    const { data } = await http.patch(`/members/${id}`, body)
    return data
  },

  async deactivate(id) {
    const { data } = await http.delete(`/members/${id}`)
    return data
  },

  async importMembers(members) {
    const { data } = await http.post('/members/import', { members })
    return data
  },

  async lookupByUid(uid) {
    const { data } = await http.get('/members/lookup', { params: { uid } })
    return data
  },
}