import * as THREE from 'three';
import { OrbitControls, TransformControls } from 'three-stdlib';
import type { SceneObject } from '../types/builder.types';
import { MeshFactory } from './MeshFactory';

export class SceneManager {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    transformControls: TransformControls;

    // Helpers
    gridHelper: THREE.GridHelper;
    axesHelper: THREE.AxesHelper;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;

    // State
    objects: Map<number, THREE.Object3D> = new Map();
    selectedObject: THREE.Object3D | null = null;
    selectionBox: THREE.Box3Helper | null = null;
    isTransformDragging: boolean = false;

    stats = { triangles: 0, vertices: 0 };

    // Callbacks
    onObjectTransform?: (id: number, position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3) => void;
    onObjectSelected?: (id: number | null) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        // 1. Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff); // White background

        // 2. Setup Camera
        const aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);

        // 3. Setup Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 4. Setup Lighting
        this.setupLights();

        // 5. Setup Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // 6. Setup Transform Controls
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.addEventListener('change', () => {
            // Visual update handled by loop
        });

        this.transformControls.addEventListener('dragging-changed', (event) => {
            const isDragging = !!event.value;
            this.controls.enabled = !isDragging; // Disable camera orbit while modifying object
            this.isTransformDragging = isDragging;

            // Sync state when drag finishes
            if (!isDragging && this.selectedObject && this.onObjectTransform) {
                const id = this.selectedObject.userData.id;
                this.onObjectTransform(
                    id,
                    this.selectedObject.position,
                    this.selectedObject.rotation,
                    this.selectedObject.scale
                );
            }
        });

        // Customize gizmo colors - set all axes to black
        const blackColor = new THREE.Color(0x000000);
        if (this.transformControls.children && this.transformControls.children.length > 0) {
            this.transformControls.children.forEach((gizmo: any) => {
                if (gizmo.children) {
                    gizmo.children.forEach((child: any) => {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach((mat: any) => {
                                    mat.color = blackColor.clone();
                                });
                            } else {
                                child.material.color = blackColor.clone();
                            }
                        }
                    });
                }
            });
        }

        this.scene.add(this.transformControls as unknown as THREE.Object3D);

        // 7. Helpers
        this.gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
        this.scene.add(this.gridHelper);

        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);

        // 8. Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 9. Event Listeners
        window.addEventListener('resize', this.handleResize.bind(this));
        this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));

        console.log('✅ SceneManager Rebuilt & Initialized');
    }

    private setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 7.5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add(dirLight);
    }

    // ================= interaction =================

    private handlePointerDown(event: PointerEvent) {
        if (this.isTransformDragging) return;

        // Calculate mouse position
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.canvas.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const objectsToCheck = Array.from(this.objects.values());
        const intersects = this.raycaster.intersectObjects(objectsToCheck, false);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            this.selectObject(hit.userData.id);
        } else {
            console.log('Clicked background - Selection retained');
            // Background click does NOT clear selection
        }
    }

    // ================= API =================

    addSceneObject(obj: SceneObject): void {
        this.addObject(obj);
    }

    getObject(id: number): THREE.Object3D | undefined {
        return this.objects.get(id);
    }

    addObject(objData: SceneObject): void {
        const mesh = MeshFactory.createMesh(objData.type, objData.id, objData.name || 'Object');
        this.scene.add(mesh);
        this.objects.set(objData.id, mesh);

        // IMMEDIATE AUTO SELECT
        this.selectObject(objData.id);
    }

    removeObject(id: number): void {
        const obj = this.objects.get(id);
        if (obj) {
            this.transformControls.detach();
            this.scene.remove(obj);
            this.objects.delete(id);
            if (this.selectedObject === obj) {
                this.clearSelection();
            }
        }
    }

    selectObject(id: number | null): void {
        if (id === null) {
            this.clearSelection();
            return;
        }

        const obj = this.objects.get(id);
        if (obj) {
            this.selectedObject = obj;
            this.transformControls.attach(obj);
            this.transformControls.setMode('translate'); // Default
            this.updateSelectionBox(obj);
            console.log(`Object ${id} Selected`);
            if (this.onObjectSelected) {
                this.onObjectSelected(id);
            }
        }
    }

    clearSelection(): void {
        this.transformControls.detach();
        this.selectedObject = null;
        if (this.selectionBox) {
            this.scene.remove(this.selectionBox);
            this.selectionBox = null;
        }
        if (this.onObjectSelected) {
            this.onObjectSelected(null);
        }
    }

    updateObject(id: number, type: string, _params: any): void {
        const oldMesh = this.objects.get(id);
        if (oldMesh && oldMesh instanceof THREE.Mesh) {
            const newGeo = MeshFactory.createGeometry(type);
            if (newGeo && newGeo instanceof THREE.BufferGeometry) {
                oldMesh.geometry.dispose();
                oldMesh.geometry = newGeo;
            }
        }
    }

    resetSelectedObjectTransform(): void {
        if (this.selectedObject) {
            this.selectedObject.position.set(0, 0, 0);
            this.selectedObject.rotation.set(0, 0, 0);
            this.selectedObject.scale.set(1, 1, 1);
            this.updateSelectionBox(this.selectedObject);

            if (this.onObjectTransform) {
                this.onObjectTransform(
                    this.selectedObject.userData.id,
                    this.selectedObject.position,
                    this.selectedObject.rotation,
                    this.selectedObject.scale
                );
            }
        }
    }

    setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
        this.transformControls.setMode(mode);
    }

    setCameraView(view: string): void {
        const distance = 10;
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
                this.camera.position.set(5, 5, 5);
                this.camera.lookAt(0, 0, 0);
                break;
        }
        this.controls.update();
    }

    // REQUIRED by Builder.tsx
    setViewMode(mode: string): void {
        console.log('Set view mode:', mode);
        this.objects.forEach(obj => {
            if (obj instanceof THREE.Mesh) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.wireframe = (mode === 'wireframe'));
                } else {
                    (obj.material as any).wireframe = (mode === 'wireframe');
                }
            }
        });
    }

    public updateSelectionBox(obj: THREE.Object3D) {
        if (this.selectionBox) this.scene.remove(this.selectionBox);
        this.selectionBox = new THREE.Box3Helper(new THREE.Box3().setFromObject(obj), 0xffff00);
        this.scene.add(this.selectionBox);
    }

    // ================= Loop =================

    handleResize() {
        if (!this.canvas) return;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
    }

    render() {
        if (!this.renderer) return;
        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        // Update stats
        this.stats.triangles = this.renderer.info.render.triangles;
    }

    dispose() {
        window.removeEventListener('resize', this.handleResize);
        this.renderer.dispose();
    }
}
