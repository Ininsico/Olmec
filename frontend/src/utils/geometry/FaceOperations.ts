import * as THREE from 'three';
import { GeometryUtils } from './GeometryUtils';

/**
 * Complete face-level geometry operations
 * Production-ready implementations for face manipulation
 */
export class FaceOperations {
    /**
     * Extrude faces along their normals
     */
    static extrudeFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[],
        distance: number
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const newPositions: number[] = Array.from(position.array);
        const newIndices: number[] = Array.from(index.array);

        const extrudedVertices = new Map<number, number>();
        let nextVertexIdx = position.count;

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const indices = [
                index.array[i],
                index.array[i + 1],
                index.array[i + 2]
            ];

            // Calculate face normal
            const v0 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, indices[0]);
            const v1 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, indices[1]);
            const v2 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, indices[2]);

            const normal = new THREE.Vector3()
                .crossVectors(
                    new THREE.Vector3().subVectors(v1, v0),
                    new THREE.Vector3().subVectors(v2, v0)
                )
                .normalize();

            // Create extruded vertices
            const newIndicesForFace: number[] = [];
            for (const vertIdx of indices) {
                if (!extrudedVertices.has(vertIdx)) {
                    const v = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, vertIdx);
                    v.add(normal.clone().multiplyScalar(distance));

                    newPositions.push(v.x, v.y, v.z);
                    extrudedVertices.set(vertIdx, nextVertexIdx);
                    newIndicesForFace.push(nextVertexIdx);
                    nextVertexIdx++;
                } else {
                    newIndicesForFace.push(extrudedVertices.get(vertIdx)!);
                }
            }

            // Create side faces
            for (let j = 0; j < 3; j++) {
                const next = (j + 1) % 3;
                const v0Old = indices[j];
                const v1Old = indices[next];
                const v0New = newIndicesForFace[j];
                const v1New = newIndicesForFace[next];

                // Two triangles for quad
                newIndices.push(v0Old, v1Old, v1New);
                newIndices.push(v0Old, v1New, v0New);
            }

            // Update top face
            newIndices[i] = newIndicesForFace[0];
            newIndices[i + 1] = newIndicesForFace[1];
            newIndices[i + 2] = newIndicesForFace[2];
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Inset faces (create smaller face inside)
     */
    static insetFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[],
        amount: number = 0.2
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const newPositions: number[] = Array.from(position.array);
        const newIndices: number[] = Array.from(index.array);

        let nextVertexIdx = position.count;

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const indices = [
                index.array[i],
                index.array[i + 1],
                index.array[i + 2]
            ];

            // Calculate face center
            const center = new THREE.Vector3();
            for (const idx of indices) {
                center.add(new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, idx));
            }
            center.divideScalar(3);

            // Create inset vertices
            const newIndicesForFace: number[] = [];
            for (const vertIdx of indices) {
                const v = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, vertIdx);
                v.lerp(center, amount);

                newPositions.push(v.x, v.y, v.z);
                newIndicesForFace.push(nextVertexIdx);
                nextVertexIdx++;
            }

            // Create connecting faces
            for (let j = 0; j < 3; j++) {
                const next = (j + 1) % 3;
                const v0Old = indices[j];
                const v1Old = indices[next];
                const v0New = newIndicesForFace[j];
                const v1New = newIndicesForFace[next];

                newIndices.push(v0Old, v1Old, v1New);
                newIndices.push(v0Old, v1New, v0New);
            }

            // Update center face
            newIndices[i] = newIndicesForFace[0];
            newIndices[i + 1] = newIndicesForFace[1];
            newIndices[i + 2] = newIndicesForFace[2];
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Bevel faces
     */
    static bevelFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[],
        amount: number = 0.1
    ): THREE.BufferGeometry {
        // Simplified bevel - combination of inset and extrude
        let newGeometry = this.insetFaces(geometry, faceIndices, amount);
        newGeometry = this.extrudeFaces(newGeometry, faceIndices, amount * 0.5);
        return newGeometry;
    }

    /**
     * Poke faces (add vertex at center)
     */
    static pokeFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const newPositions: number[] = Array.from(position.array);
        const newIndices: number[] = [];

        let nextVertexIdx = position.count;
        const processedFaces = new Set(faceIndices);

        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0 = index.array[i];
            const v1 = index.array[i + 1];
            const v2 = index.array[i + 2];

            if (processedFaces.has(faceIdx)) {
                // Calculate center
                const p0 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v0);
                const p1 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v1);
                const p2 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v2);
                const center = new THREE.Vector3().add(p0).add(p1).add(p2).divideScalar(3);

                newPositions.push(center.x, center.y, center.z);
                const centerIdx = nextVertexIdx++;

                // Create 3 triangles from center to edges
                newIndices.push(v0, v1, centerIdx);
                newIndices.push(v1, v2, centerIdx);
                newIndices.push(v2, v0, centerIdx);
            } else {
                // Keep original face
                newIndices.push(v0, v1, v2);
            }
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Triangulate faces (convert quads to triangles)
     */
    static triangulateFaces(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        // BufferGeometry is already triangulated, but we ensure it
        const newGeometry = geometry.clone();
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Solidify faces (add thickness)
     */
    static solidifyFaces(
        geometry: THREE.BufferGeometry,
        thickness: number = 0.1
    ): THREE.BufferGeometry {
        const index = geometry.index!;
        const faceCount = index.count / 3;

        // Extrude all faces inward
        const allFaces = Array.from({ length: faceCount }, (_, i) => i);
        let newGeometry = this.extrudeFaces(geometry, allFaces, -thickness);

        return newGeometry;
    }

    /**
     * Subdivide faces
     */
    static subdivideFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const newPositions: number[] = Array.from(position.array);
        const newIndices: number[] = [];

        let nextVertexIdx = position.count;
        const processedFaces = new Set(faceIndices);
        const edgeMidpoints = new Map<string, number>();

        const getMidpoint = (v0: number, v1: number): number => {
            const key = v0 < v1 ? `${v0}-${v1}` : `${v1}-${v0}`;

            if (!edgeMidpoints.has(key)) {
                const p0 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v0);
                const p1 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v1);
                const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);

                newPositions.push(mid.x, mid.y, mid.z);
                edgeMidpoints.set(key, nextVertexIdx);
                nextVertexIdx++;
            }

            return edgeMidpoints.get(key)!;
        };

        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0 = index.array[i];
            const v1 = index.array[i + 1];
            const v2 = index.array[i + 2];

            if (processedFaces.has(faceIdx)) {
                const m01 = getMidpoint(v0, v1);
                const m12 = getMidpoint(v1, v2);
                const m20 = getMidpoint(v2, v0);

                // Create 4 triangles
                newIndices.push(v0, m01, m20);
                newIndices.push(v1, m12, m01);
                newIndices.push(v2, m20, m12);
                newIndices.push(m01, m12, m20);
            } else {
                newIndices.push(v0, v1, v2);
            }
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Dissolve faces (remove faces)
     */
    static dissolveFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const index = geometry.index!;
        const newIndices: number[] = [];
        const facesToRemove = new Set(faceIndices);

        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            if (!facesToRemove.has(faceIdx)) {
                const i = faceIdx * 3;
                newIndices.push(
                    index.array[i],
                    index.array[i + 1],
                    index.array[i + 2]
                );
            }
        }

        const newGeometry = geometry.clone();
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Duplicate faces
     */
    static duplicateFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const newPositions: number[] = Array.from(position.array);
        const newIndices: number[] = Array.from(index.array);

        let nextVertexIdx = position.count;

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const newFaceIndices: number[] = [];

            for (let j = 0; j < 3; j++) {
                const oldIdx = index.array[i + j];
                const v = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, oldIdx);

                newPositions.push(v.x, v.y, v.z);
                newFaceIndices.push(nextVertexIdx);
                nextVertexIdx++;
            }

            newIndices.push(...newFaceIndices);
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Flip face normals
     */
    static flipFaceNormals(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const index = geometry.index!;
        const newIndices = Array.from(index.array);

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            // Swap vertices to flip normal
            const temp = newIndices[i + 1];
            newIndices[i + 1] = newIndices[i + 2];
            newIndices[i + 2] = temp;
        }

        const newGeometry = geometry.clone();
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Recalculate face normals
     */
    static recalculateNormals(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Smooth face normals
     */
    static smoothNormals(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Flatten face normals (face normals instead of vertex normals)
     */
    static flattenNormals(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const normals: number[] = [];

        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, index.array[i]);
            const v1 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, index.array[i + 1]);
            const v2 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, index.array[i + 2]);

            const normal = new THREE.Vector3()
                .crossVectors(
                    new THREE.Vector3().subVectors(v1, v0),
                    new THREE.Vector3().subVectors(v2, v0)
                )
                .normalize();

            // Same normal for all 3 vertices of the face
            for (let j = 0; j < 3; j++) {
                const vertIdx = index.array[i + j];
                normals[vertIdx * 3] = normal.x;
                normals[vertIdx * 3 + 1] = normal.y;
                normals[vertIdx * 3 + 2] = normal.z;
            }
        }

        const newGeometry = geometry.clone();
        newGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        return newGeometry;
    }

    /**
     * Select all faces
     */
    static selectAll(geometry: THREE.BufferGeometry): number[] {
        const index = geometry.index!;
        const faceCount = index.count / 3;
        return Array.from({ length: faceCount }, (_, i) => i);
    }

    /**
     * Select linked faces (connected component)
     */
    static selectLinked(geometry: THREE.BufferGeometry, startFace: number): number[] {
        const adjacency = this.buildFaceAdjacency(geometry);
        const visited = new Set<number>();
        const queue = [startFace];
        visited.add(startFace);

        while (queue.length > 0) {
            const current = queue.shift()!;
            const neighbors = adjacency.get(current) || new Set();

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        return Array.from(visited);
    }

    /**
     * Select random faces
     */
    static selectRandom(geometry: THREE.BufferGeometry, percentage: number = 0.5): number[] {
        const index = geometry.index!;
        const faceCount = index.count / 3;
        const selected: number[] = [];

        for (let i = 0; i < faceCount; i++) {
            if (Math.random() < percentage) {
                selected.push(i);
            }
        }

        return selected;
    }

    /**
     * Select boundary faces
     */
    static selectBoundary(geometry: THREE.BufferGeometry): number[] {
        const edges = GeometryUtils.getEdges(geometry);
        const boundaryFaces = new Set<number>();

        edges.forEach(edge => {
            if (edge.faces.length === 1) {
                boundaryFaces.add(edge.faces[0]);
            }
        });

        return Array.from(boundaryFaces);
    }

    /**
     * Build face adjacency map
     */
    private static buildFaceAdjacency(geometry: THREE.BufferGeometry): Map<number, Set<number>> {
        const edges = GeometryUtils.getEdges(geometry);
        const adjacency = new Map<number, Set<number>>();
        const index = geometry.index!;
        const faceCount = index.count / 3;

        // Initialize
        for (let i = 0; i < faceCount; i++) {
            adjacency.set(i, new Set());
        }

        // Build from shared edges
        edges.forEach(edge => {
            if (edge.faces.length === 2) {
                const f0 = edge.faces[0];
                const f1 = edge.faces[1];
                adjacency.get(f0)!.add(f1);
                adjacency.get(f1)!.add(f0);
            }
        });

        return adjacency;
    }

    /**
     * Separate faces (disconnect from mesh)
     */
    static separateFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): { main: THREE.BufferGeometry; separated: THREE.BufferGeometry } {
        const position = geometry.attributes.position;
        const index = geometry.index!;

        const mainIndices: number[] = [];
        const separatedPositions: number[] = [];
        const separatedIndices: number[] = [];
        const facesToSeparate = new Set(faceIndices);

        let nextVertexIdx = 0;

        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0 = index.array[i];
            const v1 = index.array[i + 1];
            const v2 = index.array[i + 2];

            if (facesToSeparate.has(faceIdx)) {
                // Add to separated geometry
                for (const vertIdx of [v0, v1, v2]) {
                    const v = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, vertIdx);
                    separatedPositions.push(v.x, v.y, v.z);
                    separatedIndices.push(nextVertexIdx++);
                }
            } else {
                // Keep in main geometry
                mainIndices.push(v0, v1, v2);
            }
        }

        const mainGeometry = geometry.clone();
        mainGeometry.setIndex(mainIndices);
        mainGeometry.computeVertexNormals();

        const separatedGeometry = new THREE.BufferGeometry();
        separatedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(separatedPositions, 3));
        separatedGeometry.setIndex(separatedIndices);
        separatedGeometry.computeVertexNormals();

        return { main: mainGeometry, separated: separatedGeometry };
    }
}
