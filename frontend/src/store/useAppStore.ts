import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
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
    activeTab: 'create' | 'edit' | 'sculpt' | 'shading' | 'anim' | 'physics' | 'scene' | 'world' | 'render' | 'game' | 'properties';

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

    // Scene persistence
    currentSceneId: string | null;
    isSaving: boolean;

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
    setActiveTab: (tab: 'create' | 'edit' | 'sculpt' | 'shading' | 'anim' | 'physics' | 'scene' | 'world' | 'render' | 'game' | 'properties') => void;

    updateStats: (stats: Partial<{ triangles: number; vertices: number; fps: number }>) => void;

    // Scene persistence actions
    setSceneId: (id: string | null) => void;
    setSaving: (saving: boolean) => void;
}

export const useAppStore = create<AppState>()(
    devtools(
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

            currentSceneId: null,
            isSaving: false,

            // Actions - Optimized to only update necessary parts
            addObject: (object) => set((state) => {
                const newId = object.id || state.lastObjectId + 1;
                const newObject = { ...object, id: newId };
                return {
                    sceneObjects: [...state.sceneObjects, newObject],
                    lastObjectId: Math.max(state.lastObjectId, newId),
                    selectedObjectIds: [newId] // Auto-select new object
                };
            }, false, 'addObject'),

            removeObject: (id) => set((state) => ({
                sceneObjects: state.sceneObjects.filter(obj => obj.id !== id),
                selectedObjectIds: state.selectedObjectIds.filter(selectedId => selectedId !== id)
            }), false, 'removeObject'),

            updateObject: (id, updates) => set((state) => ({
                sceneObjects: state.sceneObjects.map(obj =>
                    obj.id === id ? { ...obj, ...updates } : obj
                )
            }), false, 'updateObject'),

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
                // Prevent unnecessary updates if already selected
                if (state.selectedObjectIds.length === 1 && state.selectedObjectIds[0] === id) {
                    return state;
                }
                return { selectedObjectIds: [id] };
            }, false, 'selectObject'),

            clearSelection: () => set({ selectedObjectIds: [] }, false, 'clearSelection'),

            setTool: (tool) => set({ activeTool: tool }, false, 'setTool'),
            setViewMode: (viewMode) => set({ viewMode }, false, 'setViewMode'),
            setTransformMode: (transformMode) => set({ transformMode }, false, 'setTransformMode'),
            setTransformSpace: (transformSpace) => set({ transformSpace }, false, 'setTransformSpace'),

            toggleLeftPanel: () => set((state) => ({ isLeftPanelCollapsed: !state.isLeftPanelCollapsed }), false, 'toggleLeftPanel'),
            toggleRightPanel: () => set((state) => ({ isRightPanelCollapsed: !state.isRightPanelCollapsed }), false, 'toggleRightPanel'),
            toggleTimeline: () => set((state) => ({ isTimelineVisible: !state.isTimelineVisible }), false, 'toggleTimeline'),
            setActiveTab: (activeTab) => set({ activeTab }, false, 'setActiveTab'),

            updateStats: (newStats) => set((state) => ({
                stats: { ...state.stats, ...newStats }
            }), false, 'updateStats'),

            setSceneId: (id) => set({ currentSceneId: id }, false, 'setSceneId'),
            setSaving: (saving) => set({ isSaving: saving }, false, 'setSaving')
        })),
        { name: 'AppStore' }
    )
);

// Optimized selectors to prevent unnecessary re-renders
export const useSceneObjects = () => useAppStore((state) => state.sceneObjects);
export const useSelectedObjectIds = () => useAppStore((state) => state.selectedObjectIds);
export const useActiveTool = () => useAppStore((state) => state.activeTool);
export const useViewMode = () => useAppStore((state) => state.viewMode);
export const useStats = () => useAppStore((state) => state.stats);
export const useActiveTab = () => useAppStore((state) => state.activeTab);
export const useIsLeftPanelCollapsed = () => useAppStore((state) => state.isLeftPanelCollapsed);
