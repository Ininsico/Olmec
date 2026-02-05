import * as THREE from 'three';
import { GeometryUtils } from './GeometryUtils';

/**
 * Advanced edge-level operations for mesh editing
 */
export class EdgeOperations {
    /**
     * Extrude edges outward
     */
    static extrudeEdges(
        geometry: THREE.BufferGeometry,
        edgeKeys: string[],
        distance: number
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const position = newGeometry.attributes.position;
        const edges = GeometryUtils.getEdges(newGeometry);
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        for (const edgeKey of edgeKeys) {
            const edge = edges.get(edgeKey);
            if (!edge) continue;

            const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1);

            // Calculate edge normal (average of face normals)
            const edgeNormal = new THREE.Vector3();
            for (const faceIdx of edge.faces) {
                edgeNormal.add(GeometryUtils.getFaceNormal(newGeometry, faceIdx));
            }
            edgeNormal.normalize();

            // Create new extruded vertices
            const offset = edgeNormal.multiplyScalar(distance);
            const newV0 = v0.clone().add(offset);
            const newV1 = v1.clone().add(offset);

            const newV0Idx = newPositions.length / 3;
            newPositions.push(newV0.x, newV0.y, newV0.z);

            const newV1Idx = newPositions.length / 3;
            newPositions.push(newV1.x, newV1.y, newV1.z);

            // Create quad face (two triangles)
            newIndices.push(edge.v0, edge.v1, newV1Idx);
            newIndices.push(edge.v0, newV1Idx, newV0Idx);
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Bevel edges (chamfer)
     */
    static bevelEdges(
        geometry: THREE.BufferGeometry,
        edgeKeys: string[],
        amount: number = 0.1,
        segments: number = 1
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const position = newGeometry.attributes.position;
        const edges = GeometryUtils.getEdges(newGeometry);
        const newPositions: number[] = [];
        const newIndices: number[] = [];

        // Copy existing positions
        for (let i = 0; i < position.count; i++) {
            newPositions.push(position.getX(i), position.getY(i), position.getZ(i));
        }

        for (const edgeKey of edgeKeys) {
            const edge = edges.get(edgeKey);
            if (!edge) continue;

            const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
            const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1);
            const edgeVector = new THREE.Vector3().subVectors(v1, v0);

            // Calculate perpendicular direction
            const edgeNormal = new THREE.Vector3();
            for (const faceIdx of edge.faces) {
                edgeNormal.add(GeometryUtils.getFaceNormal(newGeometry, faceIdx));
            }
            edgeNormal.normalize();

            const perpendicular = new THREE.Vector3().crossVectors(edgeVector, edgeNormal).normalize();

            // Create bevel vertices
            const bevelVertices: number[] = [];
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const angle = (Math.PI / 2) * t;
                const offset = perpendicular.clone().multiplyScalar(Math.sin(angle) * amount);

                const pos0 = v0.clone().add(offset);
                const pos1 = v1.clone().add(offset);

                const idx0 = newPositions.length / 3;
                newPositions.push(pos0.x, pos0.y, pos0.z);
                bevelVertices.push(idx0);

                const idx1 = newPositions.length / 3;
                newPositions.push(pos1.x, pos1.y, pos1.z);
                bevelVertices.push(idx1);

                // Create quads between segments
                if (i > 0) {
                    const prev0 = bevelVertices[bevelVertices.length - 4];
                    const prev1 = bevelVertices[bevelVertices.length - 3];

                    newIndices.push(prev0, idx0, idx1);
                    newIndices.push(prev0, idx1, prev1);
                }
            }
        }

        const result = new THREE.BufferGeometry();
        result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        result.setIndex(newIndices);
        result.computeVertexNormals();

