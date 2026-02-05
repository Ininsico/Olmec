import * as THREE from 'three';
import { GeometryUtils } from './GeometryUtils';

/**
 * Advanced subdivision surface algorithms
 * Multiple subdivision schemes for different use cases
 */
export class SubdivisionAlgorithms {
    /**
     * Doo-Sabin subdivision
     * Best for quad-dominant meshes
     */
    static dooSabinSubdivision(
        geometry: THREE.BufferGeometry,
        iterations: number = 1
    ): THREE.BufferGeometry {
        let result = GeometryUtils.toIndexed(geometry);

        for (let iter = 0; iter < iterations; iter++) {
            result = this.dooSabinIteration(result);
        }

        return result;
    }

    private static dooSabinIteration(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        const facePoints = new Map<number, number[]>();

        // For each face, create new face point and edge points
        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const vIndices = [
                index.array[i],
                index.array[i + 1],
                index.array[i + 2]
            ];

            const vertices = vIndices.map(idx =>
                new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, idx)
            );

            // Calculate face center
            const faceCenter = new THREE.Vector3();
            vertices.forEach(v => faceCenter.add(v));
            faceCenter.divideScalar(vertices.length);

            const newFacePoints: number[] = [];

            // Create new vertices for each vertex in the face
            for (let j = 0; j < vertices.length; j++) {
                const v = vertices[j];
                const vNext = vertices[(j + 1) % vertices.length];
                const edgeMid = new THREE.Vector3().addVectors(v, vNext).multiplyScalar(0.5);

                // Doo-Sabin formula: (F + 2E + V) / 4
                const newPoint = new THREE.Vector3()
                    .addScaledVector(faceCenter, 1)
                    .addScaledVector(edgeMid, 2)
                    .addScaledVector(v, 1)
                    .divideScalar(4);

                const idx = newPositions.length / 3;
                newPositions.push(newPoint.x, newPoint.y, newPoint.z);
                newFacePoints.push(idx);
            }

            facePoints.set(faceIdx, newFacePoints);

            // Create new face from face points
            if (newFacePoints.length === 3) {
                newIndices.push(
                    newFacePoints[0],
                    newFacePoints[1],
                    newFacePoints[2]
                );
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Butterfly subdivision
     * Interpolating subdivision scheme
     */
    static butterflySubdivision(
        geometry: THREE.BufferGeometry,
        iterations: number = 1
    ): THREE.BufferGeometry {
        let result = GeometryUtils.toIndexed(geometry);

        for (let iter = 0; iter < iterations; iter++) {
            result = this.butterflyIteration(result);
        }

        return result;
    }

    private static butterflyIteration(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const edges = GeometryUtils.getEdges(geometry);
        const newPositions: number[] = [];
        const newIndices: number[] = [];
        const edgeMidpoints = new Map<string, number>();

        // Copy existing vertices
        for (let i = 0; i < position.count; i++) {
            newPositions.push(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
            );
        }

        // Create edge midpoints using butterfly stencil
        edges.forEach((edge, edgeKey) => {
            const v0 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, edge.v0);
            const v1 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, edge.v1);

            // Butterfly weights: 8/16 for edge vertices, 2/16 for adjacent, -1/16 for opposite
            const midpoint = new THREE.Vector3()
                .addScaledVector(v0, 0.5)
                .addScaledVector(v1, 0.5);

            // If we have adjacent faces, use butterfly stencil
            if (edge.faces.length === 2) {
                // Get adjacent vertices
                const neighbors0 = GeometryUtils.getVertexNeighbors(geometry, edge.v0);
                const neighbors1 = GeometryUtils.getVertexNeighbors(geometry, edge.v1);

                const adjacent = neighbors0.filter(n =>
                    n !== edge.v1 && neighbors1.includes(n)
                );

                if (adjacent.length > 0) {
                    for (const adjIdx of adjacent) {
                        const adjVertex = new THREE.Vector3()
                            .fromBufferAttribute(position as THREE.BufferAttribute, adjIdx);
                        midpoint.addScaledVector(adjVertex, 1 / 8);
                    }
                }
            }

            const midIdx = newPositions.length / 3;
            newPositions.push(midpoint.x, midpoint.y, midpoint.z);
            edgeMidpoints.set(edgeKey, midIdx);
        });

