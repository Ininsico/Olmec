import * as THREE from 'three';
import { SculptBrush, BrushType, FalloffType, type BrushSettings } from './SculptBrush';
import { DynamicTopology, type DyntopoSettings } from './DynamicTopology';

/**
 * Symmetry settings for sculpting
 */
export interface SymmetrySettings {
    x: boolean;
    y: boolean;
    z: boolean;
    radial: number; // Number of radial symmetry instances
}

/**
 * Mask data for protecting areas from sculpting
 */
export interface MaskData {
    enabled: boolean;
    values: Float32Array; // Per-vertex mask values (0-1)
    inverted: boolean;
}

/**
 * Sculpt session state
 */
export interface SculptSession {
    mesh: THREE.Mesh;
    originalGeometry: THREE.BufferGeometry;
    currentGeometry: THREE.BufferGeometry;
    undoStack: THREE.BufferGeometry[];
    redoStack: THREE.BufferGeometry[];
    mask: MaskData | null;
    maxUndoSteps: number;
}

/**
 * SculptManager - Main sculpting system coordinator
 * Manages brushes, dynamic topology, symmetry, masking, and undo/redo
 */
export class SculptManager {
    brush: SculptBrush;
    dyntopo: DynamicTopology;
    symmetry: SymmetrySettings;
    session: SculptSession | null = null;
    isStroking: boolean = false;

    constructor() {
        this.brush = new SculptBrush({
            type: BrushType.DRAW,
            radius: 0.5,
            strength: 0.5,
            falloff: FalloffType.SMOOTH
        });

        this.dyntopo = new DynamicTopology({
            enabled: false,
            detailSize: 0.1
        });

        this.symmetry = {
            x: false,
            y: false,
            z: false,
            radial: 0
        };
    }

    /**
     * Start sculpting session on a mesh
     */
    startSession(mesh: THREE.Mesh): void {
        if (!(mesh.geometry instanceof THREE.BufferGeometry)) {
            console.error('Mesh must have BufferGeometry for sculpting');
            return;
        }

        this.session = {
            mesh,
            originalGeometry: mesh.geometry.clone(),
            currentGeometry: mesh.geometry.clone(),
            undoStack: [],
            redoStack: [],
            mask: null,
            maxUndoSteps: 50
        };

        console.log('✅ Sculpting session started');
    }

    /**
     * End sculpting session
     */
    endSession(): void {
        if (this.session) {
            this.session.mesh.geometry = this.session.currentGeometry;
            this.session = null;
            console.log('✅ Sculpting session ended');
        }
    }

    /**
     * Apply brush stroke at hit point
     */
    applyBrush(
        hitPoint: THREE.Vector3,
        hitNormal: THREE.Vector3,
        pressure: number = 1.0,
        invert: boolean = false
    ): void {
        if (!this.session) {
            console.warn('No active sculpting session');
            return;
        }

        // Save state for undo
        if (!this.isStroking) {
            this.saveState();
        }

        let geometry = this.session.currentGeometry;

        // Apply dynamic topology if enabled
        if (this.dyntopo.settings.enabled) {
            geometry = this.dyntopo.apply(geometry, hitPoint, this.brush.settings.radius);
        }

        // Apply brush
        geometry = this.brush.apply(geometry, hitPoint, hitNormal, pressure, invert);

        // Apply symmetry
        if (this.hasSymmetry()) {
            geometry = this.applySymmetry(geometry, hitPoint, hitNormal, pressure, invert);
        }

        // Apply mask if enabled
        if (this.session.mask?.enabled) {
            geometry = this.applyMask(geometry);
        }

        // Update session geometry
        this.session.currentGeometry = geometry;
        this.session.mesh.geometry = geometry;
    }

    /**
     * Start brush stroke
     */
    startStroke(hitPoint: THREE.Vector3, hitNormal: THREE.Vector3, pressure: number = 1.0): void {
        this.isStroking = true;
        this.brush.startStroke(hitPoint, hitNormal, pressure);
    }

    /**
     * Continue brush stroke
     */
    continueStroke(
        hitPoint: THREE.Vector3,
        hitNormal: THREE.Vector3,
        pressure: number = 1.0,
        invert: boolean = false
    ): void {
        if (!this.isStroking) {
            this.startStroke(hitPoint, hitNormal, pressure);
        }

        this.brush.continueStroke(hitPoint, hitNormal, pressure);
        this.applyBrush(hitPoint, hitNormal, pressure, invert);
    }

    /**
     * End brush stroke
     */
    endStroke(): void {
        this.isStroking = false;
        this.brush.endStroke();
    }

