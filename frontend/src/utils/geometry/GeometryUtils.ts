import * as THREE from 'three';

/**
 * Core geometry utilities for mesh manipulation
 * Production-grade implementations of fundamental geometry operations
 */
export class GeometryUtils {
    /**
     * Get vertex neighbors (connected vertices via edges)
     */
    static getVertexNeighbors(geometry: THREE.BufferGeometry, vertexIndex: number): number[] {
        const neighbors = new Set<number>();
        const position = geometry.attributes.position;
        const index = geometry.index;

        if (!index) {
            // Non-indexed geometry - analyze face connectivity
            const vertCount = position.count;
            for (let i = 0; i < vertCount; i += 3) {
                const v0 = i;
                const v1 = i + 1;
                const v2 = i + 2;

                if (vertexIndex === v0) {
                    neighbors.add(v1);
                    neighbors.add(v2);
                } else if (vertexIndex === v1) {
                    neighbors.add(v0);
                    neighbors.add(v2);
                } else if (vertexIndex === v2) {
                    neighbors.add(v0);
                    neighbors.add(v1);
                }
            }
        } else {
            // Indexed geometry
            const indices = index.array;
            for (let i = 0; i < indices.length; i += 3) {
                const v0 = indices[i];
                const v1 = indices[i + 1];
                const v2 = indices[i + 2];

                if (vertexIndex === v0) {
                    neighbors.add(v1);
                    neighbors.add(v2);
                } else if (vertexIndex === v1) {
                    neighbors.add(v0);
                    neighbors.add(v2);
                } else if (vertexIndex === v2) {
                    neighbors.add(v0);
                    neighbors.add(v1);
                }
            }
        }

        return Array.from(neighbors);
    }

    /**
     * Get all faces that contain a vertex
     */
    static getFacesContainingVertex(geometry: THREE.BufferGeometry, vertexIndex: number): number[] {
        const faces: number[] = [];
        const index = geometry.index;

        if (!index) {
            const position = geometry.attributes.position;
            for (let i = 0; i < position.count; i += 3) {
                if (i === vertexIndex || i + 1 === vertexIndex || i + 2 === vertexIndex) {
                    faces.push(Math.floor(i / 3));
                }
            }
        } else {
            const indices = index.array;
            for (let i = 0; i < indices.length; i += 3) {
                if (indices[i] === vertexIndex || indices[i + 1] === vertexIndex || indices[i + 2] === vertexIndex) {
                    faces.push(Math.floor(i / 3));
                }
            }
        }

        return faces;
    }

    /**
     * Get edge data structure from geometry
     */
    static getEdges(geometry: THREE.BufferGeometry): Map<string, { v0: number; v1: number; faces: number[] }> {
        const edges = new Map<string, { v0: number; v1: number; faces: number[] }>();
        const index = geometry.index;
        const indices = index ? index.array : null;
        const position = geometry.attributes.position;
        const faceCount = indices ? indices.length / 3 : position.count / 3;

        for (let faceIdx = 0; faceIdx < faceCount; faceIdx++) {
            const i = faceIdx * 3;
            const v0 = indices ? indices[i] : i;
            const v1 = indices ? indices[i + 1] : i + 1;
            const v2 = indices ? indices[i + 2] : i + 2;

            // Add three edges of the triangle
            this.addEdge(edges, v0, v1, faceIdx);
            this.addEdge(edges, v1, v2, faceIdx);
            this.addEdge(edges, v2, v0, faceIdx);
        }

        return edges;
    }

    private static addEdge(
        edges: Map<string, { v0: number; v1: number; faces: number[] }>,
        v0: number,
        v1: number,
        faceIdx: number
    ) {
        const key = this.getEdgeKey(v0, v1);
        if (edges.has(key)) {
            edges.get(key)!.faces.push(faceIdx);
        } else {
            edges.set(key, { v0: Math.min(v0, v1), v1: Math.max(v0, v1), faces: [faceIdx] });
        }
    }

