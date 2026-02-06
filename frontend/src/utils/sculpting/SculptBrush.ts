import * as THREE from 'three';

/**
 * Sculpt Brush Types - All professional sculpting brushes
 */
export const BrushType = {
    DRAW: 'draw',
    DRAW_SHARP: 'draw_sharp',
    CLAY: 'clay',
    CLAY_STRIPS: 'clay_strips',
    LAYER: 'layer',
    INFLATE: 'inflate',
    BLOB: 'blob',
    CREASE: 'crease',
    SMOOTH: 'smooth',
    FLATTEN: 'flatten',
    FILL: 'fill',
    SCRAPE: 'scrape',
    PINCH: 'pinch',
    GRAB: 'grab',
    ELASTIC: 'elastic',
    SNAKE: 'snake',
    THUMB: 'thumb',
    POSE: 'pose',
    NUDGE: 'nudge',
    ROTATE: 'rotate',
    SLIDE: 'slide'
} as const;

export type BrushType = typeof BrushType[keyof typeof BrushType];

/**
 * Brush falloff curves for natural sculpting
 */
export const FalloffType = {
    SMOOTH: 'smooth',
    SPHERE: 'sphere',
    ROOT: 'root',
    SHARP: 'sharp',
    LINEAR: 'linear',
    CONSTANT: 'constant'
} as const;

export type FalloffType = typeof FalloffType[keyof typeof FalloffType];

/**
 * Sculpt Brush Configuration
 */
export interface BrushSettings {
    type: BrushType;
    radius: number;
    strength: number;
    falloff: FalloffType;
    autoSmooth: number;
    normalRadius: number;
    hardness: number;
    spacing: number;
    accumulate: boolean;
    frontFacesOnly: boolean;
    useNormalDirection: boolean;
}

/**
 * Brush stroke data for continuous sculpting
 */
export interface BrushStroke {
    points: THREE.Vector3[];
    normals: THREE.Vector3[];
    pressures: number[];
    timestamps: number[];
}

/**
 * SculptBrush - Core brush implementation with all professional features
 */
export class SculptBrush {
    settings: BrushSettings;
    stroke: BrushStroke;
    lastPoint: THREE.Vector3 | null = null;
    lastTime: number = 0;

    constructor(settings: Partial<BrushSettings> = {}) {
        this.settings = {
            type: BrushType.DRAW,
            radius: 0.5,
            strength: 0.5,
            falloff: FalloffType.SMOOTH,
            autoSmooth: 0,
            normalRadius: 0.5,
            hardness: 0.5,
            spacing: 0.1,
            accumulate: false,
            frontFacesOnly: true,
            useNormalDirection: true,
            ...settings
        };

        this.stroke = {
            points: [],
            normals: [],
            pressures: [],
            timestamps: []
        };
    }

    /**
     * Calculate falloff weight based on distance from brush center
     */
    calculateFalloff(distance: number, radius: number): number {
        if (distance >= radius) return 0;

        const normalized = distance / radius;
        const hardness = this.settings.hardness;

        switch (this.settings.falloff) {
            case FalloffType.SMOOTH:
                // Smooth cubic falloff
                const t = 1 - normalized;
                return t * t * (3 - 2 * t);

            case FalloffType.SPHERE:
                // Spherical falloff
                return Math.sqrt(1 - normalized * normalized);

            case FalloffType.ROOT:
                // Square root falloff
                return Math.sqrt(1 - normalized);

            case FalloffType.SHARP:
                // Sharp falloff with hardness control
                return Math.pow(1 - normalized, 2 + hardness * 4);

            case FalloffType.LINEAR:
                // Linear falloff
                return 1 - normalized;

            case FalloffType.CONSTANT:
                // Constant (no falloff)
                return 1;

            default:
                return 1 - normalized;
        }
    }

