import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { SceneObject, ViewMode, Tool, CameraMode, TransformMode } from '../types/builder.types';

// Define the store state and actions
interface AppState {
    // Scene Data
    sceneObjects: SceneObject[];
    selectedObjectIds: number[];
    lastObjectId: number;

    // UI Layout State
    isLeftPanelCollapsed: boolean;
    isRightPanelCollapsed: boolean;
    isTimelineVisible: boolean;
    activeTab: 'create' | 'sculpt' | 'scene' | 'properties';

    // Editor State
    activeTool: Tool;
    viewMode: ViewMode;
    cameraMode: CameraMode;
    transformMode: TransformMode;
    transformSpace: 'world' | 'local';

    // Performance / Stats (debounced or strictly controlled)
    stats: {
        triangles: number;
        vertices: number;
        fps: number;
    };

    // Actions
    addObject: (object: SceneObject) => void;
    removeObject: (id: number) => void;
    updateObject: (id: number, updates: Partial<SceneObject>) => void;
    selectObject: (id: number | null, multi?: boolean) => void;
    clearSelection: () => void;

    setTool: (tool: Tool) => void;
    setViewMode: (mode: ViewMode) => void;
    setTransformMode: (mode: TransformMode) => void;
    setTransformSpace: (space: 'world' | 'local') => void;

    toggleLeftPanel: () => void;
    toggleRightPanel: () => void;
    toggleTimeline: () => void;
    setActiveTab: (tab: 'create' | 'sculpt' | 'scene' | 'properties') => void;

    updateStats: (stats: Partial<{ triangles: number; vertices: number; fps: number }>) => void;
}

export const useAppStore = create<AppState>()(
    subscribeWithSelector((set) => ({
        // Initial State
        sceneObjects: [],
        selectedObjectIds: [],
        lastObjectId: 0,

        isLeftPanelCollapsed: false,
        isRightPanelCollapsed: false,
        isTimelineVisible: false,
        activeTab: 'create',

        activeTool: 'select',
        viewMode: 'solid',
        cameraMode: 'perspective',
        transformMode: 'translate',
        transformSpace: 'world',

        stats: {
            triangles: 0,
            vertices: 0,
            fps: 60
        },

        // Actions
        addObject: (object) => set((state) => {
            const newId = object.id || state.lastObjectId + 1;
            const newObject = { ...object, id: newId };
            return {
                sceneObjects: [...state.sceneObjects, newObject],
                lastObjectId: Math.max(state.lastObjectId, newId)
            };
        }),

        removeObject: (id) => set((state) => ({
            sceneObjects: state.sceneObjects.filter(obj => obj.id !== id),
            selectedObjectIds: state.selectedObjectIds.filter(selectedId => selectedId !== id)
        })),

        updateObject: (id, updates) => set((state) => ({
            sceneObjects: state.sceneObjects.map(obj =>
                obj.id === id ? { ...obj, ...updates } : obj
            )
        })),

        selectObject: (id, multi = false) => set((state) => {
            if (id === null) return { selectedObjectIds: [] };
            if (multi) {
                const isSelected = state.selectedObjectIds.includes(id);
                return {
                    selectedObjectIds: isSelected
                        ? state.selectedObjectIds.filter(sid => sid !== id)
                        : [...state.selectedObjectIds, id]
                };
            }
            return { selectedObjectIds: [id] };
        }),

        clearSelection: () => set({ selectedObjectIds: [] }),

        setTool: (tool) => set({ activeTool: tool }),
        setViewMode: (viewMode) => set({ viewMode }),
        setTransformMode: (transformMode) => set({ transformMode }),
        setTransformSpace: (transformSpace) => set({ transformSpace }),

        toggleLeftPanel: () => set((state) => ({ isLeftPanelCollapsed: !state.isLeftPanelCollapsed })),
        toggleRightPanel: () => set((state) => ({ isRightPanelCollapsed: !state.isRightPanelCollapsed })),
        toggleTimeline: () => set((state) => ({ isTimelineVisible: !state.isTimelineVisible })),
        setActiveTab: (activeTab) => set({ activeTab }),

        updateStats: (newStats) => set((state) => ({
            stats: { ...state.stats, ...newStats }
        }))
    }))
);