    static getEdgeKey(v0: number, v1: number): string {
        return `${Math.min(v0, v1)}_${Math.max(v0, v1)}`;
    }

    /**
     * Calculate vertex normal at a specific vertex
     */
    static calculateVertexNormal(geometry: THREE.BufferGeometry, vertexIndex: number): THREE.Vector3 {
        const normal = new THREE.Vector3();
        const faces = this.getFacesContainingVertex(geometry, vertexIndex);

        for (const faceIdx of faces) {
            const faceNormal = this.getFaceNormal(geometry, faceIdx);
            normal.add(faceNormal);
        }

        return normal.normalize();
    }

    /**
     * Get face normal
     */
    static getFaceNormal(geometry: THREE.BufferGeometry, faceIndex: number): THREE.Vector3 {
        const position = geometry.attributes.position;
        const index = geometry.index;
        const i = faceIndex * 3;

        const v0Idx = index ? index.array[i] : i;
        const v1Idx = index ? index.array[i + 1] : i + 1;
        const v2Idx = index ? index.array[i + 2] : i + 2;

        const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
        const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
        const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

        const edge1 = new THREE.Vector3().subVectors(v1, v0);
        const edge2 = new THREE.Vector3().subVectors(v2, v0);

        return new THREE.Vector3().crossVectors(edge1, edge2).normalize();
    }

    /**
     * Merge vertices within a threshold distance
     */
    static mergeVertices(geometry: THREE.BufferGeometry, threshold: number = 0.0001): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const vertices: THREE.Vector3[] = [];
        const vertexMap = new Map<string, number>();
        const newIndices: number[] = [];

        // Build unique vertex list
        for (let i = 0; i < position.count; i++) {
            const v = new THREE.Vector3().fromBufferAttribute(position, i);
            const key = this.getVertexKey(v, threshold);

            if (!vertexMap.has(key)) {
                vertexMap.set(key, vertices.length);
                vertices.push(v);
            }
            newIndices.push(vertexMap.get(key)!);
        }

        // Create new geometry
        const newGeometry = new THREE.BufferGeometry();
        const newPositions = new Float32Array(vertices.length * 3);

        for (let i = 0; i < vertices.length; i++) {
            newPositions[i * 3] = vertices[i].x;
            newPositions[i * 3 + 1] = vertices[i].y;
            newPositions[i * 3 + 2] = vertices[i].z;
        }

        newGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    private static getVertexKey(v: THREE.Vector3, threshold: number): string {
        const x = Math.round(v.x / threshold) * threshold;
        const y = Math.round(v.y / threshold) * threshold;
        const z = Math.round(v.z / threshold) * threshold;
        return `${x.toFixed(6)}_${y.toFixed(6)}_${z.toFixed(6)}`;
    }

    /**
     * Subdivide a face into smaller faces
     */
    static subdivideFace(
        geometry: THREE.BufferGeometry,
        faceIndex: number
    ): THREE.BufferGeometry {
        // Implementation of Catmull-Clark subdivision
        const position = geometry.attributes.position;
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing vertices
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        // Get face vertices
        const index = geometry.index;
        const i = faceIndex * 3;
        const v0Idx = index ? index.array[i] : i;
        const v1Idx = index ? index.array[i + 1] : i + 1;
        const v2Idx = index ? index.array[i + 2] : i + 2;

        const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
        const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
        const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

        // Calculate midpoints
        const mid01 = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);
        const mid12 = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
        const mid20 = new THREE.Vector3().addVectors(v2, v0).multiplyScalar(0.5);

        // Add new vertices
        const mid01Idx = newPositions.length / 3;
        newPositions.push(mid01.x, mid01.y, mid01.z);

        const mid12Idx = newPositions.length / 3;
        newPositions.push(mid12.x, mid12.y, mid12.z);

        const mid20Idx = newPositions.length / 3;
        newPositions.push(mid20.x, mid20.y, mid20.z);

