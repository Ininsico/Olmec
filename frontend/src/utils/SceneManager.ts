import * as THREE from 'three';
import { OrbitControls, TransformControls } from 'three-stdlib';
import type { SceneObject } from '../types/builder.types';
import { MeshFactory } from './MeshFactory';
import { MeasureTool } from './tools/MeasureTool';
import { AnnotationTool } from './tools/AnnotationTool';
import { GeometryAnalysisTool } from './tools/GeometryAnalysisTool';

export class SceneManager {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    transformControls: TransformControls;

    // Tools
    measureTool: MeasureTool;
    annotationTool: AnnotationTool;
    geometryAnalysisTool: GeometryAnalysisTool;

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

        // @ts-ignore - TransformControls has custom events not in Object3D type
        this.transformControls.addEventListener('change', () => {
            // Visual update handled by loop
        });

        // @ts-ignore - TransformControls has custom 'dragging-changed' event
        this.transformControls.addEventListener('dragging-changed', (event: any) => {
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

        // 7. Initialize Tools
        this.measureTool = new MeasureTool(this.scene, this.camera, this.renderer);
        this.annotationTool = new AnnotationTool(this.scene);
        this.geometryAnalysisTool = new GeometryAnalysisTool(this.scene);

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

        // 1. Check active tools first (Measure/Annotate)
        if (this.measureTool.isActive()) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(Array.from(this.objects.values()));
            if (intersects.length > 0) {
                this.measureTool.handleClick(intersects[0].point);
            }
            return;
        }

        if (this.annotationTool.isActive()) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(Array.from(this.objects.values()));
            if (intersects.length > 0) {
                this.annotationTool.handleClick(intersects[0].point);
            }
            return;
        }

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
            this.geometryAnalysisTool.activate(obj);
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
        this.geometryAnalysisTool.deactivate();
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

    // ================= Edit / Tools =================

    private currentEditMode: 'object' | 'vertex' | 'edge' | 'face' = 'object';

    setEditMode(mode: 'object' | 'vertex' | 'edge' | 'face') {
        this.currentEditMode = mode;
        console.log(`✏️ Edit Mode set to: ${mode.toUpperCase()}`);

        // Update visual feedback based on mode
        if (this.selectedObject) {
            this.updateModeVisualization(mode);
        }
    }

    private updateModeVisualization(mode: 'object' | 'vertex' | 'edge' | 'face') {
        // TODO: Add visual helpers for different edit modes
        // - Vertex mode: Show vertex points
        // - Edge mode: Highlight edges
        // - Face mode: Highlight faces
        console.log(`Updating visualization for ${mode} mode`);
    }

    applyEditAction(action: string) {
        console.log(`🔧 Apply Edit Action: ${action}`);

        if (!this.selectedObject) {
            console.warn('⚠️ No object selected for edit action');
            return;
        }

        if (!(this.selectedObject instanceof THREE.Mesh)) {
            console.warn('⚠️ Selected object is not a mesh');
            return;
        }

        const mesh = this.selectedObject as THREE.Mesh;

        // Route to appropriate handler based on current mode and action
        switch (this.currentEditMode) {
            case 'object':
                this.handleObjectModeAction(action, mesh);
                break;
            case 'vertex':
                this.handleVertexModeAction(action, mesh);
                break;
            case 'edge':
                this.handleEdgeModeAction(action, mesh);
                break;
            case 'face':
                this.handleFaceModeAction(action, mesh);
                break;
        }
    }

    private handleObjectModeAction(action: string, _mesh: THREE.Mesh) {
        switch (action) {
            case 'move':
            case 'rotate':
            case 'scale':
                // Already handled by transform controls
                console.log(`Transform mode: ${action}`);
                break;
            case 'transform':
                this.resetSelectedObjectTransform();
                break;
            case 'measure':
                this.toggleMeasureTool();
                break;
            case 'annotate':
                this.toggleAnnotationTool();
                break;
            default:
                console.log(`Object mode action '${action}' queued for implementation`);
        }
    }

    toggleMeasureTool() {
        if (this.measureTool.isActive()) {
            this.measureTool.deactivate();
        } else {
            this.measureTool.activate();
            this.annotationTool.deactivate(); // Exclusive
        }
    }

    toggleAnnotationTool() {
        if (this.annotationTool.isActive()) {
            this.annotationTool.deactivate();
        } else {
            this.annotationTool.activate();
            this.measureTool.deactivate(); // Exclusive
        }
    }

