import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
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
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post('/login', { email, password });
        return response.data;
    },

    register: async (name: string, email: string, password: string) => {
        const response = await api.post('/register', { name, email, password });
        return response.data;
    },

    googleAuth: () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    },

    githubAuth: () => {
        window.location.href = `${API_BASE_URL}/auth/github`;
    },
};

// User API
export const userAPI = {
    getMe: async () => {
        const response = await api.get('/me');
        return response.data;
    },

    getCurrentUserProfile: async () => {
        const response = await api.get('/current-user-profile');
        return response.data;
    },

    checkProfile: async () => {
        const response = await api.get('/check-profile');
        return response.data;
    },

    completeProfile: async (data: {
        username: string;
        bio?: string;
        location?: string;
        website?: string;
    }) => {
        const response = await api.post('/complete-profile', data);
        return response.data;
    },

    uploadPhoto: async (file: File) => {
        const formData = new FormData();
        formData.append('photo', file);
        const response = await api.post('/upload-photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getUserProfile: async (username: string) => {
        const response = await api.get(`/users/${username}`);
        return response.data;
    },
};

// Model API
export const modelAPI = {
    uploadModel: async (data: {
        title: string;
        description?: string;
        thumbnail: File;
        sceneFile: File;
    }) => {
        const formData = new FormData();
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('thumbnail', data.thumbnail);
        formData.append('sceneFile', data.sceneFile);

        const response = await api.post('/models', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getUserModels: async (username: string) => {
        const response = await api.get(`/users/${username}/models`);
        return response.data;
    },
};

// Email API
export const emailAPI = {
    sendEmail: async (data: {
        firstName: string;
        lastName: string;
        email: string;
        subject: string;
        message: string;
    }) => {
        const response = await api.post('/send-email', data);
        return response.data;
    },
};

export default api;
