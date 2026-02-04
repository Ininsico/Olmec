import * as THREE from 'three';

export class MeshFactory {
    static createGeometry(type: string): THREE.BufferGeometry | THREE.GridHelper | null {
        switch (type) {
            // MESH PRIMITIVES
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
                return new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16);

            // CURVES
            case 'bezier':
                return this.createBezierCurve();
            case 'nurbs_curve':
                return this.createNurbsCurve();
            case 'nurbs_circle':
                return this.createNurbsCircle();
            case 'path':
                return this.createPath();

            // SURFACES
            case 'nurbs_surface':
                return new THREE.SphereGeometry(1, 16, 16); // Smooth surface approximation
            case 'nurbs_cylinder':
                return new THREE.CylinderGeometry(1, 1, 2, 24, 8);
            case 'nurbs_sphere':
                return new THREE.SphereGeometry(1, 24, 24);
            case 'nurbs_torus':
                return new THREE.TorusGeometry(1, 0.3, 24, 48);

            // METABALLS
            case 'ball':
                return new THREE.SphereGeometry(0.8, 32, 32);
            case 'capsule':
                return new THREE.CapsuleGeometry(0.5, 1, 16, 32);
            case 'ellipsoid':
                return this.createEllipsoid();

            default:
                console.warn(`Unknown geometry type: ${type}`);
                return new THREE.BoxGeometry(1, 1, 1);
        }
    }

    // Helper: Create Bezier curve
    private static createBezierCurve(): THREE.BufferGeometry {
        const curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(-2, 0, 0),
            new THREE.Vector3(-1, 1, 0),
            new THREE.Vector3(1, 1, 0),
            new THREE.Vector3(2, 0, 0)
        );
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
    }

    // Helper: Create NURBS-style curve (approximated with CatmullRom)
    private static createNurbsCurve(): THREE.BufferGeometry {
        const points = [
            new THREE.Vector3(-2, 0, 0),
            new THREE.Vector3(-1, 1, 0),
            new THREE.Vector3(0, -0.5, 0),
            new THREE.Vector3(1, 1, 0),
            new THREE.Vector3(2, 0, 0)
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        const curvePoints = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        return geometry;
    }

    // Helper: Create NURBS circle (smooth circle curve)
    private static createNurbsCircle(): THREE.BufferGeometry {
        const points = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(theta) * 1.5,
                Math.sin(theta) * 1.5,
                0
            ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
    }

    // Helper: Create path (wavy line)
    private static createPath(): THREE.BufferGeometry {
        const points = [];
        for (let i = 0; i <= 50; i++) {
            const x = (i / 50) * 4 - 2;
            const y = Math.sin(i / 5) * 0.5;
            points.push(new THREE.Vector3(x, y, 0));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
    }

    // Helper: Create ellipsoid
    private static createEllipsoid(): THREE.BufferGeometry {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        // Scale to make ellipsoid
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            positions.setY(i, positions.getY(i) * 1.5); // Stretch Y axis
            positions.setX(i, positions.getX(i) * 0.7); // Compress X axis
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        return geometry;
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
            return geometry;
        }

        // Determine if it's a curve/line or a solid mesh
        const isCurve = ['bezier', 'nurbs_curve', 'nurbs_circle', 'path'].includes(type);

        if (isCurve) {
            // Create line for curves
            const material = new THREE.LineBasicMaterial({
                color: 0x000000,
                linewidth: 2
            });
            const line = new THREE.Line(geometry as THREE.BufferGeometry, material);
            line.userData.id = id;
            line.name = name;
            line.position.set(0, 0, 0);
            return line;
        } else {
            // Create solid mesh for surfaces and metaballs
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
            if (type === 'plane' || type === 'circle') {
                mesh.rotation.x = -Math.PI / 2;
            }

            // Special handling for metaball plane (different from regular plane)
            if (type === 'plane' && name.includes('metaball')) {
                mesh.scale.set(0.8, 0.8, 0.8);
            }

            // Default position
            mesh.position.set(0, 0, 0);

            return mesh;
        }
    }
}
