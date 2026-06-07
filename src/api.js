import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5000/api'
});

// Har request mein token automatically add karo
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth APIs
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Interview APIs
export const generateQuestions = (data) => API.post('/interview/generate-questions', data);
export const evaluateAnswer = (data) => API.post('/interview/evaluate', data);
export const saveInterview = (data) => API.post('/interview/save', data);
export const getHistory = () => API.get('/interview/history');

// Resume APIs
export const extractResume = (formData) => API.post('/resume/extract', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const generateQuestionFromTopic = (data) => API.post('/resume/generate-questions', data);