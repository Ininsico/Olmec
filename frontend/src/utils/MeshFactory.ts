import * as THREE from 'three';

export class MeshFactory {
    static createGeometry(type: string): THREE.BufferGeometry | THREE.GridHelper | null {
        switch (type) {
            case 'plane':
                return new THREE.PlaneGeometry(2, 2);
            case 'cube':
                return new THREE.BoxGeometry(1, 1, 1);
            case 'circle':
                return new THREE.CircleGeometry(1, 32);
            case 'uv_sphere':
                return new THREE.SphereGeometry(1, 32, 32);
            case 'ico_sphere':
                return new THREE.IcosahedronGeometry(1, 1);
            case 'cylinder':
                return new THREE.CylinderGeometry(1, 1, 2, 32);
            case 'cone':
                return new THREE.ConeGeometry(1, 2, 32);
            case 'torus':
                return new THREE.TorusGeometry(1, 0.4, 16, 100);
            case 'monkey':
                // Suzanne is not a default geometry in Three.js core. 
                // Using TorusKnot as a "complex" placeholder or we would need to load the GLTF
                return new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16);
            default:
                console.warn(`Unknown geometry type: ${type}`);
                return new THREE.BoxGeometry(1, 1, 1);
        }
    }

    static createMesh(type: string, id: number, name: string): THREE.Object3D {
        if (type === 'grid') {
            const grid = new THREE.GridHelper(10, 10);
            grid.name = name;
            grid.userData.id = id;
            return grid;
        }

        const geometry = this.createGeometry(type);

        if (!geometry) {
            throw new Error(`Failed to create geometry for type: ${type}`);
        }

        // Check if it's a helper or a geometry
        if (geometry instanceof THREE.GridHelper) {
            // Should not happen with current logic but for safety
            return geometry;
        }

        const material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.5,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry as THREE.BufferGeometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.id = id;
        mesh.name = name;

        // Default rotations for some objects to align nicely
        if (type === 'plane' || type === 'circle' || type === 'grid') {
            mesh.rotation.x = -Math.PI / 2;
        }

        // Default position 0,0,0 as requested
        mesh.position.set(0, 0, 0);

        return mesh;
    }
}
