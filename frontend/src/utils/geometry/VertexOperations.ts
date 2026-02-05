import * as THREE from 'three';
import { GeometryUtils } from './GeometryUtils';

/**
 * Complete vertex-level geometry operations
 * Production-ready implementations for vertex manipulation
 */
export class VertexOperations {
    /**
     * Move selected vertices by offset
     */
    static moveVertices(
        geometry: THREE.BufferGeometry,
        vertexIndices: number[],
        offset: THREE.Vector3
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        for (const idx of vertexIndices) {
            position.setXYZ(
                idx,
                position.getX(idx) + offset.x,
                position.getY(idx) + offset.y,
                position.getZ(idx) + offset.z
            );
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Scale vertices from center point
     */
    static scaleVertices(
        geometry: THREE.BufferGeometry,
        vertexIndices: number[],
        scale: number,
        center?: THREE.Vector3
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        // Calculate center if not provided
        const actualCenter = center || this.calculateCenter(geometry, vertexIndices);

        for (const idx of vertexIndices) {
            const v = new THREE.Vector3(
                position.getX(idx),
                position.getY(idx),
                position.getZ(idx)
            );

            v.sub(actualCenter).multiplyScalar(scale).add(actualCenter);
            position.setXYZ(idx, v.x, v.y, v.z);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Extrude vertices along normal
     */
    static extrudeVertices(
        geometry: THREE.BufferGeometry,
        vertexIndices: number[],
        distance: number
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;
        const normal = newGeometry.attributes.normal;

        if (!normal) {
            newGeometry.computeVertexNormals();
        }

        for (const idx of vertexIndices) {
            const n = new THREE.Vector3(
                normal.getX(idx),
                normal.getY(idx),
                normal.getZ(idx)
            );

            position.setXYZ(
                idx,
                position.getX(idx) + n.x * distance,
                position.getY(idx) + n.y * distance,
                position.getZ(idx) + n.z * distance
            );
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Merge vertices within threshold distance
     */
    static mergeVertices(
        geometry: THREE.BufferGeometry,
        threshold: number = 0.0001
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const vertexMap = new Map<string, number>();
        const newIndices: number[] = [];
        const newPositions: number[] = [];
        const indexMapping = new Map<number, number>();

        // Build vertex map
        for (let i = 0; i < position.count; i++) {
            const v = new THREE.Vector3(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
            );

            const key = `${Math.round(v.x / threshold)},${Math.round(v.y / threshold)},${Math.round(v.z / threshold)}`;

            if (!vertexMap.has(key)) {
                const newIdx = newPositions.length / 3;
                vertexMap.set(key, newIdx);
                newPositions.push(v.x, v.y, v.z);
                indexMapping.set(i, newIdx);
            } else {
                indexMapping.set(i, vertexMap.get(key)!);
            }
        }

        // Remap indices
        const index = geometry.index;
        if (index) {
            for (let i = 0; i < index.count; i++) {
                const oldIdx = index.array[i];
                newIndices.push(indexMapping.get(oldIdx)!);
            }
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));

        if (newIndices.length > 0) {
            newGeometry.setIndex(newIndices);
        }

        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Smooth vertices using Laplacian smoothing
     */
    static smoothVertices(
        geometry: THREE.BufferGeometry,
        vertexIndices: number[],
        iterations: number = 1,
        factor: number = 0.5
    ): THREE.BufferGeometry {
        let newGeometry = geometry.clone();

        for (let iter = 0; iter < iterations; iter++) {
            const position = newGeometry.attributes.position;
            const newPositions = new Float32Array(position.array);

            for (const idx of vertexIndices) {
                const neighbors = GeometryUtils.getVertexNeighbors(newGeometry, idx);

                if (neighbors.length === 0) continue;

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
                    position.getX(idx),
                    position.getY(idx),
                    position.getZ(idx)
                );

                currentPos.lerp(avgPos, factor);
                newPositions[idx * 3] = currentPos.x;
                newPositions[idx * 3 + 1] = currentPos.y;
                newPositions[idx * 3 + 2] = currentPos.z;
            }

            newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
            newGeometry.attributes.position.needsUpdate = true;
        }

        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Flatten vertices to a plane
     */
    static flattenVertices(
        geometry: THREE.BufferGeometry,
        vertexIndices: number[],
        axis: 'x' | 'y' | 'z' = 'z'
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        // Calculate average position along axis
        let sum = 0;
        for (const idx of vertexIndices) {
            sum += axis === 'x' ? position.getX(idx) :
                axis === 'y' ? position.getY(idx) :
                    position.getZ(idx);
        }
        const avg = sum / vertexIndices.length;

        // Flatten to average
        for (const idx of vertexIndices) {
            if (axis === 'x') position.setX(idx, avg);
            else if (axis === 'y') position.setY(idx, avg);
            else position.setZ(idx, avg);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Align vertices to axis
     */
    static alignVertices(
        geometry: THREE.BufferGeometry,
        vertexIndices: number[],
        axis: 'x' | 'y' | 'z',
        value: number
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        for (const idx of vertexIndices) {
            if (axis === 'x') position.setX(idx, value);
            else if (axis === 'y') position.setY(idx, value);
            else position.setZ(idx, value);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Snap vertices to grid
     */
    static snapVertices(
        geometry: THREE.BufferGeometry,
        vertexIndices: number[],
        gridSize: number = 0.1
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        for (const idx of vertexIndices) {
            const x = Math.round(position.getX(idx) / gridSize) * gridSize;
            const y = Math.round(position.getY(idx) / gridSize) * gridSize;
            const z = Math.round(position.getZ(idx) / gridSize) * gridSize;
            position.setXYZ(idx, x, y, z);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Bevel vertices (create small faces at vertex)
     */
    static bevelVertices(
        geometry: THREE.BufferGeometry,
        vertexIndices: number[],
        amount: number = 0.1
    ): THREE.BufferGeometry {
        // Simplified bevel - moves vertex inward along average edge direction
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        for (const idx of vertexIndices) {
            const neighbors = GeometryUtils.getVertexNeighbors(newGeometry, idx);
            if (neighbors.length === 0) continue;

            const currentPos = new THREE.Vector3(
                position.getX(idx),
                position.getY(idx),
                position.getZ(idx)
            );

            const avgDirection = new THREE.Vector3();
            for (const neighborIdx of neighbors) {
                const neighborPos = new THREE.Vector3(
                    position.getX(neighborIdx),
                    position.getY(neighborIdx),
                    position.getZ(neighborIdx)
                );
                avgDirection.add(neighborPos.sub(currentPos));
            }
            avgDirection.divideScalar(neighbors.length).normalize();

            currentPos.add(avgDirection.multiplyScalar(amount));
            position.setXYZ(idx, currentPos.x, currentPos.y, currentPos.z);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Calculate center of vertices
     */
    private static calculateCenter(geometry: THREE.BufferGeometry, vertexIndices: number[]): THREE.Vector3 {
        const position = geometry.attributes.position;
        const center = new THREE.Vector3();

        for (const idx of vertexIndices) {
            center.add(new THREE.Vector3(
                position.getX(idx),
                position.getY(idx),
                position.getZ(idx)
            ));
        }

        return center.divideScalar(vertexIndices.length);
    }

    /**
     * Select all vertices
     */
    static selectAll(geometry: THREE.BufferGeometry): number[] {
        const position = geometry.attributes.position;
        return Array.from({ length: position.count }, (_, i) => i);
    }

    /**
     * Select random vertices
     */
    static selectRandom(geometry: THREE.BufferGeometry, percentage: number = 0.5): number[] {
        const position = geometry.attributes.position;
        const selected: number[] = [];

        for (let i = 0; i < position.count; i++) {
            if (Math.random() < percentage) {
                selected.push(i);
            }
        }

        return selected;
    }

    /**
     * Select linked vertices (connected component)
     */
    static selectLinked(geometry: THREE.BufferGeometry, startVertex: number): number[] {
        const visited = new Set<number>();
        const queue = [startVertex];
        visited.add(startVertex);

        while (queue.length > 0) {
            const current = queue.shift()!;
            const neighbors = GeometryUtils.getVertexNeighbors(geometry, current);

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        return Array.from(visited);
    }
}