        return result;
    }

    /**
     * Loop cut - add edge loop across mesh
     */
    static loopCut(
        geometry: THREE.BufferGeometry,
        edgeKey: string,
        position: number = 0.5
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const posAttr = newGeometry.attributes.position;
        const edges = GeometryUtils.getEdges(newGeometry);
        const edge = edges.get(edgeKey);

        if (!edge) return newGeometry;

        const v0 = new THREE.Vector3().fromBufferAttribute(posAttr, edge.v0);
        const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, edge.v1);

        // Create new vertex at edge midpoint
        const newVertex = v0.clone().lerp(v1, position);
        const newPositions = Array.from(posAttr.array);
        const newVertexIdx = newPositions.length / 3;

        newPositions.push(newVertex.x, newVertex.y, newVertex.z);

        // Split faces containing this edge
        const index = newGeometry.index!;
        const newIndices: number[] = [];

        for (let i = 0; i < index.count; i += 3) {
            const i0 = index.array[i];
            const i1 = index.array[i + 1];
            const i2 = index.array[i + 2];

            // Check if this face contains the edge
            const hasEdge = (i0 === edge.v0 && i1 === edge.v1) ||
                (i1 === edge.v0 && i2 === edge.v1) ||
                (i2 === edge.v0 && i0 === edge.v1) ||
                (i0 === edge.v1 && i1 === edge.v0) ||
                (i1 === edge.v1 && i2 === edge.v0) ||
                (i2 === edge.v1 && i0 === edge.v0);

            if (hasEdge) {
                // Split triangle into two
                const otherVertex = [i0, i1, i2].find(v => v !== edge.v0 && v !== edge.v1)!;

                newIndices.push(edge.v0, newVertexIdx, otherVertex);
                newIndices.push(newVertexIdx, edge.v1, otherVertex);
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

    /**
     * Subdivide edge by adding vertices
     */
    static subdivideEdge(
        geometry: THREE.BufferGeometry,
        edgeKey: string,
        cuts: number = 1
    ): THREE.BufferGeometry {
        let result = geometry;

        for (let i = 0; i < cuts; i++) {
            const position = (i + 1) / (cuts + 1);
            result = this.loopCut(result, edgeKey, position);
        }

        return result;
    }

    /**
     * Edge slide - move edge along surface
     */
    static slideEdge(
        geometry: THREE.BufferGeometry,
        edgeKey: string,
        factor: number
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;
        const edges = GeometryUtils.getEdges(newGeometry);
        const edge = edges.get(edgeKey);

        if (!edge) return newGeometry;

        // Get neighboring edges
        const v0Neighbors = GeometryUtils.getVertexNeighbors(newGeometry, edge.v0);
        const v1Neighbors = GeometryUtils.getVertexNeighbors(newGeometry, edge.v1);

        // Calculate slide direction based on neighboring vertices
        const v0NextNeighbor = v0Neighbors.find(n => n !== edge.v1);
        const v1NextNeighbor = v1Neighbors.find(n => n !== edge.v0);

        if (v0NextNeighbor !== undefined) {
            const current = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
            const target = new THREE.Vector3().fromBufferAttribute(position, v0NextNeighbor);
            const newPos = current.lerp(target, factor);
            position.setXYZ(edge.v0, newPos.x, newPos.y, newPos.z);
        }

        if (v1NextNeighbor !== undefined) {
            const current = new THREE.Vector3().fromBufferAttribute(position, edge.v1);
            const target = new THREE.Vector3().fromBufferAttribute(position, v1NextNeighbor);
            const newPos = current.lerp(target, factor);
            position.setXYZ(edge.v1, newPos.x, newPos.y, newPos.z);
        }

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Bridge two edges with faces
     */
    static bridgeEdges(
        geometry: THREE.BufferGeometry,
        edgeKey1: string,
        edgeKey2: string
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const edges = GeometryUtils.getEdges(newGeometry);
        const edge1 = edges.get(edgeKey1);
        const edge2 = edges.get(edgeKey2);

        if (!edge1 || !edge2) return newGeometry;

        const index = newGeometry.index!;
        const newIndices = Array.from(index.array);

        // Create quad bridging the two edges
        newIndices.push(edge1.v0, edge1.v1, edge2.v1);
        newIndices.push(edge1.v0, edge2.v1, edge2.v0);

        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Collapse edge (merge vertices)
     */
    static collapseEdge(
        geometry: THREE.BufferGeometry,
        edgeKey: string
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const position = newGeometry.attributes.position;
        const edges = GeometryUtils.getEdges(newGeometry);
        const edge = edges.get(edgeKey);

        if (!edge) return newGeometry;

        // Calculate midpoint
        const v0 = new THREE.Vector3().fromBufferAttribute(position, edge.v0);
        const v1 = new THREE.Vector3().fromBufferAttribute(position, edge.v1);
        const midpoint = v0.clone().add(v1).multiplyScalar(0.5);

        // Move v0 to midpoint
        position.setXYZ(edge.v0, midpoint.x, midpoint.y, midpoint.z);

        // Replace all v1 references with v0
        const index = newGeometry.index!;
        const newIndices: number[] = [];

        for (let i = 0; i < index.count; i += 3) {
            let i0 = index.array[i];
            let i1 = index.array[i + 1];
            let i2 = index.array[i + 2];

            // Replace v1 with v0
            if (i0 === edge.v1) i0 = edge.v0;
            if (i1 === edge.v1) i1 = edge.v0;
            if (i2 === edge.v1) i2 = edge.v0;

            // Skip degenerate triangles
            if (i0 !== i1 && i1 !== i2 && i2 !== i0) {
                newIndices.push(i0, i1, i2);
            }
        }

        newGeometry.setIndex(newIndices);
        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Dissolve edge (merge faces)
     */
    static dissolveEdge(
        geometry: THREE.BufferGeometry,
        edgeKey: string
    ): THREE.BufferGeometry {
        const newGeometry = GeometryUtils.toIndexed(geometry);
        const edges = GeometryUtils.getEdges(newGeometry);
        const edge = edges.get(edgeKey);

        if (!edge || edge.faces.length !== 2) return newGeometry;

        const index = newGeometry.index!;
        const newIndices: number[] = [];

        // Get the two triangles sharing this edge
        const face0Idx = edge.faces[0];
        const face1Idx = edge.faces[1];

        const face0 = [
            index.array[face0Idx * 3],
            index.array[face0Idx * 3 + 1],
            index.array[face0Idx * 3 + 2]
        ];
        const face1 = [
            index.array[face1Idx * 3],
            index.array[face1Idx * 3 + 1],
            index.array[face1Idx * 3 + 2]
        ];

        // Find the other two vertices
        const uniqueVerts = new Set([...face0, ...face1]);
        uniqueVerts.delete(edge.v0);
        uniqueVerts.delete(edge.v1);
        const otherVerts = Array.from(uniqueVerts);

        if (otherVerts.length === 2) {
            // Create a quad from the merge (as two triangles)
            newIndices.push(edge.v0, otherVerts[0], edge.v1);
            newIndices.push(edge.v1, otherVerts[0], otherVerts[1]);
        }

        // Copy other faces
        for (let i = 0; i < index.count; i += 3) {
            const faceIdx = i / 3;
            if (faceIdx !== face0Idx && faceIdx !== face1Idx) {
                newIndices.push(index.array[i], index.array[i + 1], index.array[i + 2]);
            }
        }

        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Offset edge perpendicular to surface
     */
    static offsetEdge(
        geometry: THREE.BufferGeometry,
        edgeKey: string,
        distance: number
    ): THREE.BufferGeometry {
        const newGeometry = geometry.clone();
        const position = newGeometry.attributes.position;
        const edges = GeometryUtils.getEdges(newGeometry);
        const edge = edges.get(edgeKey);

        if (!edge) return newGeometry;

        // Calculate edge normal
        const edgeNormal = new THREE.Vector3();
        for (const faceIdx of edge.faces) {
            edgeNormal.add(GeometryUtils.getFaceNormal(newGeometry, faceIdx));
        }
        edgeNormal.normalize();

        const offset = edgeNormal.multiplyScalar(distance);

        // Move both vertices
        position.setXYZ(
            edge.v0,
            position.getX(edge.v0) + offset.x,
            position.getY(edge.v0) + offset.y,
            position.getZ(edge.v0) + offset.z
        );

        position.setXYZ(
            edge.v1,
            position.getX(edge.v1) + offset.x,
            position.getY(edge.v1) + offset.y,
            position.getZ(edge.v1) + offset.z
        );

        position.needsUpdate = true;
        newGeometry.computeVertexNormals();
        return newGeometry;
    }

    /**
     * Crease edge (sharpen normal)
     */
    static creaseEdge(
        geometry: THREE.BufferGeometry,
        edgeKey: string,
        amount: number = 1.0
    ): THREE.BufferGeometry {
        // This would typically involve custom normal handling
        // For now, we mark the edge for sharp rendering
        const newGeometry = geometry.clone();

        if (!newGeometry.userData.creases) {
            newGeometry.userData.creases = [];
        }

        newGeometry.userData.creases.push({ edge: edgeKey, amount });
        newGeometry.computeVertexNormals();

        return newGeometry;
    }
}