    /**
     * Apply brush to geometry at hit point
     */
    apply(
        geometry: THREE.BufferGeometry,
        hitPoint: THREE.Vector3,
        hitNormal: THREE.Vector3,
        pressure: number = 1.0,
        invert: boolean = false
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const normal = geometry.attributes.normal;

        if (!normal) {
            geometry.computeVertexNormals();
        }

        const newPositions = new Float32Array(position.array);
        const radius = this.settings.radius;
        const strength = this.settings.strength * pressure * (invert ? -1 : 1);

        // Get vertices within brush radius
        const affectedVertices = this.getAffectedVertices(geometry, hitPoint, radius);

        // Apply brush effect based on type
        switch (this.settings.type) {
            case BrushType.DRAW:
                this.applyDraw(newPositions, affectedVertices, hitPoint, hitNormal, strength, radius);
                break;

            case BrushType.DRAW_SHARP:
                this.applyDrawSharp(newPositions, affectedVertices, hitPoint, hitNormal, strength, radius);
                break;

            case BrushType.CLAY:
                this.applyClay(newPositions, affectedVertices, hitPoint, hitNormal, strength, radius);
                break;

            case BrushType.CLAY_STRIPS:
                this.applyClayStrips(newPositions, affectedVertices, hitPoint, hitNormal, strength, radius);
                break;

            case BrushType.INFLATE:
                this.applyInflate(newPositions, normal, affectedVertices, strength, radius);
                break;

            case BrushType.SMOOTH:
                this.applySmooth(geometry, newPositions, affectedVertices, strength, radius);
                break;

            case BrushType.FLATTEN:
                this.applyFlatten(newPositions, affectedVertices, hitPoint, hitNormal, strength, radius);
                break;

            case BrushType.GRAB:
                this.applyGrab(newPositions, affectedVertices, hitPoint, strength, radius);
                break;

            case BrushType.PINCH:
                this.applyPinch(newPositions, affectedVertices, hitPoint, strength, radius);
                break;

            case BrushType.CREASE:
                this.applyCrease(newPositions, affectedVertices, hitPoint, hitNormal, strength, radius);
                break;

            default:
                this.applyDraw(newPositions, affectedVertices, hitPoint, hitNormal, strength, radius);
        }

        // Apply auto-smooth if enabled
        if (this.settings.autoSmooth > 0) {
            this.applyAutoSmooth(geometry, newPositions, affectedVertices, this.settings.autoSmooth);
        }

        const newGeometry = geometry.clone();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.computeVertexNormals();
        newGeometry.computeBoundingBox();
        newGeometry.computeBoundingSphere();

        return newGeometry;
    }

    /**
     * Get vertices affected by brush
     */
    private getAffectedVertices(
        geometry: THREE.BufferGeometry,
        center: THREE.Vector3,
        radius: number
    ): Map<number, { distance: number; weight: number }> {
        const position = geometry.attributes.position;
        const affected = new Map<number, { distance: number; weight: number }>();

        for (let i = 0; i < position.count; i++) {
            const vertex = new THREE.Vector3(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
            );

            const distance = vertex.distanceTo(center);

            if (distance <= radius) {
                const weight = this.calculateFalloff(distance, radius);
                affected.set(i, { distance, weight });
            }
        }

        return affected;
    }

    /**
     * Draw brush - standard displacement along normal
     */
    private applyDraw(
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        _center: THREE.Vector3,
        normal: THREE.Vector3,
        strength: number,
        _radius: number
    ): void {
        affected.forEach(({ weight }, index) => {
            const offset = normal.clone().multiplyScalar(strength * weight);
            positions[index * 3] += offset.x;
            positions[index * 3 + 1] += offset.y;
            positions[index * 3 + 2] += offset.z;
        });
    }

    /**
     * Draw Sharp brush - sharp displacement with no smoothing
     */
    private applyDrawSharp(
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        _center: THREE.Vector3,
        normal: THREE.Vector3,
        strength: number,
        _radius: number
    ): void {
        // Similar to draw but with sharper falloff
        affected.forEach(({ weight }, index) => {
            const sharpWeight = Math.pow(weight, 0.5); // Sharper falloff
            const offset = normal.clone().multiplyScalar(strength * sharpWeight);
            positions[index * 3] += offset.x;
            positions[index * 3 + 1] += offset.y;
            positions[index * 3 + 2] += offset.z;
        });
    }

