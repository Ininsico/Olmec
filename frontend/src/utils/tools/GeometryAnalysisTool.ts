import * as THREE from 'three';
import { GeometryUtils } from '../geometry/GeometryUtils';

export class GeometryAnalysisTool {
    private scene: THREE.Scene;
    private active: boolean = false;
    private overlays: THREE.Object3D[] = [];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    activate(selectedObject: THREE.Object3D | null) {
        this.active = true;
        this.update(selectedObject);
        console.log('📊 Geometry Analysis Active');
    }

    deactivate() {
        this.active = false;
        this.clear();
    }

    update(selectedObject: THREE.Object3D | null) {
        this.clear();
        if (!this.active || !selectedObject || !(selectedObject instanceof THREE.Mesh)) return;

        const geometry = selectedObject.geometry;
        if (!geometry) return;

        // 1. Visualize Edge Lengths
        this.visualizeEdgeLengths(selectedObject);

        // 2. Visualize Face Areas (center of face)
        this.visualizeFaceAreas(selectedObject);
    }

    private visualizeEdgeLengths(mesh: THREE.Mesh) {
        const geometry = mesh.geometry;
        const edges = GeometryUtils.getEdges(geometry);
        const position = geometry.attributes.position;
        const worldMatrix = mesh.matrixWorld;

        edges.forEach(edge => {
            const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0).applyMatrix4(worldMatrix);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1).applyMatrix4(worldMatrix);

            const center = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);
            const length = v0.distanceTo(v1);

            if (length > 0.001) { // Filter zero-length
                this.createLabel(center, length.toFixed(2), 0x00ff00, 0.3); // Small green text
            }
        });
    }

    private visualizeFaceAreas(mesh: THREE.Mesh) {
        const geometry = mesh.geometry;
        const index = geometry.index;
        const position = geometry.attributes.position;
        const worldMatrix = mesh.matrixWorld;

        const count = index ? index.count / 3 : position.count / 3;

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            const i0 = index ? index.array[idx] : idx;
            const i1 = index ? index.array[idx + 1] : idx + 1;
            const i2 = index ? index.array[idx + 2] : idx + 2;

            const v0 = new THREE.Vector3().fromBufferAttribute(position, i0).applyMatrix4(worldMatrix);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, i1).applyMatrix4(worldMatrix);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, i2).applyMatrix4(worldMatrix);

            // Compute Area
            const edge1 = new THREE.Vector3().subVectors(v1, v0);
            const edge2 = new THREE.Vector3().subVectors(v2, v0);
            const cross = new THREE.Vector3().crossVectors(edge1, edge2);
            const area = cross.length() * 0.5;

            const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);

            if (area > 0.001) {
                this.createLabel(center, area.toFixed(2), 0xff00ff, 0.4); // Magenta for area
            }
        }
    }

    private createLabel(position: THREE.Vector3, text: string, color: number, scale: number) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = 128;
        canvas.height = 64;

        context.font = 'bold 40px Arial';
        context.fillStyle = '#' + new THREE.Color(color).getHexString();
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.strokeText(text, 64, 32);
        context.fillText(text, 64, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false }); // Always on top? Maybe
        const sprite = new THREE.Sprite(material);

        sprite.position.copy(position);
        sprite.scale.set(scale, scale * 0.5, 1);

        this.scene.add(sprite);
        this.overlays.push(sprite);
    }

    clear() {
        this.overlays.forEach(o => {
            this.scene.remove(o);
            if (o instanceof THREE.Sprite) {
                o.material.map?.dispose();
                o.material.dispose();
            }
        });
        this.overlays = [];
    }
}
