import * as THREE from 'three';

/**
 * Dynamic Topology Settings
 */
export interface DyntopoSettings {
    enabled: boolean;
    detailSize: number;
    detailMode: 'relative' | 'constant' | 'brush';
    refineMethod: 'subdivide' | 'collapse' | 'both';
    smoothShading: boolean;
    constantDetail: number;
}

/**
 * DynamicTopology - Adaptive mesh refinement for sculpting
 * Automatically subdivides and collapses geometry based on detail requirements
 */
export class DynamicTopology {
    settings: DyntopoSettings;

    constructor(settings: Partial<DyntopoSettings> = {}) {
        this.settings = {
            enabled: false,
            detailSize: 0.1,
            detailMode: 'relative',
            refineMethod: 'both',
            smoothShading: true,
            constantDetail: 12,
            ...settings
        };
    }

    /**
     * Apply dynamic topology to geometry
     */
    apply(
        geometry: THREE.BufferGeometry,
        center: THREE.Vector3,
        radius: number
    ): THREE.BufferGeometry {
        if (!this.settings.enabled) {
            return geometry;
        }

        let newGeometry = geometry.clone();

        // Subdivide edges that are too long
        if (this.settings.refineMethod === 'subdivide' || this.settings.refineMethod === 'both') {
            newGeometry = this.subdivideEdges(newGeometry, center, radius);
        }

        // Collapse edges that are too short
        if (this.settings.refineMethod === 'collapse' || this.settings.refineMethod === 'both') {
            newGeometry = this.collapseEdges(newGeometry, center, radius);
        }

        // Equalize edge lengths
        newGeometry = this.equalizeEdges(newGeometry, center, radius);

        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Subdivide long edges
     */
    private subdivideEdges(
        geometry: THREE.BufferGeometry,
        center: THREE.Vector3,
        radius: number
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index;

        if (!index) return geometry;

        const _edges = this.getEdges(geometry);
        const maxLength = this.getTargetEdgeLength(center, radius);
        const newPositions: number[] = Array.from(position.array);
        const newIndices: number[] = [];
        const edgeMidpoints = new Map<string, number>();

        let nextVertexIdx = position.count;

        // Process each face
        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0 = index.array[i];
            const v1 = index.array[i + 1];
            const v2 = index.array[i + 2];

            const p0 = new THREE.Vector3(position.getX(v0), position.getY(v0), position.getZ(v0));
            const p1 = new THREE.Vector3(position.getX(v1), position.getY(v1), position.getZ(v1));
            const p2 = new THREE.Vector3(position.getX(v2), position.getY(v2), position.getZ(v2));

            // Check if face is within sculpt radius
            const faceCenter = new THREE.Vector3().add(p0).add(p1).add(p2).divideScalar(3);
            if (faceCenter.distanceTo(center) > radius * 2) {
                // Outside influence area, keep original face
                newIndices.push(v0, v1, v2);
                continue;
            }

            // Check edge lengths and subdivide if needed
            const edges = [
                { v0, v1, p0, p1 },
                { v0: v1, v1: v2, p0: p1, p1: p2 },
                { v0: v2, v1: v0, p0: p2, p1: p0 }
            ];

            const midpoints: number[] = [];
            for (const edge of edges) {
                const length = edge.p0.distanceTo(edge.p1);

                if (length > maxLength) {
                    const key = this.getEdgeKey(edge.v0, edge.v1);

                    if (!edgeMidpoints.has(key)) {
                        const mid = new THREE.Vector3().addVectors(edge.p0, edge.p1).multiplyScalar(0.5);
                        newPositions.push(mid.x, mid.y, mid.z);
                        edgeMidpoints.set(key, nextVertexIdx);
                        midpoints.push(nextVertexIdx);
                        nextVertexIdx++;
                    } else {
                        midpoints.push(edgeMidpoints.get(key)!);
                    }
                } else {
                    midpoints.push(-1); // No subdivision
                }
            }

            // Create new faces based on subdivision
            if (midpoints.some(m => m !== -1)) {
                this.subdivideFace(newIndices, v0, v1, v2, midpoints);
            } else {
                newIndices.push(v0, v1, v2);
            }
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);

        return newGeometry;
    }

    /**
     * Collapse short edges
     */
    private collapseEdges(
        geometry: THREE.BufferGeometry,
        center: THREE.Vector3,
        radius: number
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const minLength = this.getTargetEdgeLength(center, radius) * 0.5;

        // Simplified collapse - merge vertices that are too close
        const vertexMap = new Map<number, number>();
        const newPositions: number[] = [];
        let nextIdx = 0;

        for (let i = 0; i < position.count; i++) {
            const v = new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i));

            // Check if within sculpt area
            if (v.distanceTo(center) > radius * 2) {
                vertexMap.set(i, nextIdx);
                newPositions.push(v.x, v.y, v.z);
                nextIdx++;
                continue;
            }

            // Check if should merge with existing vertex
            let merged = false;
            for (let j = 0; j < nextIdx; j++) {
                const existing = new THREE.Vector3(
                    newPositions[j * 3],
                    newPositions[j * 3 + 1],
                    newPositions[j * 3 + 2]
                );

                if (v.distanceTo(existing) < minLength) {
                    vertexMap.set(i, j);
                    merged = true;
                    break;
                }
            }

