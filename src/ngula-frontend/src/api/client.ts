import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ngula_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ngula_token');
      localStorage.removeItem('ngula_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

// Dashboard API
export const dashboardApi = {
  getExecutiveSummary: () => apiClient.get('/dashboard/executive'),
  getProductionKpis: (sectionId?: number) =>
    apiClient.get('/dashboard/production', { params: { sectionId } }),
  getEngineeringKpis: () => apiClient.get('/dashboard/engineering'),
  getSheqKpis: () => apiClient.get('/dashboard/sheq'),
};

// Shift Reports API
export const shiftReportApi = {
  getAll: (params?: { sectionId?: number; date?: string }) =>
    apiClient.get('/shiftreports', { params }),
  getById: (id: number) => apiClient.get(`/shiftreports/${id}`),
  create: (data: unknown) => apiClient.post('/shiftreports', data),
};

// Actions API
export const actionsApi = {
  getAll: (params?: { status?: string; priority?: string; assignedTo?: string }) =>
    apiClient.get('/actions', { params }),
  getById: (id: number) => apiClient.get(`/actions/${id}`),
  create: (data: unknown) => apiClient.post('/actions', data),
  update: (id: number, data: unknown) => apiClient.patch(`/actions/${id}`, data),
  addComment: (id: number, comment: string) =>
    apiClient.post(`/actions/${id}/comments`, { comment }),
  getDashboard: () => apiClient.get('/actions/dashboard'),
};

// Handover API
export const handoverApi = {
  getCurrent: (sectionId: number) => apiClient.get(`/handover/current/${sectionId}`),
  getHistory: (sectionId: number) => apiClient.get(`/handover/history/${sectionId}`),
};

// Equipment API
export const equipmentApi = {
  getAll: () => apiClient.get('/equipment'),
  getById: (id: number) => apiClient.get(`/equipment/${id}`),
  getHealthScores: () => apiClient.get('/equipment/health'),
};

// Maintenance API
export const maintenanceApi = {
  getKpis: () => apiClient.get('/maintenance/kpis'),
};

// Alerts API
export const alertsApi = {
  getAll: () => apiClient.get('/alerts'),
  markRead: (id: number) => apiClient.patch(`/alerts/${id}/mark-read`),
};

// Production Targets API
export const targetsApi = {
  getAll: (params?: { sectionId?: number; year?: number }) =>
    apiClient.get('/productiontargets', { params }),
  create: (data: unknown) => apiClient.post('/productiontargets', data),
  update: (id: number, data: unknown) => apiClient.put(`/productiontargets/${id}`, data),
};