// API Base Client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export const apiConfig = {
  baseUrl: API_BASE_URL,
  useMock: USE_MOCK,
};

export function getAuthHeaders() {
  const token = localStorage.getItem('codesight_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
