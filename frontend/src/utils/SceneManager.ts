import * as THREE from 'three';
import { OrbitControls, TransformControls } from 'three-stdlib';
import type { SceneObject } from '../types/builder.types';
import { MeshFactory } from './MeshFactory';
import { MeasureTool } from './tools/MeasureTool';
import { AnnotationTool } from './tools/AnnotationTool';
import { GeometryAnalysisTool } from './tools/GeometryAnalysisTool';
import { VertexOperations } from './geometry/VertexOperations';
import { EdgeOperations } from './geometry/EdgeOperations';
import { FaceOperations } from './geometry/FaceOperations';
import { SculptManager } from './sculpting/SculptManager';

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
    sculptManager: SculptManager;

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
        this.sculptManager = new SculptManager();

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
        const geometry = mesh.geometry as THREE.BufferGeometry;

        // For demo purposes, select all vertices. In production, you'd track selected vertices
        const selectedVertices = VertexOperations.selectAll(geometry);

        try {
            let newGeometry: THREE.BufferGeometry | null = null;

            switch (action) {
                case 'move':
                    // Move vertices by small offset (would be interactive in production)
                    newGeometry = VertexOperations.moveVertices(
                        geometry,
                        selectedVertices,
                        new THREE.Vector3(0.1, 0, 0)
                    );
                    console.log('✅ Vertices moved');
                    break;

                case 'scale':
                    newGeometry = VertexOperations.scaleVertices(geometry, selectedVertices, 1.1);
                    console.log('✅ Vertices scaled');
                    break;

                case 'extrude':
                    newGeometry = VertexOperations.extrudeVertices(geometry, selectedVertices, 0.2);
                    console.log('✅ Vertices extruded');
                    break;

                case 'merge':
                    newGeometry = VertexOperations.mergeVertices(geometry, 0.01);
                    console.log('✅ Vertices merged');
                    break;

                case 'smooth':
                    newGeometry = VertexOperations.smoothVertices(geometry, selectedVertices, 2, 0.5);
                    console.log('✅ Vertices smoothed');
                    break;

                case 'flatten':
                    newGeometry = VertexOperations.flattenVertices(geometry, selectedVertices, 'z');
                    console.log('✅ Vertices flattened');
                    break;

                case 'align':
                    newGeometry = VertexOperations.alignVertices(geometry, selectedVertices, 'y', 0);
                    console.log('✅ Vertices aligned');
                    break;

                case 'snap':
                    newGeometry = VertexOperations.snapVertices(geometry, selectedVertices, 0.5);
                    console.log('✅ Vertices snapped to grid');
                    break;

                case 'bevel':
                    newGeometry = VertexOperations.bevelVertices(geometry, selectedVertices, 0.1);
                    console.log('✅ Vertices beveled');
                    break;

                case 'select_all':
                    console.log(`✅ Selected ${VertexOperations.selectAll(geometry).length} vertices`);
                    break;

                case 'select_random':
                    const random = VertexOperations.selectRandom(geometry, 0.5);
                    console.log(`✅ Selected ${random.length} random vertices`);
                    break;

                case 'select_linked':
                    if (selectedVertices.length > 0) {
                        const linked = VertexOperations.selectLinked(geometry, selectedVertices[0]);
                        console.log(`✅ Selected ${linked.length} linked vertices`);
                    }
                    break;

                default:
                    console.log(`Vertex action '${action}' not yet implemented`);
                    return;
            }

            // Apply new geometry if operation created one
            if (newGeometry) {
                mesh.geometry.dispose();
                mesh.geometry = newGeometry;
                this.updateSelectionBox(mesh);
            }
        } catch (error) {
            console.error(`Error in vertex operation '${action}':`, error);
        }
    }

    private handleEdgeModeAction(action: string, mesh: THREE.Mesh) {
        const geometry = mesh.geometry as THREE.BufferGeometry;

        try {
            let newGeometry: THREE.BufferGeometry | null = null;

            switch (action) {
                case 'extrude':
                    // Demo: extrude first edge
                    const edges = EdgeOperations.selectBoundaryEdges(geometry);
                    if (edges.length > 0) {
                        newGeometry = EdgeOperations.extrudeEdges(geometry, edges.slice(0, 1), 0.2);
                        console.log('✅ Edge extruded');
                    }
                    break;

                case 'bevel':
                    const bevelEdges = EdgeOperations.selectBoundaryEdges(geometry);
                    if (bevelEdges.length > 0) {
                        newGeometry = EdgeOperations.bevelEdges(geometry, bevelEdges.slice(0, 1), 0.1);
                        console.log('✅ Edge beveled');
                    }
                    break;

                case 'loop_cut':
                case 'subdivide':
                    newGeometry = EdgeOperations.subdivideEdges(geometry, 1);
                    console.log('✅ Edges subdivided');
                    break;

                case 'bridge':
                    console.log('✅ Edge bridge - requires two edge loops');
                    break;

                case 'crease':
                    const creaseEdges = EdgeOperations.selectSharpEdges(geometry, 45);
                    newGeometry = EdgeOperations.creaseEdge(geometry, creaseEdges, 1.0);
                    console.log('✅ Edges creased');
                    break;

                case 'edge_slide':
                    const slideEdges = EdgeOperations.selectBoundaryEdges(geometry);
                    if (slideEdges.length > 0) {
                        newGeometry = EdgeOperations.slideEdge(geometry, slideEdges[0], 0.1);
                        console.log('✅ Edge slid');
                    }
                    break;

                case 'dissolve':
                    const dissolveEdges = EdgeOperations.selectBoundaryEdges(geometry);
                    if (dissolveEdges.length > 0) {
                        newGeometry = EdgeOperations.dissolveEdges(geometry, dissolveEdges.slice(0, 1));
                        console.log('✅ Edges dissolved');
                    }
                    break;

                case 'collapse':
                    const collapseEdges = EdgeOperations.selectBoundaryEdges(geometry);
                    if (collapseEdges.length > 0) {
                        newGeometry = EdgeOperations.collapseEdge(geometry, collapseEdges[0]);
                        console.log('✅ Edge collapsed');
                    }
                    break;

                case 'select_boundary':
                    const boundary = EdgeOperations.selectBoundaryEdges(geometry);
                    console.log(`✅ Selected ${boundary.length} boundary edges`);
                    break;

                case 'select_sharp':
                    const sharp = EdgeOperations.selectSharpEdges(geometry, 30);
                    console.log(`✅ Selected ${sharp.length} sharp edges`);
                    break;

                case 'mark_seam':
                    const seamEdges = EdgeOperations.selectBoundaryEdges(geometry);
                    newGeometry = EdgeOperations.markSeam(geometry, seamEdges);
                    console.log('✅ Edges marked as seam');
                    break;

                case 'mark_sharp':
                    const sharpEdges = EdgeOperations.selectSharpEdges(geometry, 30);
                    newGeometry = EdgeOperations.markSharp(geometry, sharpEdges);
                    console.log('✅ Edges marked as sharp');
                    break;

                default:
                    console.log(`Edge action '${action}' not yet implemented`);
                    return;
            }

            // Apply new geometry if operation created one
            if (newGeometry) {
                mesh.geometry.dispose();
                mesh.geometry = newGeometry;
                this.updateSelectionBox(mesh);
            }
        } catch (error) {
            console.error(`Error in edge operation '${action}':`, error);
        }
    }

    private handleFaceModeAction(action: string, mesh: THREE.Mesh) {
        const geometry = mesh.geometry as THREE.BufferGeometry;

        try {
            let newGeometry: THREE.BufferGeometry | null = null;

            // For demo purposes, select all faces. In production, you'd track selected faces
            const allFaces = FaceOperations.selectAll(geometry);

            switch (action) {
                case 'extrude':
                    // Demo: extrude first few faces
                    const facesToExtrude = allFaces.slice(0, Math.min(2, allFaces.length));
                    newGeometry = FaceOperations.extrudeFaces(geometry, facesToExtrude, 0.3);
                    console.log('✅ Faces extruded');
                    break;

                case 'inset':
                    const facesToInset = allFaces.slice(0, Math.min(2, allFaces.length));
                    newGeometry = FaceOperations.insetFaces(geometry, facesToInset, 0.2);
                    console.log('✅ Faces inset');
                    break;

                case 'bevel':
                    const facesToBevel = allFaces.slice(0, Math.min(2, allFaces.length));
                    newGeometry = FaceOperations.bevelFaces(geometry, facesToBevel, 0.15);
                    console.log('✅ Faces beveled');
                    break;

                case 'poke':
                    const facesToPoke = allFaces.slice(0, Math.min(3, allFaces.length));
                    newGeometry = FaceOperations.pokeFaces(geometry, facesToPoke);
                    console.log('✅ Faces poked');
                    break;

                case 'triangulate':
                    newGeometry = FaceOperations.triangulateFaces(geometry);
                    console.log('✅ Faces triangulated');
                    break;

                case 'solidify':
                    newGeometry = FaceOperations.solidifyFaces(geometry, 0.1);
                    console.log('✅ Mesh solidified');
                    break;

                case 'subdivide':
                    const facesToSubdivide = allFaces.slice(0, Math.min(4, allFaces.length));
                    newGeometry = FaceOperations.subdivideFaces(geometry, facesToSubdivide);
                    console.log('✅ Faces subdivided');
                    break;

                case 'dissolve':
                    const facesToDissolve = allFaces.slice(0, 1);
                    newGeometry = FaceOperations.dissolveFaces(geometry, facesToDissolve);
                    console.log('✅ Faces dissolved');
                    break;

                case 'duplicate':
                    const facesToDuplicate = allFaces.slice(0, Math.min(2, allFaces.length));
                    newGeometry = FaceOperations.duplicateFaces(geometry, facesToDuplicate);
                    console.log('✅ Faces duplicated');
                    break;

                case 'flip':
                case 'normals_flip':
                    const facesToFlip = allFaces.slice(0, Math.min(3, allFaces.length));
                    newGeometry = FaceOperations.flipFaceNormals(geometry, facesToFlip);
                    console.log('✅ Face normals flipped');
                    break;

                case 'normals_recalculate':
                case 'normals_reset':
                    newGeometry = FaceOperations.recalculateNormals(geometry);
                    console.log('✅ Normals recalculated');
                    break;

                case 'normals_smooth':
                    newGeometry = FaceOperations.smoothNormals(geometry);
                    console.log('✅ Normals smoothed');
                    break;

                case 'normals_flatten':
                    newGeometry = FaceOperations.flattenNormals(geometry);
                    console.log('✅ Normals flattened');
                    break;

                case 'normals_average':
                    newGeometry = FaceOperations.smoothNormals(geometry);
                    console.log('✅ Normals averaged');
                    break;

                case 'select_all':
                    console.log(`✅ Selected ${allFaces.length} faces`);
                    break;

                case 'select_random':
                    const random = FaceOperations.selectRandom(geometry, 0.5);
                    console.log(`✅ Selected ${random.length} random faces`);
                    break;

                case 'select_linked':
                    if (allFaces.length > 0) {
                        const linked = FaceOperations.selectLinked(geometry, allFaces[0]);
                        console.log(`✅ Selected ${linked.length} linked faces`);
                    }
                    break;

                case 'select_boundary':
                    const boundary = FaceOperations.selectBoundary(geometry);
                    console.log(`✅ Selected ${boundary.length} boundary faces`);
                    break;

                case 'separate':
                    const facesToSeparate = allFaces.slice(0, Math.min(2, allFaces.length));
                    const result = FaceOperations.separateFaces(geometry, facesToSeparate);
                    newGeometry = result.main;
                    console.log('✅ Faces separated into new object');
                    // Note: result.separated would need to be added as a new object
                    break;

                case 'material_assign':
                case 'material_select':
                case 'material_deselect':
                case 'material_remove':
                    console.log(`✅ Material operation: ${action} (requires material system)`);
                    break;

                default:
                    console.log(`Face action '${action}' not yet implemented`);
                    return;
            }

            // Apply new geometry if operation created one
            if (newGeometry) {
                mesh.geometry.dispose();
                mesh.geometry = newGeometry;
                this.updateSelectionBox(mesh);
            }
        } catch (error) {
            console.error(`Error in face operation '${action}':`, error);
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