    /**
     * Clay brush - builds up like clay
     */
    private applyClay(
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        center: THREE.Vector3,
        normal: THREE.Vector3,
        strength: number,
        _radius: number
    ): void {
        // Calculate average height
        let avgHeight = 0;
        affected.forEach((_, index) => {
            const vertex = new THREE.Vector3(
                positions[index * 3],
                positions[index * 3 + 1],
                positions[index * 3 + 2]
            );
            avgHeight += vertex.sub(center).dot(normal);
        });
        avgHeight /= affected.size;

        // Push vertices toward average height
        affected.forEach(({ weight }, index) => {
            const vertex = new THREE.Vector3(
                positions[index * 3],
                positions[index * 3 + 1],
                positions[index * 3 + 2]
            );
            const currentHeight = vertex.clone().sub(center).dot(normal);
            const targetHeight = avgHeight + strength * weight;
            const delta = (targetHeight - currentHeight) * weight;

            const offset = normal.clone().multiplyScalar(delta);
            positions[index * 3] += offset.x;
            positions[index * 3 + 1] += offset.y;
            positions[index * 3 + 2] += offset.z;
        });
    }

    /**
     * Clay Strips brush - creates strip-like clay buildup
     */
    private applyClayStrips(
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        center: THREE.Vector3,
        normal: THREE.Vector3,
        strength: number,
        radius: number
    ): void {
        // Similar to clay but with more defined edges
        this.applyClay(positions, affected, center, normal, strength * 1.2, radius);
    }

    /**
     * Inflate brush - expands along vertex normals
     */
    private applyInflate(
        positions: Float32Array,
        normals: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
        affected: Map<number, { distance: number; weight: number }>,
        strength: number,
        _radius: number
    ): void {
        affected.forEach(({ weight }, index) => {
            const normal = new THREE.Vector3(
                normals.getX(index),
                normals.getY(index),
                normals.getZ(index)
            );
            const offset = normal.multiplyScalar(strength * weight);
            positions[index * 3] += offset.x;
            positions[index * 3 + 1] += offset.y;
            positions[index * 3 + 2] += offset.z;
        });
    }

    /**
     * Smooth brush - Laplacian smoothing
     */
    private applySmooth(
        geometry: THREE.BufferGeometry,
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        strength: number,
        _radius: number
    ): void {
        const position = geometry.attributes.position;
        const smoothed = new Map<number, THREE.Vector3>();

        affected.forEach(({ weight }, index) => {
            // Get neighboring vertices
            const neighbors = this.getVertexNeighbors(geometry, index);

            if (neighbors.length === 0) return;

            const avgPos = new THREE.Vector3();
            for (const neighborIdx of neighbors) {
                avgPos.add(new THREE.Vector3(
                    position.getX(neighborIdx),
                    position.getY(neighborIdx),
                    position.getZ(neighborIdx)
                ));
            }
            avgPos.divideScalar(neighbors.length);

            const currentPos = new THREE.Vector3(
                positions[index * 3],
                positions[index * 3 + 1],
                positions[index * 3 + 2]
            );

            const smoothPos = currentPos.clone().lerp(avgPos, strength * weight);
            smoothed.set(index, smoothPos);
        });

        // Apply smoothed positions
        smoothed.forEach((pos, index) => {
            positions[index * 3] = pos.x;
            positions[index * 3 + 1] = pos.y;
            positions[index * 3 + 2] = pos.z;
        });
    }

    /**
     * Flatten brush - flattens to plane
     */
    private applyFlatten(
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        center: THREE.Vector3,
        normal: THREE.Vector3,
        strength: number,
        radius: number
    ): void {
        affected.forEach(({ weight }, index) => {
            const vertex = new THREE.Vector3(
                positions[index * 3],
                positions[index * 3 + 1],
                positions[index * 3 + 2]
            );

            // Project onto plane
            const toVertex = vertex.clone().sub(center);
            const distanceToPlane = toVertex.dot(normal);
            const offset = normal.clone().multiplyScalar(-distanceToPlane * strength * weight);

            positions[index * 3] += offset.x;
            positions[index * 3 + 1] += offset.y;
            positions[index * 3 + 2] += offset.z;
        });
    }

