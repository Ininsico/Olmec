import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { sceneAPI } from '../services/sceneAPI';

const AUTOSAVE_DELAY = 2000; // 2 seconds after last change

export const useScenePersistence = (sceneManagerRef: React.RefObject<any>) => {
    const sceneObjects = useAppStore((state) => state.sceneObjects);
    const viewMode = useAppStore((state) => state.viewMode);
    const currentSceneId = useAppStore((state) => state.currentSceneId);
    const setSaving = useAppStore((state) => state.setSaving);
    const setSceneId = useAppStore((state) => state.setSceneId);

    const saveTimeoutRef = useRef<number | null>(null);
    const lastSaveRef = useRef<string>('');

    const saveScene = useCallback(async () => {
        if (!sceneManagerRef.current) return;

        const camera = sceneManagerRef.current.camera;
        const cameraPosition = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        };

        const sceneData = {
            sceneId: currentSceneId || undefined,
            sceneObjects,
            cameraPosition,
            viewMode
        };

        // Check if data actually changed
        const dataString = JSON.stringify(sceneData);
        if (dataString === lastSaveRef.current) {
            return; // No changes, skip save
        }

        setSaving(true);
        const result = await sceneAPI.saveScene(sceneData);
        setSaving(false);

        if (result.success && result.sceneId) {
            setSceneId(result.sceneId);
            lastSaveRef.current = dataString;
            console.log('✅ Scene auto-saved:', result.sceneId);
        } else {
            console.error('❌ Failed to save scene:', result.message);
        }
    }, [sceneObjects, viewMode, currentSceneId, sceneManagerRef, setSaving, setSceneId]);

    // Debounced auto-save
    useEffect(() => {
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save
        saveTimeoutRef.current = setTimeout(() => {
            saveScene();
        }, AUTOSAVE_DELAY);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [sceneObjects, viewMode, saveScene]);

    return { saveScene };
};