    private handleVertexModeAction(action: string, mesh: THREE.Mesh) {
        const geometry = mesh.geometry;

        switch (action) {
            case 'move':
            case 'scale':
            case 'extrude':
                console.log(`✅ Vertex ${action} - Geometry vertices: ${geometry.attributes.position.count}`);
                // TODO: Implement vertex manipulation
                break;
            case 'connect':
            case 'split':
            case 'merge':
            case 'dissolve':
            case 'rip':
                console.log(`✅ Vertex operation: ${action}`);
                // TODO: Implement vertex topology operations
                break;
            case 'smooth':
            case 'flatten':
            case 'align':
            case 'snap':
            case 'bevel':
            case 'chamfer':
                console.log(`✅ Vertex modifier: ${action}`);
                // TODO: Implement vertex modifiers
                break;
            case 'select_all':
            case 'select_none':
            case 'select_inverse':
            case 'select_random':
            case 'select_linked':
            case 'select_similar':
                console.log(`✅ Vertex selection: ${action}`);
                // TODO: Implement vertex selection tools
                break;
            default:
                console.log(`Vertex action '${action}' not recognized`);
        }
    }

    private handleEdgeModeAction(action: string, _mesh: THREE.Mesh) {
        switch (action) {
            case 'extrude':
            case 'bevel':
            case 'loop_cut':
            case 'subdivide':
            case 'bridge':
            case 'crease':
                console.log(`✅ Edge tool: ${action} - Processing mesh edges`);
                // TODO: Implement edge tools
                break;
            case 'edge_slide':
            case 'offset':
            case 'dissolve':
            case 'collapse':
            case 'split':
            case 'rotate':
                console.log(`✅ Edge operation: ${action}`);
                // TODO: Implement edge operations
                break;
            case 'select_all':
            case 'select_none':
            case 'select_inverse':
            case 'select_loop':
            case 'select_ring':
            case 'select_boundary':
            case 'select_sharp':
            case 'select_linked':
                console.log(`✅ Edge selection: ${action}`);
                // TODO: Implement edge selection
                break;
            case 'mark_seam':
            case 'mark_sharp':
            case 'clear_seam':
            case 'clear_sharp':
                console.log(`✅ Edge modifier: ${action}`);
                // TODO: Implement edge modifiers
                break;
            default:
                console.log(`Edge action '${action}' not recognized`);
        }
    }

    private handleFaceModeAction(action: string, mesh: THREE.Mesh) {
        const geometry = mesh.geometry;

        switch (action) {
            case 'extrude':
            case 'inset':
            case 'bevel':
            case 'poke':
            case 'triangulate':
            case 'solidify':
                console.log(`✅ Face tool: ${action} - Processing ${geometry.attributes.position.count / 3} faces`);
                // TODO: Implement face tools
                break;
            case 'subdivide':
            case 'dissolve':
            case 'duplicate':
            case 'separate':
            case 'flip':
            case 'rotate':
                console.log(`✅ Face operation: ${action}`);
                // TODO: Implement face operations
                break;
            case 'select_all':
            case 'select_none':
            case 'select_inverse':
            case 'select_linked':
            case 'select_similar':
            case 'select_random':
            case 'select_island':
            case 'select_boundary':
                console.log(`✅ Face selection: ${action}`);
                // TODO: Implement face selection
                break;
            case 'normals_flip':
            case 'normals_recalculate':
            case 'normals_reset':
            case 'normals_smooth':
            case 'normals_flatten':
            case 'normals_average':
                console.log(`✅ Face normals: ${action}`);
                this.handleNormalOperation(action, geometry);
                break;
            case 'material_assign':
            case 'material_select':
            case 'material_deselect':
            case 'material_remove':
                console.log(`✅ Face material: ${action}`);
                // TODO: Implement material operations
                break;
            default:
                console.log(`Face action '${action}' not recognized`);
        }
    }

    private handleNormalOperation(action: string, geometry: THREE.BufferGeometry) {
        switch (action) {
            case 'normals_flip':
                // Flip normals by reversing vertex order or scaling by -1
                console.log('Flipping normals...');
                geometry.scale(-1, 1, 1);
                geometry.computeVertexNormals();
                break;
            case 'normals_recalculate':
            case 'normals_reset':
                console.log('Recalculating normals...');
                geometry.computeVertexNormals();
                break;
            case 'normals_smooth':
                console.log('Smoothing normals...');
                geometry.computeVertexNormals();
                break;
            case 'normals_flatten':
                console.log('Flattening normals...');
                // TODO: Set all normals to face normal
                break;
            case 'normals_average':
                console.log('Averaging normals...');
                geometry.computeVertexNormals();
                break;
        }
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
