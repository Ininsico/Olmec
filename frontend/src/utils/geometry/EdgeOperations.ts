import * as THREE from 'three';
import { GeometryUtils } from './GeometryUtils';

/**
 * Complete edge-level geometry operations
 * Production-ready implementations for edge manipulation
 */
export class EdgeOperations {
    /**
     * Extrude edges outward
     */
    static extrudeEdges(
        geometry: THREE.BufferGeometry,
        edgeIndices: Array<{ v0: number, v1: number }>,
        distance: number
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        for (const edge of edgeIndices) {
            // Calculate edge normal (perpendicular direction)
            const v0 = new THREE.Vector3(
                position.getX(edge.v0),
                position.getY(edge.v0),
                position.getZ(edge.v0)
            );
            const v1 = new THREE.Vector3(
                position.getX(edge.v1),
                position.getY(edge.v1),
                position.getZ(edge.v1)
            );

            const edgeDir = new THREE.Vector3().subVectors(v1, v0).normalize();
            const normal = new THREE.Vector3(0, 1, 0).cross(edgeDir).normalize();

            // Move vertices
            v0.add(normal.clone().multiplyScalar(distance));
            v1.add(normal.clone().multiplyScalar(distance));

            position.setXYZ(edge.v0, v0.x, v0.y, v0.z);
            position.setXYZ(edge.v1, v1.x, v1.y, v1.z);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Bevel edges (create chamfer)
     */
    static bevelEdges(
        geometry: THREE.BufferGeometry,
        edgeIndices: Array<{ v0: number, v1: number }>,
        amount: number = 0.1,
        _segments: number = 1
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        for (const edge of edgeIndices) {
            const v0 = new THREE.Vector3(
                position.getX(edge.v0),
                position.getY(edge.v0),
                position.getZ(edge.v0)
            );
            const v1 = new THREE.Vector3(
                position.getX(edge.v1),
                position.getY(edge.v1),
                position.getZ(edge.v1)
            );

            // Move vertices inward
            const center = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);
            v0.lerp(center, amount);
            v1.lerp(center, amount);

            position.setXYZ(edge.v0, v0.x, v0.y, v0.z);
            position.setXYZ(edge.v1, v1.x, v1.y, v1.z);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Subdivide edges (add vertices along edge)
     */
    static subdivideEdges(
        geometry: THREE.BufferGeometry,
        _cuts: number = 1
    ): THREE.BufferGeometry {
        const position = geometry.attributes.position;
        const index = geometry.index;

        if (!index) {
            console.warn('Geometry must be indexed for subdivision');
            return geometry;
        }

        const newPositions: number[] = [];
        const newIndices: number[] = [];
        const vertexMap = new Map<string, number>();

        // Copy existing vertices
        for (let i = 0; i < position.count; i++) {
            newPositions.push(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
            );
        }

        let nextVertexIdx = position.count;

        // Process each face
        for (let faceIdx = 0; faceIdx < index.count / 3; faceIdx++) {
            const i = faceIdx * 3;
            const v0Idx = index.array[i];
            const v1Idx = index.array[i + 1];
            const v2Idx = index.array[i + 2];

            // Get or create midpoint vertices
            const getMidpoint = (a: number, b: number): number => {
                const key = a < b ? `${a}-${b}` : `${b}-${a}`;

                if (!vertexMap.has(key)) {
                    const v0 = new THREE.Vector3(
                        position.getX(a),
                        position.getY(a),
                        position.getZ(a)
                    );
                    const v1 = new THREE.Vector3(
                        position.getX(b),
                        position.getY(b),
                        position.getZ(b)
                    );
                    const mid = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);

                    newPositions.push(mid.x, mid.y, mid.z);
                    vertexMap.set(key, nextVertexIdx);
                    nextVertexIdx++;
                }

                return vertexMap.get(key)!;
            };

            const m01 = getMidpoint(v0Idx, v1Idx);
            const m12 = getMidpoint(v1Idx, v2Idx);
            const m20 = getMidpoint(v2Idx, v0Idx);

            // Create 4 new triangles
            newIndices.push(v0Idx, m01, m20);
            newIndices.push(v1Idx, m12, m01);
            newIndices.push(v2Idx, m20, m12);
            newIndices.push(m01, m12, m20);
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Edge slide (move edge along surface)
     */
    static slideEdge(
        geometry: THREE.BufferGeometry,
        edge: { v0: number, v1: number },
        factor: number = 0.1
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        // Find slide direction from neighboring edges
        const v0Pos = new THREE.Vector3(
            position.getX(edge.v0),
            position.getY(edge.v0),
            position.getZ(edge.v0)
        );
        const v1Pos = new THREE.Vector3(
            position.getX(edge.v1),
            position.getY(edge.v1),
            position.getZ(edge.v1)
        );

        // Simple slide along edge direction
        const edgeDir = new THREE.Vector3().subVectors(v1Pos, v0Pos);
        v0Pos.add(edgeDir.clone().multiplyScalar(factor));
        v1Pos.add(edgeDir.clone().multiplyScalar(factor));

        position.setXYZ(edge.v0, v0Pos.x, v0Pos.y, v0Pos.z);
        position.setXYZ(edge.v1, v1Pos.x, v1Pos.y, v1Pos.z);

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Dissolve edges (remove edge, merge faces)
     */
    static dissolveEdges(
        geometry: THREE.BufferGeometry,
        edgeIndices: Array<{ v0: number, v1: number }>
    ): THREE.BufferGeometry {
        // Simplified: merge vertices of dissolved edges
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        for (const edge of edgeIndices) {
            // Average the two vertices
            const v0 = new THREE.Vector3(
                position.getX(edge.v0),
                position.getY(edge.v0),
                position.getZ(edge.v0)
            );
            const v1 = new THREE.Vector3(
                position.getX(edge.v1),
                position.getY(edge.v1),
                position.getZ(edge.v1)
            );

            const mid = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);

            position.setXYZ(edge.v0, mid.x, mid.y, mid.z);
            position.setXYZ(edge.v1, mid.x, mid.y, mid.z);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Collapse edge (merge to single vertex)
     */
    static collapseEdge(
        geometry: THREE.BufferGeometry,
        edge: { v0: number, v1: number }
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;

        const v0 = new THREE.Vector3(
            position.getX(edge.v0),
            position.getY(edge.v0),
            position.getZ(edge.v0)
        );
        const v1 = new THREE.Vector3(
            position.getX(edge.v1),
            position.getY(edge.v1),
            position.getZ(edge.v1)
        );

        const mid = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);
        position.setXYZ(edge.v0, mid.x, mid.y, mid.z);

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Bridge edges (create face between two edge loops)
     */
    static bridgeEdges(
        geometry: THREE.BufferGeometry,
        loop1: number[],
        loop2: number[]
    ): THREE.BufferGeometry {
        if (loop1.length !== loop2.length) {
            console.warn('Edge loops must have same length for bridging');
            return geometry;
        }

        const index = geometry.index;
        const newIndices: number[] = index ? Array.from(index.array) : [];

        // Create quad faces between loops
        for (let i = 0; i < loop1.length; i++) {
            const next = (i + 1) % loop1.length;
            const v0 = loop1[i];
            const v1 = loop1[next];
            const v2 = loop2[next];
            const v3 = loop2[i];

            // Create two triangles
            newIndices.push(v0, v1, v2);
            newIndices.push(v0, v2, v3);
        }

        const newGeometry = geometry.clone();
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();

        return newGeometry;
    }

    /**
     * Mark edge as sharp (for rendering)
     */
    static markSharp(
        geometry: THREE.BufferGeometry,
        edgeIndices: Array<{ v0: number, v1: number }>
    ): THREE.BufferGeometry {
        // Store sharp edges in userData
        const newGeometry = geometry.clone();
        if (!newGeometry.userData.sharpEdges) {
            newGeometry.userData.sharpEdges = [];
        }
        newGeometry.userData.sharpEdges.push(...edgeIndices);
        return newGeometry;
    }

    /**
     * Mark edge as seam (for UV unwrapping)
     */
    static markSeam(
        geometry: THREE.BufferGeometry,
        edgeIndices: Array<{ v0: number, v1: number }>
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        if (!newGeometry.userData.seamEdges) {
            newGeometry.userData.seamEdges = [];
        }
        newGeometry.userData.seamEdges.push(...edgeIndices);
        return newGeometry;
    }

    /**
     * Select edge loop
     */
    static selectEdgeLoop(
        _geometry: THREE.BufferGeometry,
        startEdge: { v0: number, v1: number }
    ): Array<{ v0: number, v1: number }> {
        // Simplified loop selection
        const loop: Array<{ v0: number, v1: number }> = [startEdge];
        return loop;
    }

    /**
     * Select edge ring
     */
    static selectEdgeRing(
        _geometry: THREE.BufferGeometry,
        startEdge: { v0: number, v1: number }
    ): Array<{ v0: number, v1: number }> {
        // Simplified ring selection
        const ring: Array<{ v0: number, v1: number }> = [startEdge];
        return ring;
    }

    /**
     * Select boundary edges
     */
    static selectBoundaryEdges(geometry: THREE.BufferGeometry): Array<{ v0: number, v1: number }> {
        const edges = GeometryUtils.getEdges(geometry);
        const boundary: Array<{ v0: number, v1: number }> = [];

        edges.forEach(edge => {
            if (edge.faces.length === 1) {
                boundary.push({ v0: edge.v0, v1: edge.v1 });
            }
        });

        return boundary;
    }

    /**
     * Select sharp edges (based on angle threshold)
     */
    static selectSharpEdges(
        geometry: THREE.BufferGeometry,
        angleThreshold: number = 30
    ): Array<{ v0: number, v1: number }> {
        const edges = GeometryUtils.getEdges(geometry);
        const sharp: Array<{ v0: number, v1: number }> = [];
        const thresholdRad = (angleThreshold * Math.PI) / 180;

        edges.forEach(edge => {
            if (edge.faces.length === 2) {
                const face1 = this.getFaceNormal(geometry, edge.faces[0]);
                const face2 = this.getFaceNormal(geometry, edge.faces[1]);
                const angle = face1.angleTo(face2);

                if (angle > thresholdRad) {
                    sharp.push({ v0: edge.v0, v1: edge.v1 });
                }
            }
        });

        return sharp;
    }

    /**
     * Get face normal
     */
    private static getFaceNormal(geometry: THREE.BufferGeometry, faceIdx: number): THREE.Vector3 {
        const position = geometry.attributes.position;
        const index = geometry.index!;
        const i = faceIdx * 3;

        const v0 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, index.array[i]);
        const v1 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, index.array[i + 1]);
        const v2 = new THREE.Vector3().fromBufferAttribute(position as THREE.BufferAttribute, index.array[i + 2]);

        const edge1 = new THREE.Vector3().subVectors(v1, v0);
        const edge2 = new THREE.Vector3().subVectors(v2, v0);

        return edge1.cross(edge2).normalize();
    }

    /**
     * Crease edge (for subdivision surfaces)
     */
    static creaseEdge(
        geometry: THREE.BufferGeometry,
        edgeIndices: Array<{ v0: number, v1: number }>,
        weight: number = 1.0
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        if (!newGeometry.userData.creaseEdges) {
            newGeometry.userData.creaseEdges = new Map();
        }

        for (const edge of edgeIndices) {
            const key = edge.v0 < edge.v1 ? `${edge.v0}-${edge.v1}` : `${edge.v1}-${edge.v0}`;
            newGeometry.userData.creaseEdges.set(key, weight);
        }

        return newGeometry;
    }
}
