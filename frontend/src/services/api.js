import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api' });

export async function diagnoseImage(file) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post('/predict', form);
  return data;
}

export async function getHistory(page = 1, diagnosis = null) {
  const params = new URLSearchParams({ page, limit: 10 });
  if (diagnosis) params.append('diagnosis', diagnosis);
  const { data } = await api.get(`/history?${params.toString()}`);
  return data;
}
