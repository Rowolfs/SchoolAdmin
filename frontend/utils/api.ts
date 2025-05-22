import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // это твой backend
  timeout: 5000
})

export default api