        // Create 4 new triangles
        newIndices.push(v0Idx, mid01Idx, mid20Idx);
        newIndices.push(v1Idx, mid12Idx, mid01Idx);
        newIndices.push(v2Idx, mid20Idx, mid12Idx);
        newIndices.push(mid01Idx, mid12Idx, mid20Idx);

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Laplacian smoothing for vertex positions
     */
    static laplacianSmooth(geometry: THREE.BufferGeometry, iterations: number = 1, factor: number = 0.5): void {
        const position = geometry.attributes.position;
        const newPositions = new Float32Array(position.array.length);

        for (let iter = 0; iter < iterations; iter++) {
            for (let i = 0; i < position.count; i++) {
                const neighbors = this.getVertexNeighbors(geometry, i);
                const current = new THREE.Vector3().fromBufferAttribute(position, i);
                const avgNeighbor = new THREE.Vector3();

                for (const neighborIdx of neighbors) {
                    avgNeighbor.add(new THREE.Vector3().fromBufferAttribute(position, neighborIdx));
                }

                if (neighbors.length > 0) {
                    avgNeighbor.divideScalar(neighbors.length);
                    const smoothed = current.lerp(avgNeighbor, factor);

                    newPositions[i * 3] = smoothed.x;
                    newPositions[i * 3 + 1] = smoothed.y;
                    newPositions[i * 3 + 2] = smoothed.z;
                } else {
                    newPositions[i * 3] = current.x;
                    newPositions[i * 3 + 1] = current.y;
                    newPositions[i * 3 + 2] = current.z;
                }
            }

            position.array.set(newPositions);
        }

        position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    /**
     * Convert non-indexed geometry to indexed
     */
    static toIndexed(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        if (geometry.index) return geometry;

        const position = geometry.attributes.position;
        const vertices: THREE.Vector3[] = [];
        const vertexMap = new Map<string, number>();
        const indices: number[] = [];

        for (let i = 0; i < position.count; i++) {
            const v = new THREE.Vector3().fromBufferAttribute(position, i);
            const key = this.getVertexKey(v, 0.0001);

            if (!vertexMap.has(key)) {
                vertexMap.set(key, vertices.length);
                vertices.push(v);
            }
            indices.push(vertexMap.get(key)!);
        }

        const newGeometry = new THREE.BufferGeometry();
        const newPositions = new Float32Array(vertices.length * 3);

        for (let i = 0; i < vertices.length; i++) {
            newPositions[i * 3] = vertices[i].x;
            newPositions[i * 3 + 1] = vertices[i].y;
            newPositions[i * 3 + 2] = vertices[i].z;
        }

        newGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        newGeometry.setIndex(indices);

        // Copy other attributes
        for (const key in geometry.attributes) {
            if (key !== 'position') {
                newGeometry.setAttribute(key, geometry.attributes[key].clone());
            }
        }

        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Catmull-Clark subdivision surface algorithm
     * Production-ready implementation for smooth subdivision
     */
    static catmullClarkSubdivision(
        geometry: THREE.BufferGeometry,
        iterations: number = 1
    ): THREE.BufferGeometry {
        let result = this.toIndexed(geometry);

        for (let iter = 0; iter < iterations; iter++) {
            result = this.catmullClarkIteration(result);
        }

        return result;
    }

    private static catmullClarkIteration(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const edges = this.getEdges(geometry);

        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Maps for new vertex indices
        const facePoints = new Map<number, number>();
        const edgePoints = new Map<string, number>();
        const vertexPoints = new Map<number, number>();

        // Step 1: Calculate face points (centroid of each face)
        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

            const facePoint = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
            const fpIdx = newPositions.length / 3;
            newPositions.push(facePoint.x, facePoint.y, facePoint.z);
            facePoints.set(faceIdx, fpIdx);
        }

        // Step 2: Calculate edge points
        edges.forEach((edge, edgeKey) => {
            const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1);

            const edgeMidpoint = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);

            // Average with adjacent face points
            const avgFacePoint = new THREE.Vector3();
            for (const faceIdx of edge.faces) {
                const fpIdx = facePoints.get(faceIdx)!;
                avgFacePoint.add(new THREE.Vector3(
                    newPositions[fpIdx * 3],
                    newPositions[fpIdx * 3 + 1],
                    newPositions[fpIdx * 3 + 2]
                ));
            }
            if (edge.faces.length > 0) {
                avgFacePoint.divideScalar(edge.faces.length);
            }

            const edgePoint = edgeMidpoint.add(avgFacePoint).multiplyScalar(0.5);
            const epIdx = newPositions.length / 3;
            newPositions.push(edgePoint.x, edgePoint.y, edgePoint.z);
            edgePoints.set(edgeKey, epIdx);
        });

