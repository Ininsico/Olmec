import axios from 'axios';

// Use relative URLs — in dev the Vite proxy forwards /api to :5000,
// in prod the Nginx proxy does the same.
const BASE = import.meta.env.VITE_API_URL || '';
const API_PREFIX = BASE.endsWith('/api') ? '' : '/api';

const api = axios.create({
    baseURL: BASE || '',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

function p(path: string) {
    return `${API_PREFIX}${path}`;
}

// Auth API
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post(p('/login'), { email, password });
        return response.data;
    },
    register: async (name: string, email: string, password: string) => {
        const response = await api.post(p('/register'), { name, email, password });
        return response.data;
    },
    googleAuth: () => { window.location.href = p('/auth/google'); },
    githubAuth: () => { window.location.href = p('/auth/github'); },
};

// User API
export const userAPI = {
    getMe: async () => {
        const response = await api.get(p('/me'));
        return response.data;
    },
    getCurrentUserProfile: async () => {
        const response = await api.get(p('/current-user-profile'));
        return response.data;
    },
    checkProfile: async () => {
        const response = await api.get(p('/check-profile'));
        return response.data;
    },
    completeProfile: async (data: any) => {
        const response = await api.post(p('/complete-profile'), data);
        return response.data;
    },
    uploadPhoto: async (file: File) => {
        const formData = new FormData();
        formData.append('photo', file);
        const response = await api.post(p('/upload-photo'), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    getUserProfile: async (username: string) => {
        const response = await api.get(p(`/users/${username}`));
        return response.data;
    },
};

// Model API
export const modelAPI = {
    uploadModel: async (data: any) => {
        const formData = new FormData();
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('thumbnail', data.thumbnail);
        formData.append('sceneFile', data.sceneFile);
        const response = await api.post(p('/models'), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    getUserModels: async (username: string) => {
        const response = await api.get(p(`/users/${username}/models`));
        return response.data;
    },
};

// Email API
export const emailAPI = {
    sendEmail: async (data: any) => {
        const response = await api.post(p('/send-email'), data);
        return response.data;
    },
};

export default api;
