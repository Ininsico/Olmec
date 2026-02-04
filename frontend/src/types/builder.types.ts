import * as THREE from 'three';

// ==================== CORE TYPES ====================

export interface SceneObject {
    id: number;
    type: 'plane' | 'cube' | 'circle' | 'uv_sphere' | 'ico_sphere' | 'cylinder' | 'cone' | 'torus' | 'grid' | 'monkey' | 'box' | 'sphere';
    name: string;
    threeObj?: THREE.Object3D;
    userData?: Record<string, any>;
}

export interface Transform {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
}

export interface Material {
    color: number;
    roughness: number;
    metalness: number;
    diffuseMap?: THREE.Texture;
    normalMap?: THREE.Texture;
    roughnessMap?: THREE.Texture;
}

// ==================== ANIMATION TYPES ====================

export type InterpolationType = 'linear' | 'constant' | 'bezier';

export interface Keyframe {
    frame: number;
    value: number | number[];
    interpolation: InterpolationType;
    easing?: string;
    inTangent?: number;
    outTangent?: number;
}

export type AnimationProperty = 'position' | 'rotation' | 'scale' | 'visible' | 'material.color';

export interface AnimationTrack {
    [property: string]: Keyframe[];
}

export interface AnimationState {
    currentFrame: number;
    fps: number;
    startFrame: number;
    endFrame: number;
    isPlaying: boolean;
    isRecording: boolean;
    tracks: Record<number, AnimationTrack>;
    selectedKeyframes: SelectedKeyframe[];
    playheadPosition: number;
    zoomLevel: number;
    snapToFrames: boolean;
    loop: boolean;
}

export interface SelectedKeyframe {
    objectId: number;
    property: string;
    frame: number;
    value: number | number[];
}

// ==================== SCULPTING TYPES ====================

export type SculptTool = 'draw' | 'smooth' | 'flatten' | 'inflate' | 'pinch' | 'grab' | 'crevice' | 'mask';

export type SymmetryMode = 'none' | 'x' | 'y' | 'z' | 'radial';

export interface BrushSettings {
    size: number;
    strength: number;
    falloff: number;
    symmetry: SymmetryMode;
}

export interface SculptingState {
    currentMesh: THREE.Mesh | null;
    originalPositions: Float32Array | null;
    vertexNormals: Float32Array | null;
    activeVertices: number[];
    lastCenter: THREE.Vector3 | null;
    vertexGroups: Map<number, number[]>;
}

// ==================== APP STATE TYPES ====================

export type Tool = 'select' | 'move' | 'rotate' | 'scale' | 'boolean-union' | 'boolean-difference' | 'boolean-intersect';

export type ViewMode = 'solid' | 'wireframe' | 'material' | 'rendered';

export type CameraView = 'front' | 'side' | 'top' | 'perspective';

export type CameraMode = 'perspective' | 'orthographic';

export type TransformMode = 'translate' | 'rotation' | 'scale';

export interface SnapSettings {
    enabled: boolean;
    value: number;
    axisConstraints: {
        x: boolean;
        y: boolean;
        z: boolean;
    };
}

export interface Layer {
    id: number;
    name: string;
    visible: boolean;
    objects: number[];
}

export interface Group {
    id: number;
    name: string;
    objects: number[];
}

export interface ViewportSettings {
    shading: string;
    gridVisible: boolean;
    axesVisible: boolean;
    statsVisible: boolean;
}

export interface PerformanceStats {
    fps: number;
    frameTime: number;
    lastFrameTime: number;
    frameCount: number;
}

export interface AppStateData {
    sceneObjects: SceneObject[];
    selectedObjects: number[];
    lastObjectId: number;
    activeTool: Tool;
    viewMode: ViewMode;
    cameraMode: CameraMode;
    transformMode: TransformMode;
    clipboard: any;
    history: string[];
    historyIndex: number;
    maxHistoryStates: number;
    isDragging: boolean;
    dragStart: { x: number; y: number };
    selectionBox: { start: { x: number; y: number }; end: { x: number; y: number } };
    performance: PerformanceStats;
    brushSettings: BrushSettings;
    animation: AnimationState;
    sculpting: SculptingState;
    snapSettings: SnapSettings;
    groups: Group[];
    hiddenObjects: number[];
    frozenObjects: number[];
    layers: Record<string, Layer>;
    viewportSettings: ViewportSettings;
    textures: {
        diffuse: Record<number, THREE.Texture>;
        normal: Record<number, THREE.Texture>;
        roughness: Record<number, THREE.Texture>;
    };
}

// ==================== UI TYPES ====================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

export interface ContextMenuItem {
    id: string;
    label: string;
    icon: string;
    action: () => void;
    divider?: boolean;
}

export type TabType = 'create' | 'sculpt' | 'scene' | 'properties';

// ==================== EXPORT TYPES ====================

export interface ExportOptions {
    format: 'gltf' | 'glb' | 'json';
    binary: boolean;
    includeAnimations: boolean;
    includeMaterials: boolean;
}

export interface ProjectData {
    version: string;
    name: string;
    created: string;
    modified: string;
    scene: any;
    state: Partial<AppStateData>;
}
