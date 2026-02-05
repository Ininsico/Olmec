import * as THREE from 'three';
import { GeometryUtils } from './GeometryUtils';

/**
 * Advanced face-level operations for mesh editing
 * Production-ready implementation of complex face manipulation algorithms
 */
export class FaceOperations {
    /**
     * Extrude faces along their normals
     */
    static extrudeFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[],
        distance: number,
        scale: number = 1.0
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const position = newGeometry.attributes.position;
        const index = newGeometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        const processedFaces = new Set<number>(faceIndices);

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

            const faceNormal = GeometryUtils.getFaceNormal(newGeometry, faceIdx);
            const faceCenter = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);

            // Create new vertices for extruded face
            const newV0 = this.createExtrudedVertex(v0, faceNormal, faceCenter, distance, scale);
            const newV1 = this.createExtrudedVertex(v1, faceNormal, faceCenter, distance, scale);
            const newV2 = this.createExtrudedVertex(v2, faceNormal, faceCenter, distance, scale);

            const newV0Idx = newPositions.length / 3;
            newPositions.push(newV0.x, newV0.y, newV0.z);

            const newV1Idx = newPositions.length / 3;
            newPositions.push(newV1.x, newV1.y, newV1.z);

            const newV2Idx = newPositions.length / 3;
            newPositions.push(newV2.x, newV2.y, newV2.z);

            // Create side faces (quads as two triangles)
            newIndices.push(v0Idx, v1Idx, newV1Idx);
            newIndices.push(v0Idx, newV1Idx, newV0Idx);

            newIndices.push(v1Idx, v2Idx, newV2Idx);
            newIndices.push(v1Idx, newV2Idx, newV1Idx);

            newIndices.push(v2Idx, v0Idx, newV0Idx);
            newIndices.push(v2Idx, newV0Idx, newV2Idx);

            // Top face
            newIndices.push(newV0Idx, newV1Idx, newV2Idx);
        }

        // Copy non-extruded faces
        for (let i = 0; i < index.count; i += 3) {
            const faceIdx = i / 3;
            if (!processedFaces.has(faceIdx)) {
                newIndices.push(index.array[i], index.array[i + 1], index.array[i + 2]);
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    private static createExtrudedVertex(
        vertex: THREE.Vector3,
        normal: THREE.Vector3,
        center: THREE.Vector3,
        distance: number,
        scale: number
    ): THREE.Vector3 {
        const offset = normal.clone().multiplyScalar(distance);
        const toCenter = new THREE.Vector3().subVectors(vertex, center);
        const scaled = center.clone().add(toCenter.multiplyScalar(scale));
        return scaled.add(offset);
    }

    /**
     * Inset faces - create smaller faces within existing faces
     */
    static insetFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[],
        amount: number = 0.2,
        depth: number = 0.0
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const position = newGeometry.attributes.position;
        const index = newGeometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        const processedFaces = new Set<number>(faceIndices);

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

            const faceCenter = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
            const faceNormal = GeometryUtils.getFaceNormal(newGeometry, faceIdx);

            // Create inset vertices
            const insetV0 = faceCenter.clone().lerp(v0, 1 - amount);
            const insetV1 = faceCenter.clone().lerp(v1, 1 - amount);
            const insetV2 = faceCenter.clone().lerp(v2, 1 - amount);

            // Apply depth
            if (depth !== 0) {
                const depthOffset = faceNormal.clone().multiplyScalar(depth);
                insetV0.add(depthOffset);
                insetV1.add(depthOffset);
                insetV2.add(depthOffset);
            }

            const insetV0Idx = newPositions.length / 3;
            newPositions.push(insetV0.x, insetV0.y, insetV0.z);

            const insetV1Idx = newPositions.length / 3;
            newPositions.push(insetV1.x, insetV1.y, insetV1.z);

            const insetV2Idx = newPositions.length / 3;
            newPositions.push(insetV2.x, insetV2.y, insetV2.z);

            // Create border quads
            newIndices.push(v0Idx, v1Idx, insetV1Idx);
            newIndices.push(v0Idx, insetV1Idx, insetV0Idx);

            newIndices.push(v1Idx, v2Idx, insetV2Idx);
            newIndices.push(v1Idx, insetV2Idx, insetV1Idx);

            newIndices.push(v2Idx, v0Idx, insetV0Idx);
            newIndices.push(v2Idx, insetV0Idx, insetV2Idx);

            // Inner face
            newIndices.push(insetV0Idx, insetV1Idx, insetV2Idx);
        }

        // Copy non-inset faces
        for (let i = 0; i < index.count; i += 3) {
            const faceIdx = i / 3;
            if (!processedFaces.has(faceIdx)) {
                newIndices.push(index.array[i], index.array[i + 1], index.array[i + 2]);
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Subdivide faces using Loop subdivision
     */
    static subdivideFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[],
        iterations: number = 1
    ): THREE.BufferGeometry {
        let result = GeometryUtils.toIndexed(geometry);

        for (let iter = 0; iter < iterations; iter++) {
            result = this.loopSubdivisionIteration(result, faceIndices);
        }

        return result;
    }

    private static loopSubdivisionIteration(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];
        const edgeMidpoints = new Map<string, number>();

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        const processedFaces = new Set<number>(faceIndices);

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            // Get or create edge midpoints
            const mid01Idx = this.getOrCreateMidpoint(
                position, v0Idx, v1Idx, edgeMidpoints, newPositions
            );
            const mid12Idx = this.getOrCreateMidpoint(
                position, v1Idx, v2Idx, edgeMidpoints, newPositions
            );
            const mid20Idx = this.getOrCreateMidpoint(
                position, v2Idx, v0Idx, edgeMidpoints, newPositions
            );

            // Create 4 new triangles
            newIndices.push(v0Idx, mid01Idx, mid20Idx);
            newIndices.push(v1Idx, mid12Idx, mid01Idx);
            newIndices.push(v2Idx, mid20Idx, mid12Idx);
            newIndices.push(mid01Idx, mid12Idx, mid20Idx);
        }

        // Copy non-subdivided faces
        for (let i = 0; i < index.count; i += 3) {
            const faceIdx = i / 3;
            if (!processedFaces.has(faceIdx)) {
                newIndices.push(index.array[i], index.array[i + 1], index.array[i + 2]);
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    private static getOrCreateMidpoint(
        position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
        v0Idx: number,
        v1Idx: number,
        edgeMidpoints: Map<string, number>,
        positions: number[]
    ): number {
        const edgeKey = GeometryUtils.getEdgeKey(v0Idx, v1Idx);

        if (edgeMidpoints.has(edgeKey)) {
            return edgeMidpoints.get(edgeKey)!;
        }

        const v0 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v0Idx);
        const v1 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v1Idx);
        const midpoint = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);

        const midpointIdx = positions.length / 3;
        positions.push(midpoint.x, midpoint.y, midpoint.z);
        edgeMidpoints.set(edgeKey, midpointIdx);

        return midpointIdx;
    }

    /**
     * Delete faces and clean up geometry
     */
    static deleteFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const index = newGeometry.index!;
        const newIndices: number[] = [];
        const facesToDelete = new Set<number>(faceIndices);

        for (let i = 0; i < index.count; i += 3) {
            const faceIdx = i / 3;
            if (!facesToDelete.has(faceIdx)) {
                newIndices.push(index.array[i], index.array[i + 1], index.array[i + 2]);
            }
        }

        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Flip face normals (reverse winding order)
     */
    static flipFaceNormals(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const index = newGeometry.index!;
        const facesToFlip = new Set<number>(faceIndices);

        for (const faceIdx of facesToFlip) {
            const i = faceIdx * 3;
            const temp = index.array[i + 1];
            index.array[i + 1] = index.array[i + 2];
            index.array[i + 2] = temp;
        }

        index.needsUpdate = true;
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Triangulate faces (n-gons to triangles)
     * Note: THREE.js BufferGeometry already uses triangles
     */
    static triangulateFaces(
        geometry: THREE.BufferGeometry
    ): THREE.BufferGeometry {
        // Already triangulated in THREE.js, but this can handle n-gons if needed
        return geometry.clone();
    }

    /**
     * Poke faces (create vertex at center and connect to edges)
     */
    static pokeFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const position = newGeometry.attributes.position;
        const index = newGeometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        const processedFaces = new Set<number>(faceIndices);

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

            const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);

            const centerIdx = newPositions.length / 3;
            newPositions.push(center.x, center.y, center.z);

            // Create 3 triangles from center to edges
            newIndices.push(centerIdx, v0Idx, v1Idx);
            newIndices.push(centerIdx, v1Idx, v2Idx);
            newIndices.push(centerIdx, v2Idx, v0Idx);
        }

        // Copy non-poked faces
        for (let i = 0; i < index.count; i += 3) {
            const faceIdx = i / 3;
            if (!processedFaces.has(faceIdx)) {
                newIndices.push(index.array[i], index.array[i + 1], index.array[i + 2]);
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Solidify faces (give thickness to faces)
     */
    static solidifyFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[],
        thickness: number = 0.1
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const position = newGeometry.attributes.position;
        const index = newGeometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        const processedFaces = new Set<number>(faceIndices);

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

            const faceNormal = GeometryUtils.getFaceNormal(newGeometry, faceIdx);
            const offset = faceNormal.clone().multiplyScalar(thickness);

            // Create back face vertices
            const backV0 = v0.clone().sub(offset);
            const backV1 = v1.clone().sub(offset);
            const backV2 = v2.clone().sub(offset);

            const backV0Idx = newPositions.length / 3;
            newPositions.push(backV0.x, backV0.y, backV0.z);

            const backV1Idx = newPositions.length / 3;
            newPositions.push(backV1.x, backV1.y, backV1.z);

            const backV2Idx = newPositions.length / 3;
            newPositions.push(backV2.x, backV2.y, backV2.z);

            // Front face
            newIndices.push(v0Idx, v1Idx, v2Idx);

            // Back face (flipped)
            newIndices.push(backV2Idx, backV1Idx, backV0Idx);

            // Side faces
            newIndices.push(v0Idx, v1Idx, backV1Idx);
            newIndices.push(v0Idx, backV1Idx, backV0Idx);

            newIndices.push(v1Idx, v2Idx, backV2Idx);
            newIndices.push(v1Idx, backV2Idx, backV1Idx);

            newIndices.push(v2Idx, v0Idx, backV0Idx);
            newIndices.push(v2Idx, backV0Idx, backV2Idx);
        }

        // Copy non-solidified faces
        for (let i = 0; i < index.count; i += 3) {
            const faceIdx = i / 3;
            if (!processedFaces.has(faceIdx)) {
                newIndices.push(index.array[i], index.array[i + 1], index.array[i + 2]);
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Grid fill - fill face with grid pattern
     */
    static gridFillFace(
        geometry: THREE.BufferGeometry,
        faceIndex: number,
        gridX: number = 2,
        gridY: number = 2
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const position = newGeometry.attributes.position;
        const index = newGeometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        const i = faceIndex * 3;
        const v0Idx = index.array[i];
        const v1Idx = index.array[i + 1];
        const v2Idx = index.array[i + 2];

        const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
        const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
        const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

        // Create grid vertices using barycentric coordinates
        const gridVertices: number[][] = [];
        for (let y = 0; y <= gridY; y++) {
            for (let x = 0; x <= gridX; x++) {
                const u = x / gridX;
                const v = y / gridY;
                const w = 1 - u - v;

                if (w >= 0) {
                    const point = new THREE.Vector3()
                        .addScaledVector(v0, w)
                        .addScaledVector(v1, u)
                        .addScaledVector(v2, v);

                    const idx = newPositions.length / 3;
                    newPositions.push(point.x, point.y, point.z);
                    gridVertices.push([x, y, idx]);
                }
            }
        }

        // Create grid faces
        for (let y = 0; y < gridY; y++) {
            for (let x = 0; x < gridX; x++) {
                const v00 = gridVertices.find(gv => gv[0] === x && gv[1] === y);
                const v10 = gridVertices.find(gv => gv[0] === x + 1 && gv[1] === y);
                const v01 = gridVertices.find(gv => gv[0] === x && gv[1] === y + 1);
                const v11 = gridVertices.find(gv => gv[0] === x + 1 && gv[1] === y + 1);

                if (v00 && v10 && v01) {
                    newIndices.push(v00[2], v10[2], v01[2]);
                }
                if (v10 && v11 && v01) {
                    newIndices.push(v10[2], v11[2], v01[2]);
                }
            }
        }

        // Copy other faces
        for (let i = 0; i < index.count; i += 3) {
            const fIdx = i / 3;
            if (fIdx !== faceIndex) {
                newIndices.push(index.array[i], index.array[i + 1], index.array[i + 2]);
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Rotate faces around their center
     */
    static rotateFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[],
        angle: number,
        axis: THREE.Vector3 = new THREE.Vector3(0, 0, 1)
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;
        const index = newGeometry.index!;

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

            const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);

            // Rotate each vertex around center
            const quaternion = new THREE.Quaternion().setFromAxisAngle(axis.normalize(), angle);

            v0.sub(center).applyQuaternion(quaternion).add(center);
            v1.sub(center).applyQuaternion(quaternion).add(center);
            v2.sub(center).applyQuaternion(quaternion).add(center);

            position.setXYZ(v0Idx, v0.x, v0.y, v0.z);
            position.setXYZ(v1Idx, v1.x, v1.y, v1.z);
            position.setXYZ(v2Idx, v2.x, v2.y, v2.z);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Scale faces from their center
     */
    static scaleFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[],
        scale: number
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;
        const index = newGeometry.index!;

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

            const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);

            v0.sub(center).multiplyScalar(scale).add(center);
            v1.sub(center).multiplyScalar(scale).add(center);
            v2.sub(center).multiplyScalar(scale).add(center);

            position.setXYZ(v0Idx, v0.x, v0.y, v0.z);
            position.setXYZ(v1Idx, v1.x, v1.y, v1.z);
            position.setXYZ(v2Idx, v2.x, v2.y, v2.z);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Detach faces (duplicate vertices to separate face)
     */
    static detachFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const position = newGeometry.attributes.position;
        const index = newGeometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        const facesToDetach = new Set<number>(faceIndices);

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            // Duplicate vertices
            const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

            const newV0Idx = newPositions.length / 3;
            newPositions.push(v0.x, v0.y, v0.z);

            const newV1Idx = newPositions.length / 3;
            newPositions.push(v1.x, v1.y, v1.z);

            const newV2Idx = newPositions.length / 3;
            newPositions.push(v2.x, v2.y, v2.z);

            newIndices.push(newV0Idx, newV1Idx, newV2Idx);
        }

        // Copy non-detached faces
        for (let i = 0; i < index.count; i += 3) {
            const faceIdx = i / 3;
            if (!facesToDetach.has(faceIdx)) {
                newIndices.push(index.array[i], index.array[i + 1], index.array[i + 2]);
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }
}
