import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface SceneData {
    sceneId?: string;
    sceneObjects: any[];
    cameraPosition: { x: number; y: number; z: number };
    viewMode: string;
}

export interface SceneListItem {
    _id: string;
    name: string;
    lastModified: string;
}

class SceneAPI {
    // Save scene to backend
    async saveScene(data: SceneData): Promise<{ success: boolean; sceneId?: string; message?: string }> {
        try {
            const response = await api.post('/scene/save', data);
            return response.data;
        } catch (error: any) {
            console.error('Failed to save scene:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to save scene' };
        }
    }

    // Load scene from backend
    async loadScene(sceneId: string): Promise<{ success: boolean; scene?: any; message?: string }> {
        try {
            const response = await api.get(`/scene/load/${sceneId}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to load scene:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to load scene' };
        }
    }

    // Get list of all scenes
    async listScenes(): Promise<{ success: boolean; scenes?: SceneListItem[]; message?: string }> {
        try {
            const response = await api.get('/scene/list');
            return response.data;
        } catch (error: any) {
            console.error('Failed to list scenes:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to list scenes' };
        }
    }

    // Delete scene
    async deleteScene(sceneId: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await api.delete(`/scene/delete/${sceneId}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to delete scene:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to delete scene' };
        }
    }
}

export const sceneAPI = new SceneAPI();