            if (!merged) {
                vertexMap.set(i, nextIdx);
                newPositions.push(v.x, v.y, v.z);
                nextIdx++;
            }
        }

        // Remap indices
        const index = geometry.index!;
        const newIndices: number[] = [];

        for (let i = 0; i < index.count; i += 3) {
            const v0 = vertexMap.get(index.array[i])!;
            const v1 = vertexMap.get(index.array[i + 1])!;
            const v2 = vertexMap.get(index.array[i + 2])!;

            // Skip degenerate triangles
            if (v0 !== v1 && v1 !== v2 && v2 !== v0) {
                newIndices.push(v0, v1, v2);
            }
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);

        return newGeometry;
    }

    /**
     * Equalize edge lengths for better topology
     */
    private equalizeEdges(
        geometry: THREE.BufferGeometry,
        center: THREE.Vector3,
        radius: number
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const newPositions = new Float32Array(position.array);

        // Simple edge equalization using Laplacian smoothing
        for (let iter = 0; iter < 2; iter++) {
            const smoothed = new Map<number, THREE.Vector3>();

            for (let i = 0; i < position.count; i++) {
                const v = new THREE.Vector3(
                    newPositions[i * 3],
                    newPositions[i * 3 + 1],
                    newPositions[i * 3 + 2]
                );

                if (v.distanceTo(center) > radius * 2) continue;

                const neighbors = this.getVertexNeighbors(geometry, i);
                if (neighbors.length === 0) continue;

                const avg = new THREE.Vector3();
                for (const n of neighbors) {
                    avg.add(new THREE.Vector3(
                        newPositions[n * 3],
                        newPositions[n * 3 + 1],
                        newPositions[n * 3 + 2]
                    ));
                }
                avg.divideScalar(neighbors.length);

                smoothed.set(i, v.lerp(avg, 0.3));
            }

            smoothed.forEach((pos, idx) => {
                newPositions[idx * 3] = pos.x;
                newPositions[idx * 3 + 1] = pos.y;
                newPositions[idx * 3 + 2] = pos.z;
            });
        }

        const newGeometry = geometry.clone();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));

        return newGeometry;
    }

    /**
     * Get target edge length based on detail settings
     */
    private getTargetEdgeLength(_center: THREE.Vector3, radius: number): number {
        switch (this.settings.detailMode) {
            case 'relative':
                return radius * this.settings.detailSize;
            case 'constant':
                return this.settings.constantDetail / 100;
            case 'brush':
                return radius * 0.1;
            default:
                return radius * this.settings.detailSize;
        }
    }

    /**
     * Get edges from geometry
     */
    private getEdges(geometry: THREE.BufferGeometry): Map<string, { v0: number; v1: number }> {
        const index = geometry.index!;
        const edges = new Map<string, { v0: number; v1: number }>();

        for (let i = 0; i < index.count; i += 3) {
            const v0 = index.array[i];
            const v1 = index.array[i + 1];
            const v2 = index.array[i + 2];

            this.addEdge(edges, v0, v1);
            this.addEdge(edges, v1, v2);
            this.addEdge(edges, v2, v0);
        }

        return edges;
    }

    /**
     * Add edge to map
     */
    private addEdge(
        edges: Map<string, { v0: number; v1: number }>,
        v0: number,
        v1: number
    ): void {
        const key = this.getEdgeKey(v0, v1);
        if (!edges.has(key)) {
            edges.set(key, { v0, v1 });
        }
    }

    /**
     * Get edge key
     */
    private getEdgeKey(v0: number, v1: number): string {
        return v0 < v1 ? `${v0}-${v1}` : `${v1}-${v0}`;
    }

    /**
     * Subdivide face with midpoints
     */
    private subdivideFace(
        indices: number[],
        v0: number,
        v1: number,
        v2: number,
        midpoints: number[]
    ): void {
        const [m01, m12, m20] = midpoints;

        if (m01 !== -1 && m12 !== -1 && m20 !== -1) {
            // All edges subdivided - 4 triangles
            indices.push(v0, m01, m20);
            indices.push(v1, m12, m01);
            indices.push(v2, m20, m12);
            indices.push(m01, m12, m20);
        } else if (m01 !== -1 && m12 === -1 && m20 === -1) {
            // Only edge 0-1 subdivided - 2 triangles
            indices.push(v0, m01, v2);
            indices.push(m01, v1, v2);
        } else if (m01 === -1 && m12 !== -1 && m20 === -1) {
            // Only edge 1-2 subdivided - 2 triangles
            indices.push(v0, v1, m12);
            indices.push(v0, m12, v2);
        } else if (m01 === -1 && m12 === -1 && m20 !== -1) {
            // Only edge 2-0 subdivided - 2 triangles
            indices.push(v0, v1, m20);
            indices.push(v1, v2, m20);
        } else {
            // Mixed subdivision - handle other cases
            indices.push(v0, v1, v2); // Fallback
        }
    }

    /**
     * Get vertex neighbors
     */
    private getVertexNeighbors(geometry: THREE.BufferGeometry, vertexIndex: number): number[] {
        const index = geometry.index!;
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
     * Remesh entire geometry to target detail
     */
    remesh(geometry: THREE.BufferGeometry, _targetDetail: number): THREE.BufferGeometry {
        // Simplified remeshing - in production would use proper remeshing algorithm
        let newGeometry = geometry.clone();

        // Multiple passes of subdivision and collapse
        for (let i = 0; i < 3; i++) {
            const center = new THREE.Vector3();
            geometry.computeBoundingBox();
            if (geometry.boundingBox) {
                geometry.boundingBox.getCenter(center);
            }

            const radius = 1000; // Large radius to affect entire mesh
            newGeometry = this.apply(newGeometry, center, radius);
        }

        return newGeometry;
    }
}