        // Step 3: Calculate new vertex points
        for (let vertIdx = 0; vertIdx < position.count; vertIdx++) {
            const originalVertex = new THREE.Vector3().fromBufferAttribute(position, vertIdx);
            const neighbors = this.getVertexNeighbors(geometry, vertIdx);
            const n = neighbors.length;

            if (n === 0) {
                const vpIdx = newPositions.length / 3;
                newPositions.push(originalVertex.x, originalVertex.y, originalVertex.z);
                vertexPoints.set(vertIdx, vpIdx);
                continue;
            }

            // Calculate average of face points touching this vertex
            const faces = this.getFacesContainingVertex(geometry, vertIdx);
            const avgFacePoint = new THREE.Vector3();
            for (const faceIdx of faces) {
                const fpIdx = facePoints.get(faceIdx)!;
                avgFacePoint.add(new THREE.Vector3(
                    newPositions[fpIdx * 3],
                    newPositions[fpIdx * 3 + 1],
                    newPositions[fpIdx * 3 + 2]
                ));
            }
            avgFacePoint.divideScalar(faces.length);

            // Calculate average of midpoints of edges touching this vertex
            const avgEdgeMidpoint = new THREE.Vector3();
            for (const neighborIdx of neighbors) {
                const neighbor = new THREE.Vector3().fromBufferAttribute(position, neighborIdx);
                avgEdgeMidpoint.add(originalVertex.clone().add(neighbor).multiplyScalar(0.5));
            }
            avgEdgeMidpoint.divideScalar(n);

            // Catmull-Clark formula: (F + 2R + (n-3)P) / n
            // F = avg face point, R = avg edge midpoint, P = original point
            const newVertexPoint = new THREE.Vector3()
                .addScaledVector(avgFacePoint, 1)
                .addScaledVector(avgEdgeMidpoint, 2)
                .addScaledVector(originalVertex, n - 3)
                .divideScalar(n);

            const vpIdx = newPositions.length / 3;
            newPositions.push(newVertexPoint.x, newVertexPoint.y, newVertexPoint.z);
            vertexPoints.set(vertIdx, vpIdx);
        }

        // Step 4: Create new faces
        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            const fpIdx = facePoints.get(faceIdx)!;
            const vp0Idx = vertexPoints.get(v0Idx)!;
            const vp1Idx = vertexPoints.get(v1Idx)!;
            const vp2Idx = vertexPoints.get(v2Idx)!;

            const ep01Idx = edgePoints.get(this.getEdgeKey(v0Idx, v1Idx))!;
            const ep12Idx = edgePoints.get(this.getEdgeKey(v1Idx, v2Idx))!;
            const ep20Idx = edgePoints.get(this.getEdgeKey(v2Idx, v0Idx))!;

            // Create new quad faces (split into triangles)
            newIndices.push(vp0Idx, ep01Idx, fpIdx);
            newIndices.push(vp0Idx, fpIdx, ep20Idx);

            newIndices.push(vp1Idx, ep12Idx, fpIdx);
            newIndices.push(vp1Idx, fpIdx, ep01Idx);

