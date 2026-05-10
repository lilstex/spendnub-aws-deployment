import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://spendnub-api.onrender.com/api/v1",
});

// Automatically add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const investmentApi = {
  create: (data: import('../types').CreateInvestmentPayload) =>
    api.post('/investments', data),
  getAll: () => api.get<import('../types').Investment[]>('/investments'),
  getSummary: () =>
    api.get<import('../types').InvestmentPortfolioSummary>('/investments/summary'),
  remove: (id: string) => api.delete(`/investments/${id}`),
};

export const reportsApi = {
  monthly: (year: number, month: number) =>
    api.get<import('../types').MonthlyReport>(`/reports/monthly?year=${year}&month=${month}`),
};

export const insightsApi = {
  enhanced: () =>
    api.get<import('../types').EnhancedForecast>('/insights/enhanced-forecasting'),
};

export default api;