        // Create new triangles
        for (let i = 0; i < index.count; i += 3) {
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const mid01Idx = edgeMidpoints.get(GeometryUtils.getEdgeKey(v0Idx, v1Idx))!;
            const mid12Idx = edgeMidpoints.get(GeometryUtils.getEdgeKey(v1Idx, v2Idx))!;
            const mid20Idx = edgeMidpoints.get(GeometryUtils.getEdgeKey(v2Idx, v0Idx))!;

            // Create 4 new triangles
            newIndices.push(v0Idx, mid01Idx, mid20Idx);
            newIndices.push(v1Idx, mid12Idx, mid01Idx);
            newIndices.push(v2Idx, mid20Idx, mid12Idx);
            newIndices.push(mid01Idx, mid12Idx, mid20Idx);
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * √3 subdivision
     * Creates more uniform triangles
     */
    static sqrt3Subdivision(
        geometry: THREE.BufferGeometry,
        iterations: number = 1
    ): THREE.BufferGeometry {
        let result = GeometryUtils.toIndexed(geometry);

        for (let iter = 0; iter < iterations; iter++) {
            result = this.sqrt3Iteration(result);
        }

        return result;
    }

    private static sqrt3Iteration(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy and relax existing vertices
        for (let i = 0; i < position.count; i++) {
            const v = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, i);
            const neighbors = GeometryUtils.getVertexNeighbors(geometry, i);
            const n = neighbors.length;

            if (n > 0) {
                const alpha = (4 - 2 * Math.cos(2 * Math.PI / n)) / 9;
                const avgNeighbor = new THREE.Vector3();

                for (const neighborIdx of neighbors) {
                    avgNeighbor.add(
                        new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, neighborIdx)
                    );
                }
                avgNeighbor.divideScalar(n);

                const relaxed = v.clone()
                    .multiplyScalar(1 - alpha)
                    .addScaledVector(avgNeighbor, alpha);

                newPositions.push(relaxed.x, relaxed.y, relaxed.z);
            } else {
                newPositions.push(v.x, v.y, v.z);
            }
        }

        const faceCenters = new Map<number, number>();

