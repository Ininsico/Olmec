import * as THREE from 'three';

/**
 * TransformUtils - Utility class for handling object transformations
 */
export class TransformUtils {
    /**
     * Move an object by a delta vector
     */
    static move(object: THREE.Object3D, delta: THREE.Vector3): void {
        object.position.add(delta);
    }

    /**
     * Move an object to an absolute position
     */
    static moveTo(object: THREE.Object3D, position: THREE.Vector3): void {
        object.position.copy(position);
    }

    /**
     * Rotate an object by delta angles (in radians)
     */
    static rotate(object: THREE.Object3D, deltaX: number, deltaY: number, deltaZ: number): void {
        object.rotation.x += deltaX;
        object.rotation.y += deltaY;
        object.rotation.z += deltaZ;
    }

    /**
     * Set absolute rotation (in radians)
     */
    static rotateTo(object: THREE.Object3D, x: number, y: number, z: number): void {
        object.rotation.set(x, y, z);
    }

    /**
     * Scale an object by a factor
     */
    static scale(object: THREE.Object3D, factor: number | THREE.Vector3): void {
        if (typeof factor === 'number') {
            object.scale.multiplyScalar(factor);
        } else {
            object.scale.multiply(factor);
        }
    }

    /**
     * Set absolute scale
     */
    static scaleTo(object: THREE.Object3D, scale: number | THREE.Vector3): void {
        if (typeof scale === 'number') {
            object.scale.set(scale, scale, scale);
        } else {
            object.scale.copy(scale);
        }
    }

    /**
     * Reset transform to default values
     */
    static resetTransform(object: THREE.Object3D): void {
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);
    }

    /**
     * Get bounding box of an object
     */
    static getBoundingBox(object: THREE.Object3D): THREE.Box3 {
        const box = new THREE.Box3();
        box.setFromObject(object);
        return box;
    }

    /**
     * Get size of an object
     */
    static getSize(object: THREE.Object3D): THREE.Vector3 {
        const box = this.getBoundingBox(object);
        const size = new THREE.Vector3();
        box.getSize(size);
        return size;
    }

    /**
     * Get center of an object
     */
    static getCenter(object: THREE.Object3D): THREE.Vector3 {
        const box = this.getBoundingBox(object);
        const center = new THREE.Vector3();
        box.getCenter(center);
        return center;
    }

    /**
     * Align object to grid
     */
    static snapToGrid(object: THREE.Object3D, gridSize: number = 1): void {
        object.position.x = Math.round(object.position.x / gridSize) * gridSize;
        object.position.y = Math.round(object.position.y / gridSize) * gridSize;
        object.position.z = Math.round(object.position.z / gridSize) * gridSize;
    }

    /**
     * Duplicate an object
     */
    static duplicate(object: THREE.Object3D): THREE.Object3D {
        const clone = object.clone();
        clone.position.add(new THREE.Vector3(1, 0, 0)); // Offset slightly
        return clone;
    }

    /**
     * Mirror an object along an axis
     */
    static mirror(object: THREE.Object3D, axis: 'x' | 'y' | 'z'): void {
        switch (axis) {
            case 'x':
                object.scale.x *= -1;
                break;
            case 'y':
                object.scale.y *= -1;
                break;
            case 'z':
                object.scale.z *= -1;
                break;
        }
    }

    /**
     * Calculate distance between two objects
     */
    static distance(obj1: THREE.Object3D, obj2: THREE.Object3D): number {
        return obj1.position.distanceTo(obj2.position);
    }

    /**
     * Look at a target
     */
    static lookAt(object: THREE.Object3D, target: THREE.Vector3): void {
        object.lookAt(target);
    }

    /**
     * Apply transform from one object to another
     */
    static copyTransform(source: THREE.Object3D, target: THREE.Object3D): void {
        target.position.copy(source.position);
        target.rotation.copy(source.rotation);
        target.scale.copy(source.scale);
    }

    /**
     * Convert degrees to radians
     */
    static degToRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert radians to degrees
     */
    static radToDeg(radians: number): number {
        return radians * (180 / Math.PI);
    }
}

/**
 * MeasurementUtils - Utility class for measurements and annotations
 */
export class MeasurementUtils {
    /**
     * Create a line between two points
     */
    static createLine(start: THREE.Vector3, end: THREE.Vector3, color: number = 0xff0000): THREE.Line {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({ color });
        return new THREE.Line(geometry, material);
    }

    /**
     * Create a measurement label
     */
    static createLabel(text: string, position: THREE.Vector3): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        canvas.width = 256;
        canvas.height = 64;

        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = 'Bold 24px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 8);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(2, 0.5, 1);

        return sprite;
    }

    /**
     * Measure distance between two points
     */
    static measureDistance(point1: THREE.Vector3, point2: THREE.Vector3): number {
        return point1.distanceTo(point2);
    }

    /**
     * Create a dimension line with measurement
     */
    static createDimensionLine(
        start: THREE.Vector3,
        end: THREE.Vector3,
        scene: THREE.Scene
    ): { line: THREE.Line; label: THREE.Sprite } {
        const line = this.createLine(start, end, 0xffff00);
        const distance = this.measureDistance(start, end);
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const label = this.createLabel(`${distance.toFixed(2)}`, midPoint);

        scene.add(line);
        scene.add(label);

        return { line, label };
    }

    /**
     * Calculate angle between three points
     */
    static calculateAngle(p1: THREE.Vector3, vertex: THREE.Vector3, p2: THREE.Vector3): number {
        const v1 = new THREE.Vector3().subVectors(p1, vertex).normalize();
        const v2 = new THREE.Vector3().subVectors(p2, vertex).normalize();
        return Math.acos(v1.dot(v2));
    }

    /**
     * Create an angle indicator
     */
    static createAngleIndicator(
        p1: THREE.Vector3,
        vertex: THREE.Vector3,
        p2: THREE.Vector3,
        scene: THREE.Scene
    ): THREE.Group {
        const group = new THREE.Group();
        const angle = this.calculateAngle(p1, vertex, p2);
        const angleDegrees = TransformUtils.radToDeg(angle);

        // Create arc
        const curve = new THREE.EllipseCurve(
            0, 0,
            0.5, 0.5,
            0, angle,
            false,
            0
        );

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const arc = new THREE.Line(geometry, material);

        group.add(arc);
        group.position.copy(vertex);

        // Add label
        const labelPos = new THREE.Vector3(0.7, 0.7, 0).add(vertex);
        const label = this.createLabel(`${angleDegrees.toFixed(1)}°`, labelPos);
        group.add(label);

        scene.add(group);
        return group;
    }
}
