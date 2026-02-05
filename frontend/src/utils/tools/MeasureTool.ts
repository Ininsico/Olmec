import * as THREE from 'three';

export class MeasureTool {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private active: boolean = false;
    private points: THREE.Vector3[] = [];

    // Visuals
    private markers: THREE.Mesh[] = [];
    private line: THREE.Line | null = null;
    private label: THREE.Sprite | null = null;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
    }

    activate() {
        this.active = true;
        this.clear();
        console.log('📏 Measurement Tool Active: Click two points to measure distance');
    }

    deactivate() {
        this.active = false;
        this.clear();
    }

    isActive() {
        return this.active;
    }

    handleClick(point: THREE.Vector3) {
        if (!this.active) return;

        // Add point
        this.points.push(point);
        this.createMarker(point);

        console.log(`📍 Point ${this.points.length} set at:`, point);

        if (this.points.length === 2) {
            this.finalizeMeasurement();
        } else if (this.points.length > 2) {
            // Reset and start new measurement
            this.clear();
            this.points.push(point);
            this.createMarker(point);
        }
    }

    private createMarker(position: THREE.Vector3) {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(position);
        this.scene.add(marker);
        this.markers.push(marker);
    }

    private finalizeMeasurement() {
        const p1 = this.points[0];
        const p2 = this.points[1];
        const distance = p1.distanceTo(p2);

        // Draw Line
        const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
        this.line = new THREE.Line(geometry, material);
        this.scene.add(this.line);

        // Create Label
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        this.createLabel(midPoint, `${distance.toFixed(3)}m`);

        console.log(`📏 Distance: ${distance.toFixed(4)} meters`);
    }

    private createLabel(position: THREE.Vector3, text: string) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = 256;
        canvas.height = 128;

        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, 256, 128);
        context.font = 'bold 48px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        this.label = new THREE.Sprite(material);
        this.label.position.copy(position);
        this.label.scale.set(2, 1, 1); // Adjust size
        this.scene.add(this.label);
    }

    private clear() {
        // Remove visuals
        this.markers.forEach(m => {
            m.geometry.dispose();
            (m.material as THREE.Material).dispose();
            this.scene.remove(m);
        });
        this.markers = [];

        if (this.line) {
            this.line.geometry.dispose();
            (this.line.material as THREE.Material).dispose();
            this.scene.remove(this.line);
            this.line = null;
        }

        if (this.label) {
            this.label.geometry.dispose();
            this.label.material.map?.dispose();
            this.label.material.dispose();
            this.scene.remove(this.label);
            this.label = null;
        }

        this.points = [];
    }
}