        // Add face centers
        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const v0 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, v2Idx);

            const center = new THREE.Vector3()
                .add(v0).add(v1).add(v2)
                .divideScalar(3);

            const centerIdx = newPositions.length / 3;
            newPositions.push(center.x, center.y, center.z);
            faceCenters.set(faceIdx, centerIdx);
        }

        // Create new triangles
        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];
            const centerIdx = faceCenters.get(faceIdx)!;

            // Connect each edge to the center
            newIndices.push(centerIdx, v0Idx, v1Idx);
            newIndices.push(centerIdx, v1Idx, v2Idx);
            newIndices.push(centerIdx, v2Idx, v0Idx);
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Adaptive subdivision based on curvature
     * Only subdivides areas with high curvature
     */
    static adaptiveSubdivision(
        geometry: THREE.BufferGeometry,
        curvatureThreshold: number = 0.3,
        maxIterations: number = 3
    ): THREE.BufferGeometry {
        let result = GeometryUtils.toIndexed(geometry);

        for (let iter = 0; iter < maxIterations; iter++) {
            const curvature = GeometryUtils.computeCurvature(result);
            const facesToSubdivide: number[] = [];

            const index = result.index!;
            for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
                const i = faceIdx * 3;
                const v0Idx = index.array[i];
                const v1Idx = index.array[i + 1];
                const v2Idx = index.array[i + 2];

                const avgCurvature = (curvature[v0Idx] + curvature[v1Idx] + curvature[v2Idx]) / 3;

                if (avgCurvature > curvatureThreshold) {
                    facesToSubdivide.push(faceIdx);
                }
            }

            if (facesToSubdivide.length === 0) break;

            // Subdivide high-curvature faces
            result = this.subdivideSelectedFaces(result, facesToSubdivide);
        }

        return result;
    }

    private static subdivideSelectedFaces(
        geometry: THREE.BufferGeometry,
        faceIndices: number[]
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        const subdivided = new Set<number>(faceIndices);
        const edgeMidpoints = new Map<string, number>();

        for (const faceIdx of faceIndices) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            // Get or create edge midpoints
            const getMidpoint = (vA: number, vB: number) => {
                const key = GeometryUtils.getEdgeKey(vA, vB);
                if (edgeMidpoints.has(key)) {
                    return edgeMidpoints.get(key)!;
                }

                const pA = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, vA);
                const pB = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, vB);
                const mid = pA.clone().add(pB).multiplyScalar(0.5);

                const idx = newPositions.length / 3;
                newPositions.push(mid.x, mid.y, mid.z);
                edgeMidpoints.set(key, idx);
                return idx;
            };

            const mid01 = getMidpoint(v0Idx, v1Idx);
            const mid12 = getMidpoint(v1Idx, v2Idx);
            const mid20 = getMidpoint(v2Idx, v0Idx);

            // Create 4 new triangles
            newIndices.push(v0Idx, mid01, mid20);
            newIndices.push(v1Idx, mid12, mid01);
            newIndices.push(v2Idx, mid20, mid12);
            newIndices.push(mid01, mid12, mid20);
        }

        // Copy non-subdivided faces
        for (let i = 0; i < index.count; i += 3) {
            const faceIdx = i / 3;
            if (!subdivided.has(faceIdx)) {
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
     * Mid-edge subdivision
     * Simple edge midpoint subdivision
     */
    static midEdgeSubdivision(
        geometry: THREE.BufferGeometry,
        iterations: number = 1
    ): THREE.BufferGeometry {
        let result = GeometryUtils.toIndexed(geometry);

        for (let iter = 0; iter < iterations; iter++) {
            const position = result.attributes.position;
            const index = result.index!;
            const newPositions: number[] = [];
            const newIndices: number[] = [];
            const edgeMidpoints = new Map<string, number>();

            // Copy existing vertices
            for (let i = 0; i < position.count; i++) {
                newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
            }

            const edges = GeometryUtils.getEdges(result);

            // Create edge midpoints
            edges.forEach((edge, edgeKey) => {
                const v0 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, edge.v0);
                const v1 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, edge.v1);
                const mid = v0.clone().add(v1).multiplyScalar(0.5);

                const midIdx = newPositions.length / 3;
                newPositions.push(mid.x, mid.y, mid.z);
                edgeMidpoints.set(edgeKey, midIdx);
            });

            // Create new triangles
            for (let i = 0; i < index.count; i += 3) {
                const v0Idx = index.array[i];
                const v1Idx = index.array[i + 1];
                const v2Idx = index.array[i + 2];

                const mid01 = edgeMidpoints.get(GeometryUtils.getEdgeKey(v0Idx, v1Idx))!;
                const mid12 = edgeMidpoints.get(GeometryUtils.getEdgeKey(v1Idx, v2Idx))!;
                const mid20 = edgeMidpoints.get(GeometryUtils.getEdgeKey(v2Idx, v0Idx))!;

                newIndices.push(v0Idx, mid01, mid20);
                newIndices.push(v1Idx, mid12, mid01);
                newIndices.push(v2Idx, mid20, mid12);
                newIndices.push(mid01, mid12, mid20);
            }

            result = new THREE.BufferGeometry();
            result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
            result.setIndex(newIndices);
            result.computeVertexNormals();
        }

        return result;
    }
}
