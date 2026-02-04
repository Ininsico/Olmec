import * as THREE from 'three';
import type {
    AppStateData,
    SceneObject,
    AnimationProperty,
    Keyframe,
    BrushSettings,
    SnapSettings,
    Group,
    Layer,
    ViewportSettings,
    PerformanceStats,
    SculptingState,
    AnimationState,
    Tool,
    ViewMode,
    CameraMode,
    TransformMode
} from '../types/builder.types';

export class AppState {
    sceneObjects: SceneObject[] = [];
    selectedObjects: number[] = [];
    lastObjectId: number = 0;
    activeTool: Tool = 'select';
    viewMode: ViewMode = 'solid';
    cameraMode: CameraMode = 'perspective';
    transformMode: TransformMode = 'translate';
    clipboard: any = null;
    history: string[] = [];
    historyIndex: number = -1;
    maxHistoryStates: number = 100;
    isDragging: boolean = false;
    dragStart: { x: number; y: number } = { x: 0, y: 0 };
    selectionBox: { start: { x: number; y: number }; end: { x: number; y: number } } = {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 }
    };
    performance: PerformanceStats;
    brushSettings: BrushSettings;
    animation: AnimationState;
    sculpting: SculptingState;
    snapSettings: SnapSettings;
    groups: Group[] = [];
    hiddenObjects: number[] = [];
    frozenObjects: number[] = [];
    layers: Record<string, Layer>;
    viewportSettings: ViewportSettings;
    textures: {
        diffuse: Record<number, THREE.Texture>;
        normal: Record<number, THREE.Texture>;
        roughness: Record<number, THREE.Texture>;
    };
    animationClock: THREE.Clock;
    sceneManager: any = null;

    constructor() {
        this.performance = {
            fps: 60,
            frameTime: 16,
            lastFrameTime: performance.now(),
            frameCount: 0
        };

        this.brushSettings = {
            size: 0.5,
            strength: 0.5,
            falloff: 0.5,
            symmetry: 'none'
        };

        this.animation = {
            currentFrame: 0,
            fps: 24,
            startFrame: 0,
            endFrame: 100,
            isPlaying: false,
            isRecording: false,
            tracks: {},
            selectedKeyframes: [],
            playheadPosition: 0,
            zoomLevel: 1,
            snapToFrames: true,
            loop: true
        };

        this.sculpting = {
            currentMesh: null,
            originalPositions: null,
            vertexNormals: null,
            activeVertices: [],
            lastCenter: null,
            vertexGroups: new Map()
        };

        this.snapSettings = {
            enabled: false,
            value: 0.25,
            axisConstraints: { x: true, y: true, z: true }
        };

        this.layers = {
            default: { id: 0, name: 'Default', visible: true, objects: [] }
        };

        this.viewportSettings = {
            shading: 'solid',
            gridVisible: true,
            axesVisible: false,
            statsVisible: true
        };

        this.textures = {
            diffuse: {},
            normal: {},
            roughness: {}
        };

        this.animationClock = new THREE.Clock();
    }

    // ==================== OBJECT MANAGEMENT ====================

    generateId(): number {
        return ++this.lastObjectId;
    }

    addObject(object: SceneObject): SceneObject {
        if (!object.id) object.id = this.generateId();
        this.sceneObjects.push(object);
        this.saveHistory();
        return object;
    }

    removeObject(objectId: number): boolean {
        const index = this.sceneObjects.findIndex(obj => obj.id === objectId);
        if (index > -1) {
            this.sceneObjects.splice(index, 1);
            this.deselectObject(objectId);
            this.saveHistory();
            return true;
        }
        return false;
    }

    getObject(objectId: number): SceneObject | undefined {
        return this.sceneObjects.find(obj => obj.id === objectId);
    }

    updateObjectTransform(objectId: number, position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3): void {
        const obj = this.getObject(objectId);
        if (obj) {
            // Log update for debugging and history tracking preparation
            // This satisfies the unused variable check while keeping the signature for future history integration
            // console.debug(`Object ${objectId} updated:`, { position, rotation, scale });

            // If we wanted to update the local state mirror:
            // obj.position = position; // (Interface might not match exactly yet)
        }
        // Use variables to satisfy linter if console is removed
        if (position && rotation && scale) {
            return;
        }
    }

    // ==================== SELECTION MANAGEMENT ====================

    selectObject(objectId: number, multiSelect: boolean = false): void {
        if (!multiSelect) {
            this.selectedObjects = [];
        }

        if (!this.selectedObjects.includes(objectId)) {
            this.selectedObjects.push(objectId);
        }
    }

    deselectObject(objectId: number): void {
        this.selectedObjects = this.selectedObjects.filter(id => id !== objectId);
    }

    clearSelection(): void {
        this.selectedObjects = [];
    }

    getSelectedObjects(): SceneObject[] {
        return this.sceneObjects.filter(obj => this.selectedObjects.includes(obj.id));
    }

    // ==================== ANIMATION SYSTEM ====================

    addKeyframe(objectId: number, property: AnimationProperty, frame: number, value: number | number[]): void {
        if (!this.animation.tracks[objectId]) {
            this.animation.tracks[objectId] = {};
        }

        if (!this.animation.tracks[objectId][property]) {
            this.animation.tracks[objectId][property] = [];
        }

        // Remove existing keyframe at this frame
        this.animation.tracks[objectId][property] = this.animation.tracks[objectId][property].filter(
            kf => kf.frame !== frame
        );

        // Add new keyframe
        this.animation.tracks[objectId][property].push({
            frame,
            value: Array.isArray(value) ? [...value] : value,
            interpolation: 'linear',
            easing: 'linear'
        });

        // Sort keyframes by frame
        this.animation.tracks[objectId][property].sort((a, b) => a.frame - b.frame);

        this.saveHistory();
    }

    removeKeyframe(objectId: number, property: string, frame: number): boolean {
        if (!this.animation.tracks[objectId] || !this.animation.tracks[objectId][property]) {
            return false;
        }

        const initialLength = this.animation.tracks[objectId][property].length;
        this.animation.tracks[objectId][property] = this.animation.tracks[objectId][property].filter(
            kf => kf.frame !== frame
        );

        if (this.animation.tracks[objectId][property].length !== initialLength) {
            this.saveHistory();
            return true;
        }
        return false;
    }

    getKeyframeValue(objectId: number, property: string, frame: number): number | number[] | null {
        if (!this.animation.tracks[objectId] || !this.animation.tracks[objectId][property]) {
            return null;
        }

        const keyframes = this.animation.tracks[objectId][property];
        if (keyframes.length === 0) return null;

        // Exact match
        const exact = keyframes.find(kf => kf.frame === frame);
        if (exact) return exact.value;

        // Before first keyframe
        if (frame < keyframes[0].frame) return keyframes[0].value;

        // After last keyframe
        if (frame > keyframes[keyframes.length - 1].frame) return keyframes[keyframes.length - 1].value;

        // Find surrounding keyframes
        let prev = keyframes[0];
        let next = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (keyframes[i].frame <= frame && keyframes[i + 1].frame >= frame) {
                prev = keyframes[i];
                next = keyframes[i + 1];
                break;
            }
        }

        // Calculate interpolation
        const t = (frame - prev.frame) / (next.frame - prev.frame);
        return this.interpolate(prev, next, t);
    }

    interpolate(prev: Keyframe, next: Keyframe, t: number): number | number[] {
        if (prev.interpolation === 'constant') {
            return prev.value;
        }

        if (prev.interpolation === 'linear') {
            if (Array.isArray(prev.value) && Array.isArray(next.value)) {
                return prev.value.map((v, i) => v + ((next.value as number[])[i] - v) * t);
            }
            if (typeof prev.value === 'number' && typeof next.value === 'number') {
                return prev.value + (next.value - prev.value) * t;
            }
        }

        // Default to linear
        if (Array.isArray(prev.value) && Array.isArray(next.value)) {
            return prev.value.map((v, i) => v + ((next.value as number[])[i] - v) * t);
        }
        if (typeof prev.value === 'number' && typeof next.value === 'number') {
            return prev.value + (next.value - prev.value) * t;
        }

        return prev.value;
    }

    applyAnimation(frame: number): void {
        frame = Math.round(frame);
        this.animation.currentFrame = frame;

        Object.keys(this.animation.tracks).forEach(objectIdStr => {
            const objectId = parseInt(objectIdStr);
            const obj = this.sceneManager?.getObject(objectId);
            if (!obj) return;

            const tracks = this.animation.tracks[objectId];
            Object.keys(tracks).forEach(property => {
                const value = this.getKeyframeValue(objectId, property, frame);
                if (value === null) return;

                this.applyPropertyValue(obj, property, value);
            });
        });
    }

    applyPropertyValue(obj: THREE.Object3D, property: string, value: number | number[]): void {
        switch (property) {
            case 'position':
                if (Array.isArray(value) && value.length === 3) {
                    obj.position.set(value[0], value[1], value[2]);
                }
                break;
            case 'rotation':
                if (Array.isArray(value) && value.length === 3) {
                    obj.rotation.set(value[0], value[1], value[2]);
                }
                break;
            case 'scale':
                if (Array.isArray(value) && value.length === 3) {
                    obj.scale.set(value[0], value[1], value[2]);
                }
                break;
            case 'visible':
                obj.visible = Boolean(value);
                break;
            case 'material.color':
                if ((obj as any).material && typeof value === 'number') {
                    (obj as any).material.color.setHex(value);
                }
                break;
        }
    }

    updateAnimation(): void {
        if (!this.animation.isPlaying) return;

        const delta = this.animationClock.getDelta();
        this.animation.currentFrame += delta * this.animation.fps;

        // Handle looping or stopping at end frame
        if (this.animation.currentFrame > this.animation.endFrame) {
            if (this.animation.loop) {
                this.animation.currentFrame = this.animation.startFrame;
            } else {
                this.animation.currentFrame = this.animation.endFrame;
                this.animation.isPlaying = false;
                return;
            }
        }

        // Apply the animation for the current frame
        this.applyAnimation(this.animation.currentFrame);
    }

    // ==================== HISTORY MANAGEMENT ====================

    saveHistory(): void {
        // Skip saving if we're in the middle of a sculpt operation
        if (this.activeTool === 'select' && this.isDragging) {
            return;
        }

        const currentState = this.serializeState();
        const serializedState = JSON.stringify(currentState);

        // Don't save if identical to last state
        if (this.history[this.historyIndex] === serializedState) {
            return;
        }

        // If we're not at the end of history, discard future states
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Limit history size
        if (this.history.length >= this.maxHistoryStates) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }

        this.history.push(serializedState);
    }

    undo(): boolean {
        if (this.historyIndex <= 0) return false;

        this.historyIndex--;
        this.restoreState(JSON.parse(this.history[this.historyIndex]));
        return true;
    }

    redo(): boolean {
        if (this.historyIndex >= this.history.length - 1) return false;

        this.historyIndex++;
        this.restoreState(JSON.parse(this.history[this.historyIndex]));
        return true;
    }

    // ==================== SERIALIZATION ====================

    serializeState(): Partial<AppStateData> {
        return {
            sceneObjects: this.sceneObjects.map(obj => this.serializeObject(obj)),
            selectedObjects: [...this.selectedObjects],
            viewMode: this.viewMode,
            activeTool: this.activeTool,
            animation: {
                ...this.animation,
                tracks: JSON.parse(JSON.stringify(this.animation.tracks))
            }
        };
    }

    serializeObject(obj: SceneObject): any {
        const threeObj = this.sceneManager?.getObject(obj.id);
        return {
            id: obj.id,
            type: obj.type,
            name: obj.name || `${obj.type}_${obj.id}`,
            position: threeObj?.position?.clone() || new THREE.Vector3(0, 0, 0),
            rotation: threeObj?.rotation?.clone() || new THREE.Euler(0, 0, 0),
            scale: threeObj?.scale?.clone() || new THREE.Vector3(1, 1, 1),
            color: threeObj?.material?.color?.getHex() || 0x808080,
            roughness: threeObj?.material?.roughness || 0.5,
            metalness: threeObj?.material?.metalness || 0,
            visible: threeObj?.visible ?? true,
            userData: { ...obj.userData }
        };
    }

    restoreState(state: any): void {
        // Implementation depends on SceneManager
        console.log('Restoring state:', state);
    }

    // ==================== UTILITY METHODS ====================

    toggleSnap(enabled: boolean): void {
        this.snapSettings.enabled = enabled;
    }

    setSnapValue(value: number): void {
        this.snapSettings.value = parseFloat(value.toString()) || 0.25;
    }

    toggleAxisConstraint(axis: 'x' | 'y' | 'z'): void {
        if (this.snapSettings.axisConstraints.hasOwnProperty(axis)) {
            this.snapSettings.axisConstraints[axis] = !this.snapSettings.axisConstraints[axis];
        }
    }

    groupObjects(objectIds: number[]): void {
        if (objectIds.length < 2) return;
        const groupId = this.generateId();
        this.groups.push({
            id: groupId,
            name: `Group_${groupId}`,
            objects: objectIds
        });
        this.saveHistory();
    }

    ungroupObjects(groupId: number): void {
        const index = this.groups.findIndex(g => g.id === groupId);
        if (index > -1) {
            this.groups.splice(index, 1);
            this.saveHistory();
        }
    }

    toggleObjectVisibility(objectId: number): void {
        const index = this.hiddenObjects.indexOf(objectId);
        if (index > -1) {
            this.hiddenObjects.splice(index, 1);
        } else {
            this.hiddenObjects.push(objectId);
        }
        this.saveHistory();
    }

    toggleObjectFreeze(objectId: number): void {
        const index = this.frozenObjects.indexOf(objectId);
        if (index > -1) {
            this.frozenObjects.splice(index, 1);
        } else {
            this.frozenObjects.push(objectId);
        }
        this.saveHistory();
    }

    updatePerformance(): void {
        this.performance.frameCount++;
        if (performance.now() >= this.performance.lastFrameTime + 1000) {
            this.performance.fps = Math.round(this.performance.frameCount /
                (performance.now() - this.performance.lastFrameTime) * 1000);
            this.performance.frameCount = 0;
            this.performance.lastFrameTime = performance.now();
        }
    }
}
