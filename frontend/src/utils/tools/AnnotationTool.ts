import * as THREE from 'three';

export class AnnotationTool {
    private scene: THREE.Scene;
    private active: boolean = false;
    private annotations: THREE.Sprite[] = [];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    activate() {
        this.active = true;
        console.log('📝 Annotation Tool Active: Click to add annotation');
    }

    deactivate() {
        this.active = false;
    }

    isActive() {
        return this.active;
    }

    handleClick(point: THREE.Vector3) {
        if (!this.active) return;

        const text = prompt('Enter annotation text:');
        if (text) {
            this.addAnnotation(point, text);
        }
    }

    addAnnotation(position: THREE.Vector3, text: string) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        // Dynamic size based on text length
        const fontSize = 24;
        context.font = `bold ${fontSize}px Arial`;
        const textMetrics = context.measureText(text);
        const width = textMetrics.width + 20;
        const height = fontSize + 20;

        canvas.width = width;
        canvas.height = height;

        // Background
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.roundRect(0, 0, width, height, 8);
        context.fill();

        // Border
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.stroke();

        // Text
        context.font = `bold ${fontSize}px Arial`;
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, width / 2, height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);

        sprite.position.copy(position);
        // Scale sprite to maintain aspect ratio, strictly related to font size world scale
        const worldScale = 0.02;
        sprite.scale.set(width * worldScale, height * worldScale, 1);

        this.scene.add(sprite);
        this.annotations.push(sprite);
        console.log(`📝 Annotation added: "${text}" at`, position);
    }

    clear() {
        this.annotations.forEach(a => {
            this.scene.remove(a);
            a.material.map?.dispose();
            a.material.dispose();
        });
        this.annotations = [];
    }
}
