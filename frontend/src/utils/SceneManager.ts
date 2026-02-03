import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import type { SceneObject, ViewMode, CameraView } from '../types/builder.types';

export class SceneManager {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    transformControls: TransformControls;
    gridHelper: THREE.GridHelper;
    axesHelper: THREE.AxesHelper;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    objects: Map<number, THREE.Object3D>;
    selectedObject: THREE.Object3D | null = null;
    selectionBox: THREE.Box3Helper | null = null;
    stats: {
        triangles: number;
        vertices: number;
    };

    constructor(canvas: HTMLCanvasElement) {
        if (!canvas) throw new Error('Canvas element is required');

        this.canvas = canvas;
        this.objects = new Map();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.stats = {
            triangles: 0,
            vertices: 0
        };

        // Initialize scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        // Initialize camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);

        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Initialize controls
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 100;

        // Initialize transform controls
        this.transformControls = new TransformControls(this.camera, canvas);
        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.controls.enabled = !event.value;
        });
        this.scene.add(this.transformControls as unknown as THREE.Object3D);

        // Add grid
        this.gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
        this.scene.add(this.gridHelper);

        // Add axes
        this.axesHelper = new THREE.AxesHelper(5);
        this.axesHelper.visible = false;
        this.scene.add(this.axesHelper);

        // Add lights
        this.setupLights();

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    setupLights(): void {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Hemisphere light
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(hemisphereLight);
    }

    // ==================== OBJECT MANAGEMENT ====================

    createGeometry(type: string): THREE.BufferGeometry {
        switch (type) {
            case 'box':
                return new THREE.BoxGeometry(1, 1, 1);
            case 'sphere':
                return new THREE.SphereGeometry(0.5, 32, 32);
            case 'cylinder':
                return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
            case 'cone':
                return new THREE.ConeGeometry(0.5, 1, 32);
            case 'torus':
                return new THREE.TorusGeometry(0.5, 0.2, 16, 100);
            case 'plane':
                return new THREE.PlaneGeometry(1, 1);
            default:
                return new THREE.BoxGeometry(1, 1, 1);
        }
    }

    addObject(obj: SceneObject): THREE.Object3D | null {
        const geometry = this.createGeometry(obj.type);
        const material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.5,
            metalness: 0
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.id = obj.id;
        mesh.name = obj.name || `${obj.type}_${obj.id}`;

        this.scene.add(mesh);
        this.objects.set(obj.id, mesh);
        this.updateStats();

        return mesh;
    }

    removeObject(objectId: number): boolean {
        const obj = this.objects.get(objectId);
        if (obj) {
            this.scene.remove(obj);
            this.objects.delete(objectId);

            if (obj === this.selectedObject) {
                this.clearSelection();
            }

            // Dispose geometry and material
            if ((obj as THREE.Mesh).geometry) {
                (obj as THREE.Mesh).geometry.dispose();
            }
            if ((obj as THREE.Mesh).material) {
                if (Array.isArray((obj as THREE.Mesh).material)) {
                    ((obj as THREE.Mesh).material as THREE.Material[]).forEach(mat => mat.dispose());
                } else {
                    ((obj as THREE.Mesh).material as THREE.Material).dispose();
                }
            }

            this.updateStats();
            return true;
        }
        return false;
    }

    getObject(objectId: number): THREE.Object3D | null {
        return this.objects.get(objectId) || null;
    }

    // ==================== SELECTION ====================

    selectObject(objectId: number): void {
        const obj = this.objects.get(objectId);
        if (obj) {
            this.selectedObject = obj;
            this.transformControls.attach(obj);
            this.updateSelectionBox(obj);
        }
    }

    clearSelection(): void {
        this.selectedObject = null;
        this.transformControls.detach();
        if (this.selectionBox) {
            this.scene.remove(this.selectionBox);
            this.selectionBox = null;
        }
    }

    updateSelectionBox(obj: THREE.Object3D): void {
        if (this.selectionBox) {
            this.scene.remove(this.selectionBox);
        }

        const box = new THREE.Box3().setFromObject(obj);
        this.selectionBox = new THREE.Box3Helper(box, 0x6e48ff);
        this.scene.add(this.selectionBox);
    }

    // ==================== RAYCASTING ====================

    getIntersectedObject(x: number, y: number): THREE.Object3D | null {
        this.mouse.x = (x / this.canvas.clientWidth) * 2 - 1;
        this.mouse.y = -(y / this.canvas.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(Array.from(this.objects.values()), true);

        if (intersects.length > 0) {
            return intersects[0].object;
        }

        return null;
    }

    // ==================== TRANSFORM CONTROLS ====================

    setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void {
        this.transformControls.setMode(mode);
    }

    setTransformSpace(space: 'world' | 'local'): void {
        this.transformControls.setSpace(space);
    }

    // ==================== VIEW MODES ====================

    setViewMode(mode: ViewMode): void {
        this.objects.forEach(obj => {
            const mesh = obj as THREE.Mesh;
            if (!mesh.material) return;

            const material = mesh.material as THREE.MeshStandardMaterial;

            switch (mode) {
                case 'solid':
                    material.wireframe = false;
                    material.transparent = false;
                    material.opacity = 1;
                    break;
                case 'wireframe':
                    material.wireframe = true;
                    break;
                case 'material':
                case 'rendered':
                    material.wireframe = false;
                    material.transparent = false;
                    material.opacity = 1;
                    break;
            }
        });
    }

    // ==================== CAMERA VIEWS ====================

    setCameraView(view: CameraView): void {
        const distance = this.camera.position.length();

        switch (view) {
            case 'front':
                this.camera.position.set(0, 0, distance);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'side':
                this.camera.position.set(distance, 0, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'top':
                this.camera.position.set(0, distance, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'perspective':
                this.camera.position.set(distance / Math.sqrt(3), distance / Math.sqrt(3), distance / Math.sqrt(3));
                this.camera.lookAt(0, 0, 0);
                break;
        }

        this.controls.update();
    }

    // ==================== CAMERA MODES ====================

    setCameraMode(mode: 'perspective' | 'orthographic'): void {
        const position = this.camera.position.clone();
        const target = this.controls.target.clone();

        if (mode === 'orthographic') {
            const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            const frustumSize = 10;
            const orthoCamera = new THREE.OrthographicCamera(
                frustumSize * aspect / -2,
                frustumSize * aspect / 2,
                frustumSize / 2,
                frustumSize / -2,
                0.1,
                1000
            );
            orthoCamera.position.copy(position);
            orthoCamera.lookAt(target);
            this.camera = orthoCamera as any;
        } else {
            const perspCamera = new THREE.PerspectiveCamera(
                75,
                this.canvas.clientWidth / this.canvas.clientHeight,
                0.1,
                1000
            );
            perspCamera.position.copy(position);
            perspCamera.lookAt(target);
            this.camera = perspCamera;
        }

        this.controls.object = this.camera;
        this.transformControls.camera = this.camera;
    }

    // ==================== UTILITIES ====================

    updateStats(): void {
        let triangles = 0;
        let vertices = 0;

        this.objects.forEach(obj => {
            const mesh = obj as THREE.Mesh;
            if (mesh.geometry) {
                const geometry = mesh.geometry;
                if (geometry.index) {
                    triangles += geometry.index.count / 3;
                } else if (geometry.attributes.position) {
                    triangles += geometry.attributes.position.count / 3;
                }
                if (geometry.attributes.position) {
                    vertices += geometry.attributes.position.count;
                }
            }
        });

        this.stats.triangles = Math.floor(triangles);
        this.stats.vertices = vertices;
    }

    handleResize(): void {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height, false); // Pass false to avoid overriding CSS styles
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    render(): void {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    dispose(): void {
        window.removeEventListener('resize', this.handleResize.bind(this));
        this.renderer.dispose();
        this.controls.dispose();
        this.transformControls.dispose();

        // Dispose all objects
        this.objects.forEach(obj => {
            const mesh = obj as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(mat => mat.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        });

        this.objects.clear();
    }
}