    /**
     * Apply symmetry to geometry
     */
    private applySymmetry(
        geometry: THREE.BufferGeometry,
        hitPoint: THREE.Vector3,
        hitNormal: THREE.Vector3,
        pressure: number,
        invert: boolean
    ): THREE.BufferGeometry {
        let result = geometry;

        // Mirror symmetry
        if (this.symmetry.x) {
            const mirrorPoint = new THREE.Vector3(-hitPoint.x, hitPoint.y, hitPoint.z);
            const mirrorNormal = new THREE.Vector3(-hitNormal.x, hitNormal.y, hitNormal.z);
            result = this.brush.apply(result, mirrorPoint, mirrorNormal, pressure, invert);
        }

        if (this.symmetry.y) {
            const mirrorPoint = new THREE.Vector3(hitPoint.x, -hitPoint.y, hitPoint.z);
            const mirrorNormal = new THREE.Vector3(hitNormal.x, -hitNormal.y, hitNormal.z);
            result = this.brush.apply(result, mirrorPoint, mirrorNormal, pressure, invert);
        }

        if (this.symmetry.z) {
            const mirrorPoint = new THREE.Vector3(hitPoint.x, hitPoint.y, -hitPoint.z);
            const mirrorNormal = new THREE.Vector3(hitNormal.x, hitNormal.y, -hitNormal.z);
            result = this.brush.apply(result, mirrorPoint, mirrorNormal, pressure, invert);
        }

        // Radial symmetry
        if (this.symmetry.radial > 1) {
            const angleStep = (Math.PI * 2) / this.symmetry.radial;

            for (let i = 1; i < this.symmetry.radial; i++) {
                const angle = angleStep * i;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);

                // Rotate around Y axis
                const rotatedPoint = new THREE.Vector3(
                    hitPoint.x * cos - hitPoint.z * sin,
                    hitPoint.y,
                    hitPoint.x * sin + hitPoint.z * cos
                );

                const rotatedNormal = new THREE.Vector3(
                    hitNormal.x * cos - hitNormal.z * sin,
                    hitNormal.y,
                    hitNormal.x * sin + hitNormal.z * cos
                );

                result = this.brush.apply(result, rotatedPoint, rotatedNormal, pressure, invert);
            }
        }

