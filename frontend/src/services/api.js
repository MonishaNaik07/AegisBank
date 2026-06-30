import axios from 'axios';
import { store } from '../redux/store.js';
import { logout } from '../redux/slices/authSlice.js';
import { clearAccountState } from '../redux/slices/accountSlice.js';
import { clearNotificationState } from '../redux/slices/notificationSlice.js';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if it exists in state
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 / expired token errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Automatic logout if unauthorized
      console.warn('Unauthorized request. Logging out user...');
      store.dispatch(logout());
      store.dispatch(clearAccountState());
      store.dispatch(clearNotificationState());
    }
    return Promise.reject(error);
  }
);

export default api;