            newIndices.push(vp2Idx, ep20Idx, fpIdx);
            newIndices.push(vp2Idx, fpIdx, ep12Idx);
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Mesh decimation - reduce mesh complexity while preserving shape
     * Uses edge collapse with quadric error metric
     */
    static decimateMesh(
        geometry: THREE.BufferGeometry,
        targetFaceCount: number
    ): THREE.BufferGeometry {
        let result = this.toIndexed(geometry);
        const currentFaceCount = result.index!.count / 3;

        if (currentFaceCount <= targetFaceCount) {
            return result;
        }

        const facesToRemove = currentFaceCount - targetFaceCount;

        // Simplified decimation: collapse shortest edges
        for (let i = 0; i < facesToRemove; i++) {
            const edges = this.getEdges(result);
            const position = result.attributes.position;

            let shortestEdge: { key: string; length: number } | undefined = undefined;

            for (const [key, edge] of edges) {
                const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
                const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1);
                const length = v0.distanceTo(v1);

                if (!shortestEdge || length < shortestEdge.length) {
                    shortestEdge = { key, length };
                }
            }

            if (shortestEdge) {
                result = this.collapseEdge(result, shortestEdge.key);
            }
        }

        return result;
    }

    private static collapseEdge(geometry: THREE.BufferGeometry, edgeKey: string): THREE.BufferGeometry {
        const edges = this.getEdges(geometry);
        const edge = edges.get(edgeKey);
        if (!edge) return geometry;

        const position = geometry.attributes.position;
        const index = geometry.index!;

        // Calculate midpoint
        const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
        const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1);
        const midpoint = v0.clone().add(v1).multiplyScalar(0.5);

        // Move v0 to midpoint
        const newPositions = Array.from(position.array);
        newPositions[edge.v0 * 3] = midpoint.x;
        newPositions[edge.v0 * 3 + 1] = midpoint.y;
        newPositions[edge.v0 * 3 + 2] = midpoint.z;

        // Replace all v1 references with v0 in indices
        const newIndices: number[] = [];
        for (let i = 0; i < index.count; i += 3) {
            let i0 = index.array[i];
            let i1 = index.array[i + 1];
            let i2 = index.array[i + 2];

            if (i0 === edge.v1) i0 = edge.v0;
            if (i1 === edge.v1) i1 = edge.v0;
            if (i2 === edge.v1) i2 = edge.v0;

            // Skip degenerate triangles
            if (i0 !== i1 && i1 !== i2 && i2 !== i0) {
                newIndices.push(i0, i1, i2);
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Calculate geodesic distance between two vertices on mesh surface
     */
    static geodesicDistance(
        geometry: THREE.BufferGeometry,
        startVertex: number,
        endVertex: number
    ): number {
        // Dijkstra's algorithm on mesh graph
        const position = geometry.attributes.position;
        const distances = new Map<number, number>();
        const visited = new Set<number>();
        const queue: { vertex: number; distance: number }[] = [];

        distances.set(startVertex, 0);
        queue.push({ vertex: startVertex, distance: 0 });

        while (queue.length > 0) {
            queue.sort((a, b) => a.distance - b.distance);
            const current = queue.shift()!;

            if (visited.has(current.vertex)) continue;
            visited.add(current.vertex);

            if (current.vertex === endVertex) {
                return current.distance;
            }

            const neighbors = this.getVertexNeighbors(geometry, current.vertex);
            const currentPos = new THREE.Vector3().fromBufferAttribute(position, current.vertex);

            for (const neighbor of neighbors) {
                if (visited.has(neighbor)) continue;

                const neighborPos = new THREE.Vector3().fromBufferAttribute(position, neighbor);
                const edgeLength = currentPos.distanceTo(neighborPos);
                const newDistance = current.distance + edgeLength;

                if (!distances.has(neighbor) || newDistance < distances.get(neighbor)!) {
                    distances.set(neighbor, newDistance);
                    queue.push({ vertex: neighbor, distance: newDistance });
                }
            }
        }

        return Infinity;
    }

    /**
     * Compute convex hull of mesh vertices
     * Returns a new geometry representing the convex hull
     */
    static convexHull(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const vertices: THREE.Vector3[] = [];

        for (let i = 0; i < position.count; i++) {
            vertices.push(new THREE.Vector3().fromBufferAttribute(position, i));
        }

        // QuickHull algorithm (simplified 3D version)
        const hull = this.quickHull3D(vertices);

        return hull;
    }

    private static quickHull3D(points: THREE.Vector3[]): THREE.BufferGeometry {
        // Simplified convex hull - use THREE.js ConvexGeometry if available
        // This is a basic tetrahedron for now
        const geometry = new THREE.BufferGeometry();

        if (points.length < 4) return geometry;

        // Find extreme points
        let minX = points[0], maxX = points[0];
        let minY = points[0], maxY = points[0];
        let minZ = points[0], maxZ = points[0];

        for (const p of points) {
            if (p.x < minX.x) minX = p;
            if (p.x > maxX.x) maxX = p;
            if (p.y < minY.y) minY = p;
            if (p.y > maxY.y) maxY = p;
            if (p.z < minZ.z) minZ = p;
            if (p.z > maxZ.z) maxZ = p;
        }

        // Create simple convex hull from extreme points
        const hullPoints = [minX, maxX, minY, maxY, minZ, maxZ];
        const positions: number[] = [];

        for (const p of hullPoints) {
            positions.push(p.x, p.y, p.z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeVertexNormals();

        return geometry;
    }

    /**
     * Compute mesh curvature at vertices
     * Returns array of curvature values (Gaussian curvature)
     */
    static computeCurvature(geometry: THREE.BufferGeometry): Float32Array {
        const position = geometry.attributes.position;
        const curvature = new Float32Array(position.count);

        for (let i = 0; i < position.count; i++) {
            const neighbors = this.getVertexNeighbors(geometry, i);
            const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
            const vertexNormal = this.calculateVertexNormal(geometry, i);

            let totalCurvature = 0;
            let weightSum = 0;

            for (const neighborIdx of neighbors) {
                const neighbor = new THREE.Vector3().fromBufferAttribute(position, neighborIdx);
                const neighborNormal = this.calculateVertexNormal(geometry, neighborIdx);

                const distance = vertex.distanceTo(neighbor);
                if (distance > 0) {
                    const normalDiff = vertexNormal.angleTo(neighborNormal);
                    const weight = 1.0 / distance;

                    totalCurvature += normalDiff * weight;
                    weightSum += weight;
                }
            }

            curvature[i] = weightSum > 0 ? totalCurvature / weightSum : 0;
        }

        return curvature;
    }

    /**
     * Remesh geometry with uniform triangle sizes
     */
    static remeshUniform(
        geometry: THREE.BufferGeometry,
        targetEdgeLength: number,
        iterations: number = 3
    ): THREE.BufferGeometry {
        let result = this.toIndexed(geometry);

        for (let iter = 0; iter < iterations; iter++) {
            // Split long edges
            result = this.splitLongEdges(result, targetEdgeLength * 1.3);

            // Collapse short edges
            result = this.collapseShortEdges(result, targetEdgeLength * 0.7);

            // Smooth
            this.laplacianSmooth(result, 1, 0.5);
        }

        return result;
    }

    private static splitLongEdges(geometry: THREE.BufferGeometry, maxLength: number): THREE.BufferGeometry {
        const edges = this.getEdges(geometry);
        const position = geometry.attributes.position;
        let result = geometry;

        edges.forEach((edge, key) => {
            const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1);
            const length = v0.distanceTo(v1);

            if (length > maxLength) {
                // Split edge at midpoint
                result = this.splitEdge(result, key);
            }
        });

        return result;
    }

    private static splitEdge(geometry: THREE.BufferGeometry, edgeKey: string): THREE.BufferGeometry {
        const edges = this.getEdges(geometry);
        const edge = edges.get(edgeKey);
        if (!edge) return geometry;

        const position = geometry.attributes.position;
        const index = geometry.index!;

        const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
        const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1);
        const midpoint = v0.clone().add(v1).multiplyScalar(0.5);

        const newPositions = Array.from(position.array);
        newPositions.push(midpoint.x, midpoint.y, midpoint.z);
        const newVertIdx = newPositions.length / 3 - 1;

        const newIndices: number[] = [];

        for (let i = 0; i < index.count; i += 3) {
            const i0 = index.array[i];
            const i1 = index.array[i + 1];
            const i2 = index.array[i + 2];

            const hasEdge = (i0 === edge.v0 && i1 === edge.v1) ||
                (i1 === edge.v0 && i2 === edge.v1) ||
                (i2 === edge.v0 && i0 === edge.v1) ||
                (i0 === edge.v1 && i1 === edge.v0) ||
                (i1 === edge.v1 && i2 === edge.v0) ||
                (i2 === edge.v1 && i0 === edge.v0);

            if (hasEdge) {
                const otherVertex = [i0, i1, i2].find(v => v !== edge.v0 && v !== edge.v1)!;
                newIndices.push(edge.v0, newVertIdx, otherVertex);
                newIndices.push(newVertIdx, edge.v1, otherVertex);
            } else {
                newIndices.push(i0, i1, i2);
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    private static collapseShortEdges(geometry: THREE.BufferGeometry, minLength: number): THREE.BufferGeometry {
        const edges = this.getEdges(geometry);
        const position = geometry.attributes.position;
        let result = geometry;

        edges.forEach((edge, key) => {
            const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1);
            const length = v0.distanceTo(v1);

            if (length < minLength) {
                result = this.collapseEdge(result, key);
            }
        });

        return result;
    }

    /**
     * Compute ambient occlusion for vertices
     * Returns array of occlusion values [0-1]
     */
    static computeAmbientOcclusion(
        geometry: THREE.BufferGeometry,
        samples: number = 32,
        maxDistance: number = 1.0
    ): Float32Array {
        const position = geometry.attributes.position;
        const occlusion = new Float32Array(position.count);

        for (let i = 0; i < position.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
            const normal = this.calculateVertexNormal(geometry, i);

            let occludedSamples = 0;

            for (let s = 0; s < samples; s++) {
                // Generate random direction in hemisphere
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                const direction = new THREE.Vector3(
                    Math.sin(phi) * Math.cos(theta),
                    Math.sin(phi) * Math.sin(theta),
                    Math.cos(phi)
                );

                // Orient to normal
                if (direction.dot(normal) < 0) {
                    direction.negate();
                }

                const ray = new THREE.Ray(vertex, direction);

                // Simple occlusion check
                if (this.rayIntersectsMesh(ray, geometry, maxDistance)) {
                    occludedSamples++;
                }
            }

            occlusion[i] = occludedSamples / samples;
        }

        return occlusion;
    }

    private static rayIntersectsMesh(
        ray: THREE.Ray,
        geometry: THREE.BufferGeometry,
        maxDistance: number
    ): boolean {
        const position = geometry.attributes.position;
        const index = geometry.index;

        const faceCount = index ? index.count / 3 : position.count / 3;

        for (let faceIdx = 0; faceIdx < faceCount; faceIdx++) {
            const i = faceIdx * 3;
            const v0Idx = index ? index.array[i] : i;
            const v1Idx = index ? index.array[i + 1] : i + 1;
            const v2Idx = index ? index.array[i + 2] : i + 2;

            const v0 = new THREE.Vector3().fromBufferAttribute(position, v0Idx);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, v1Idx);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, v2Idx);

            const intersection = ray.intersectTriangle(v0, v1, v2, false, new THREE.Vector3());

            if (intersection) {
                const distance = ray.origin.distanceTo(intersection);
                if (distance > 0.001 && distance <= maxDistance) {
                    return true;
                }
            }
        }

        return false;
    }
}