        return result;
    }

    /**
     * Apply mask to geometry
     */
    private applyMask(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        if (!this.session?.mask) return geometry;

        const position = geometry.attributes.position;
        const originalPosition = this.session.originalGeometry.attributes.position;
        const maskValues = this.session.mask.values;
        const inverted = this.session.mask.inverted;

        const newPositions = new Float32Array(position.array);

        for (let i = 0; i < position.count; i++) {
            let maskValue = maskValues[i] || 0;
            if (inverted) maskValue = 1 - maskValue;

            // Blend between original and sculpted based on mask
            const factor = 1 - maskValue;
            newPositions[i * 3] = THREE.MathUtils.lerp(
                originalPosition.getX(i),
                position.getX(i),
                factor
            );
            newPositions[i * 3 + 1] = THREE.MathUtils.lerp(
                originalPosition.getY(i),
                position.getY(i),
                factor
            );
            newPositions[i * 3 + 2] = THREE.MathUtils.lerp(
                originalPosition.getZ(i),
                position.getZ(i),
                factor
            );
        }

        const newGeometry = geometry.clone();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Check if any symmetry is enabled
     */
    private hasSymmetry(): boolean {
        return this.symmetry.x || this.symmetry.y || this.symmetry.z || this.symmetry.radial > 1;
    }

    /**
     * Save current state for undo
     */
    private saveState(): void {
        if (!this.session) return;

        this.session.undoStack.push(this.session.currentGeometry.clone());
        this.session.redoStack = []; // Clear redo stack on new action

        // Limit undo stack size
        if (this.session.undoStack.length > this.session.maxUndoSteps) {
            this.session.undoStack.shift();
        }
    }

    /**
     * Undo last sculpt action
     */
    undo(): void {
        if (!this.session || this.session.undoStack.length === 0) {
            console.warn('Nothing to undo');
            return;
        }

        this.session.redoStack.push(this.session.currentGeometry.clone());
        this.session.currentGeometry = this.session.undoStack.pop()!;
        this.session.mesh.geometry = this.session.currentGeometry;

        console.log('✅ Undo applied');
    }

    /**
     * Redo last undone action
     */
    redo(): void {
        if (!this.session || this.session.redoStack.length === 0) {
            console.warn('Nothing to redo');
            return;
        }

        this.session.undoStack.push(this.session.currentGeometry.clone());
        this.session.currentGeometry = this.session.redoStack.pop()!;
        this.session.mesh.geometry = this.session.currentGeometry;

        console.log('✅ Redo applied');
    }

    /**
     * Reset to original geometry
     */
    reset(): void {
        if (!this.session) return;

        this.session.currentGeometry = this.session.originalGeometry.clone();
        this.session.mesh.geometry = this.session.currentGeometry;
        this.session.undoStack = [];
        this.session.redoStack = [];

        console.log('✅ Reset to original geometry');
    }

    /**
     * Create mask from brush
     */
    createMask(
        hitPoint: THREE.Vector3,
        radius: number,
        strength: number,
        additive: boolean = true
    ): void {
        if (!this.session) return;

        const position = this.session.currentGeometry.attributes.position;

        if (!this.session.mask) {
            this.session.mask = {
                enabled: true,
                values: new Float32Array(position.count),
                inverted: false
            };
        }

        for (let i = 0; i < position.count; i++) {
            const vertex = new THREE.Vector3(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
            );

            const distance = vertex.distanceTo(hitPoint);
            if (distance <= radius) {
                const falloff = this.brush.calculateFalloff(distance, radius);
                const maskValue = falloff * strength;

                if (additive) {
                    this.session.mask.values[i] = Math.min(1, this.session.mask.values[i] + maskValue);
                } else {
                    this.session.mask.values[i] = Math.max(0, this.session.mask.values[i] - maskValue);
                }
            }
        }

        console.log('✅ Mask updated');
    }

    /**
     * Clear mask
     */
    clearMask(): void {
        if (this.session) {
            this.session.mask = null;
            console.log('✅ Mask cleared');
        }
    }

    /**
     * Invert mask
     */
    invertMask(): void {
        if (this.session?.mask) {
            this.session.mask.inverted = !this.session.mask.inverted;
            console.log('✅ Mask inverted');
        }
    }

    /**
     * Set brush type
     */
    setBrushType(type: BrushType): void {
        this.brush.settings.type = type;
        console.log(`✅ Brush type set to: ${type}`);
    }

    /**
     * Set brush radius
     */
    setBrushRadius(radius: number): void {
        this.brush.settings.radius = radius;
    }

    /**
     * Set brush strength
     */
    setBrushStrength(strength: number): void {
        this.brush.settings.strength = strength;
    }

    /**
     * Set brush falloff
     */
    setBrushFalloff(falloff: FalloffType): void {
        this.brush.settings.falloff = falloff;
    }

    /**
     * Update brush settings
     */
    updateBrushSettings(settings: Partial<BrushSettings>): void {
        this.brush.settings = { ...this.brush.settings, ...settings };
    }

    /**
     * Enable/disable dynamic topology
     */
    setDyntopo(enabled: boolean): void {
        this.dyntopo.settings.enabled = enabled;
        console.log(`✅ Dynamic topology ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Update dyntopo settings
     */
    updateDyntopoSettings(settings: Partial<DyntopoSettings>): void {
        this.dyntopo.settings = { ...this.dyntopo.settings, ...settings };
    }

    /**
     * Set symmetry
     */
    setSymmetry(axis: 'x' | 'y' | 'z', enabled: boolean): void {
        this.symmetry[axis] = enabled;
        console.log(`✅ ${axis.toUpperCase()} symmetry ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set radial symmetry
     */
    setRadialSymmetry(count: number): void {
        this.symmetry.radial = Math.max(0, Math.floor(count));
        console.log(`✅ Radial symmetry set to ${count}`);
    }

    /**
     * Remesh entire geometry
     */
    remesh(targetDetail: number): void {
        if (!this.session) return;

        this.saveState();
        this.session.currentGeometry = this.dyntopo.remesh(
            this.session.currentGeometry,
            targetDetail
        );
        this.session.mesh.geometry = this.session.currentGeometry;

        console.log('✅ Geometry remeshed');
    }

    /**
     * Smooth entire mesh
     */
    smoothAll(iterations: number = 1, strength: number = 0.5): void {
        if (!this.session) return;

        this.saveState();

        const smoothBrush = new SculptBrush({
            type: BrushType.SMOOTH,
            radius: 1000, // Large radius to affect all vertices
            strength,
            falloff: FalloffType.CONSTANT
        });

        let geometry = this.session.currentGeometry;
        const center = new THREE.Vector3();
        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
            geometry.boundingBox.getCenter(center);
        }

        for (let i = 0; i < iterations; i++) {
            geometry = smoothBrush.apply(geometry, center, new THREE.Vector3(0, 1, 0), 1, false);
        }

        this.session.currentGeometry = geometry;
        this.session.mesh.geometry = geometry;

        console.log(`✅ Mesh smoothed (${iterations} iterations)`);
    }

    /**
     * Get current session info
     */
    getSessionInfo(): string {
        if (!this.session) return 'No active session';

        const vertexCount = this.session.currentGeometry.attributes.position.count;
        const faceCount = this.session.currentGeometry.index
            ? this.session.currentGeometry.index.count / 3
            : 0;

        return `Vertices: ${vertexCount.toLocaleString()} | Faces: ${faceCount.toLocaleString()} | Undo: ${this.session.undoStack.length}`;
    }
}