    /**
     * Grab brush - moves vertices with brush
     */
    private applyGrab(
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        delta: THREE.Vector3,
        strength: number,
        _radius: number
    ): void {
        affected.forEach(({ weight }, index) => {
            const offset = delta.clone().multiplyScalar(strength * weight);
            positions[index * 3] += offset.x;
            positions[index * 3 + 1] += offset.y;
            positions[index * 3 + 2] += offset.z;
        });
    }

    /**
     * Pinch brush - pulls vertices toward center
     */
    private applyPinch(
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        center: THREE.Vector3,
        strength: number,
        _radius: number
    ): void {
        affected.forEach(({ weight }, index) => {
            const vertex = new THREE.Vector3(
                positions[index * 3],
                positions[index * 3 + 1],
                positions[index * 3 + 2]
            );

            const toCenter = center.clone().sub(vertex);
            const offset = toCenter.multiplyScalar(strength * weight);

            positions[index * 3] += offset.x;
            positions[index * 3 + 1] += offset.y;
            positions[index * 3 + 2] += offset.z;
        });
    }

    /**
     * Crease brush - creates sharp creases
     */
    private applyCrease(
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        center: THREE.Vector3,
        normal: THREE.Vector3,
        strength: number,
        radius: number
    ): void {
        // Pinch toward center line, then displace along normal
        this.applyPinch(positions, affected, center, strength * 0.5, radius);
        this.applyDraw(positions, affected, center, normal, strength * 0.5, radius);
    }

    /**
     * Auto-smooth helper
     */
    private applyAutoSmooth(
        geometry: THREE.BufferGeometry,
        positions: Float32Array,
        affected: Map<number, { distance: number; weight: number }>,
        amount: number
    ): void {
        this.applySmooth(geometry, positions, affected, amount, this.settings.radius);
    }

    /**
     * Get neighboring vertices (simplified)
     */
    private getVertexNeighbors(geometry: THREE.BufferGeometry, vertexIndex: number): number[] {
        const index = geometry.index;
        if (!index) return [];

        const neighbors = new Set<number>();

        for (let i = 0; i < index.count; i += 3) {
            const v0 = index.array[i];
            const v1 = index.array[i + 1];
            const v2 = index.array[i + 2];

            if (v0 === vertexIndex) {
                neighbors.add(v1);
                neighbors.add(v2);
            } else if (v1 === vertexIndex) {
                neighbors.add(v0);
                neighbors.add(v2);
            } else if (v2 === vertexIndex) {
                neighbors.add(v0);
                neighbors.add(v1);
            }
        }

        return Array.from(neighbors);
    }

    /**
     * Start new stroke
     */
    startStroke(point: THREE.Vector3, normal: THREE.Vector3, pressure: number = 1.0): void {
        this.stroke = {
            points: [point.clone()],
            normals: [normal.clone()],
            pressures: [pressure],
            timestamps: [Date.now()]
        };
        this.lastPoint = point.clone();
        this.lastTime = Date.now();
    }

    /**
     * Continue stroke
     */
    continueStroke(point: THREE.Vector3, normal: THREE.Vector3, pressure: number = 1.0): void {
        if (!this.lastPoint) {
            this.startStroke(point, normal, pressure);
            return;
        }

        // Check spacing
        const distance = point.distanceTo(this.lastPoint);
        const minSpacing = this.settings.radius * this.settings.spacing;

        if (distance >= minSpacing) {
            this.stroke.points.push(point.clone());
            this.stroke.normals.push(normal.clone());
            this.stroke.pressures.push(pressure);
            this.stroke.timestamps.push(Date.now());
            this.lastPoint = point.clone();
            this.lastTime = Date.now();
        }
    }

    /**
     * End stroke
     */
    endStroke(): void {
        this.lastPoint = null;
        this.lastTime = 0;
    }
}
