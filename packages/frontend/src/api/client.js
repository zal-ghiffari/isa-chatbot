import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': token } : {}
}

// Auth
export function register(data) { return api.post('/auth/register', data) }
export function login(data) { return api.post('/auth/login', data) }
export function getMe(token) { return api.get('/auth/me', { headers: { 'Authorization': token } }) }
export function logout() { return api.post('/auth/logout', null, { headers: authHeader() }) }

// Sessions
export function createSession(data) { return api.post('/sessions/create', data, { headers: authHeader() }) }
export function getMySessions() { return api.get('/sessions/my', { headers: authHeader() }) }
export function getSessionInfo(token) { return api.get(`/sessions/info/${token}`) }
export function getSessionResults(token) { return api.get(`/sessions/${token}/results`, { headers: authHeader() }) }

// Survey
export function startSurvey(data) { return api.post('/survey/start', data) }
export function getCurrentQuestion(sessionId) { return api.get(`/survey/${sessionId}/current`) }
export function answerQuestion(sessionId, questionId, score) {
  const params = new URLSearchParams()
  params.append('question_id', questionId)
  params.append('score', score)
  return api.post(`/survey/${sessionId}/answer`, params)
}
export function getResult(sessionId) { return api.get(`/survey/${sessionId}/result`) }

// User
export function getUserSurveys() { return api.get('/user/surveys', { headers: authHeader() }) }

// Admin
export function getAdminStats() { return api.get('/admin/stats') }
export function getRespondentDetail(id) { return api.get(`/admin/respondent/${id}`) }
export function getAdminUsers() { return api.get('/admin/users', { headers: authHeader() }) }
export function getAdminSessions() { return api.get('/admin/sessions', { headers: authHeader() }) }

export default api
