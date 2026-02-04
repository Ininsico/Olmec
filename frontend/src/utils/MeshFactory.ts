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

            // TEXT
            case 'text':
                return this.create3DText();

            // VOLUME
            case 'empty':
                return null; // Will be handled as helper
            case 'import_openvdb':
                return new THREE.BoxGeometry(1, 1, 1);

            // GREASE PENCIL
            case 'blank':
                return this.createGreasePencilBlank();
            case 'stroke':
                return this.createGreasePencilStroke();

            // ARMATURE
            case 'single_bone':
                return null; // Will be handled as helper
            case 'human_(meta-rig)':
                return null; // Will be handled as helper

            // LATTICE
            case 'lattice':
                return null; // Will be handled as helper

            // EMPTY TYPES
            case 'plain_axes':
            case 'arrows':
            case 'single_arrow':
            case 'image':
                return null; // Will be handled as helpers

            // LIGHTS
            case 'point':
            case 'sun':
            case 'spot':
            case 'area':
                return null; // Will be handled as lights

            // LIGHT PROBES
            case 'reflection_cubemap':
            case 'reflection_plane':
            case 'irradiance_volume':
                return null; // Will be handled as probes

            // CAMERA
            case 'camera':
                return null; // Will be handled as camera

            // SPEAKER
            case 'speaker':
                return null; // Will be handled as speaker

            // FORCE FIELDS
            case 'force':
            case 'wind':
            case 'vortex':
            case 'magnetic':
            case 'harmonic':
            case 'charge':
            case 'lennard-jones':
            case 'texture':
            case 'curve_guide':
            case 'boid':
            case 'turbulence':
            case 'drag':
            case 'fluid_flow':
                return null; // Will be handled as force fields

            default:
                console.warn(`Unknown geometry type: ${type}`);
                return new THREE.BoxGeometry(1, 1, 1);
        }
    }

    // Helper: Create 3D text placeholder
    private static create3DText(): THREE.BufferGeometry {
        // Create simple extruded shape as text placeholder
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 1);
        shape.lineTo(0.6, 1);
        shape.lineTo(0.6, 0.7);
        shape.lineTo(0.2, 0.7);
        shape.lineTo(0.2, 0);
        const extrudeSettings = { depth: 0.2, bevelEnabled: false };
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    // Helper: Create Grease Pencil blank (empty frame)  
    private static createGreasePencilBlank(): THREE.BufferGeometry {
        return new THREE.CircleGeometry(0.1, 16);
    }

    // Helper: Create Grease Pencil stroke
    private static createGreasePencilStroke(): THREE.BufferGeometry {
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const x = (t - 0.5) * 2;
            const y = Math.sin(t * Math.PI * 2) * 0.3;
            points.push(new THREE.Vector3(x, y, 0));
        }
        return new THREE.BufferGeometry().setFromPoints(points);
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
        // Handle grid
        if (type === 'grid') {
            const grid = new THREE.GridHelper(10, 10);
            grid.name = name;
            grid.userData.id = id;
            return grid;
        }

        // Handle lights
        if (['point', 'sun', 'spot', 'area'].includes(type)) {
            return this.createLight(type, id, name);
        }

        // Handle empties
        if (['empty', 'plain_axes', 'arrows', 'single_arrow', 'image'].includes(type)) {
            return this.createEmpty(type, id, name);
        }

        // Handle armature
        if (['single_bone', 'human_(meta-rig)'].includes(type)) {
            return this.createArmature(type, id, name);
        }

        // Handle lattice
        if (type === 'lattice') {
            return this.createLattice(id, name);
        }

        // Handle light probes
        if (['reflection_cubemap', 'reflection_plane', 'irradiance_volume'].includes(type)) {
            return this.createLightProbe(type, id, name);
        }

        // Handle camera
        if (type === 'camera') {
            return this.createCamera(id, name);
        }

        // Handle speaker
        if (type === 'speaker') {
            return this.createSpeaker(id, name);
        }

        // Handle force fields
        const forceFields = ['force', 'wind', 'vortex', 'magnetic', 'harmonic', 'charge',
            'lennard-jones', 'texture', 'curve_guide', 'boid', 'turbulence',
            'drag', 'fluid_flow'];
        if (forceFields.includes(type)) {
            return this.createForceField(type, id, name);
        }

        const geometry = this.createGeometry(type);

        if (!geometry) {
            throw new Error(`Failed to create geometry for type: ${type}`);
        }

        // Check if it's a helper
        if (geometry instanceof THREE.GridHelper) {
            return geometry;
        }

        // Determine if it's a curve/line or a solid mesh
        const isCurve = ['bezier', 'nurbs_curve', 'nurbs_circle', 'path', 'stroke'].includes(type);

        if (isCurve) {
            // Create line for curves and strokes
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

            // Special handling for metaball plane
            if (type === 'plane' && name.includes('metaball')) {
                mesh.scale.set(0.8, 0.8, 0.8);
            }

            // Default position
            mesh.position.set(0, 0, 0);

            return mesh;
        }
    }

    // Helper: Create light object
    private static createLight(type: string, id: number, name: string): THREE.Object3D {
        let light: THREE.Light;

        switch (type) {
            case 'point':
                light = new THREE.PointLight(0xffffff, 1, 100);
                break;
            case 'sun':
                light = new THREE.DirectionalLight(0xffffff, 1);
                break;
            case 'spot':
                light = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6);
                break;
            case 'area':
                light = new THREE.RectAreaLight(0xffffff, 1, 4, 4);
                break;
            default:
                light = new THREE.PointLight(0xffffff, 1);
        }

        light.userData.id = id;
        light.name = name;

        // Add visual helper
        const helperGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const helperMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const helper = new THREE.Mesh(helperGeometry, helperMaterial);
        light.add(helper);

        return light;
    }

    // Helper: Create empty object
    private static createEmpty(type: string, id: number, name: string): THREE.Object3D {
        const empty = new THREE.Group();
        empty.userData.id = id;
        empty.name = name;

        let helper: THREE.Object3D;

        switch (type) {
            case 'plain_axes':
                helper = new THREE.AxesHelper(1);
                break;
            case 'arrows':
                helper = new THREE.ArrowHelper(
                    new THREE.Vector3(0, 1, 0),
                    new THREE.Vector3(0, 0, 0),
                    1,
                    0x000000
                );
                break;
            case 'single_arrow':
                helper = new THREE.ArrowHelper(
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(0, 0, 0),
                    1,
                    0x000000
                );
                break;
            case 'image':
                // Create plane for image placeholder
                const planeGeo = new THREE.PlaneGeometry(1, 1);
                const planeMat = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
                helper = new THREE.Mesh(planeGeo, planeMat);
                break;
            default:
                helper = new THREE.AxesHelper(0.5);
        }

        empty.add(helper);
        return empty;
    }

    // Helper: Create armature
    private static createArmature(type: string, id: number, name: string): THREE.Object3D {
        const armature = new THREE.Group();
        armature.userData.id = id;
        armature.name = name;

        if (type === 'single_bone') {
            // Single bone visualization
            const boneGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
            const boneMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            const bone = new THREE.Mesh(boneGeometry, boneMaterial);
            bone.position.y = 0.5;
            armature.add(bone);
        } else {
            // Human meta-rig (simplified skeleton)
            const boneMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

            // Spine
            const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), boneMaterial);
            spine.position.y = 0.75;
            armature.add(spine);

            // Arms
            const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), boneMaterial);
            leftArm.position.set(-0.5, 0.7, 0);
            leftArm.rotation.z = Math.PI / 2;
            armature.add(leftArm);

            const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), boneMaterial);
            rightArm.position.set(0.5, 0.7, 0);
            rightArm.rotation.z = Math.PI / 2;
            armature.add(rightArm);
        }

        return armature;
    }

    // Helper: Create lattice
    private static createLattice(id: number, name: string): THREE.Object3D {
        const lattice = new THREE.Group();
        lattice.userData.id = id;
        lattice.name = name;

        // Create wireframe box to represent lattice
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);

        // Add control points
        const pointGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const point = new THREE.Mesh(pointGeometry, pointMaterial);
                    point.position.set(x, y, z);
                    lattice.add(point);
                }
            }
        }

        lattice.add(wireframe);
        return lattice;
    }

    // Helper: Create light probe
    private static createLightProbe(type: string, id: number, name: string): THREE.Object3D {
        const probe = new THREE.Group();
        probe.userData.id = id;
        probe.name = name;

        let helper: THREE.Object3D;

        switch (type) {
            case 'reflection_cubemap':
                // Cubemap probe - wireframe cube
                const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
                const cubeEdges = new THREE.EdgesGeometry(cubeGeo);
                helper = new THREE.LineSegments(cubeEdges, new THREE.LineBasicMaterial({ color: 0x00ffff }));
                break;
            case 'reflection_plane':
                // Plane probe - grid plane
                const planeGeo = new THREE.PlaneGeometry(2, 2, 4, 4);
                const planeEdges = new THREE.EdgesGeometry(planeGeo);
                helper = new THREE.LineSegments(planeEdges, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
                break;
            case 'irradiance_volume':
                // Volume probe - wireframe sphere
                const sphereGeo = new THREE.SphereGeometry(0.8, 8, 8);
                const sphereEdges = new THREE.EdgesGeometry(sphereGeo);
                helper = new THREE.LineSegments(sphereEdges, new THREE.LineBasicMaterial({ color: 0xffaa00 }));
                break;
            default:
                helper = new THREE.AxesHelper(0.5);
        }

        probe.add(helper);
        return probe;
    }

    // Helper: Create camera
    private static createCamera(id: number, name: string): THREE.Object3D {
        const cameraGroup = new THREE.Group();
        cameraGroup.userData.id = id;
        cameraGroup.name = name;

        // Camera body (pyramid)
        const bodyGeometry = new THREE.ConeGeometry(0.3, 0.8, 4);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;

        // Camera lens (cylinder)
        const lensGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16);
        const lensMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
        const lens = new THREE.Mesh(lensGeometry, lensMaterial);
        lens.rotation.z = Math.PI / 2;
        lens.position.z = 0.5;

        cameraGroup.add(body);
        cameraGroup.add(lens);

        return cameraGroup;
    }

    // Helper: Create speaker
    private static createSpeaker(id: number, name: string): THREE.Object3D {
        const speaker = new THREE.Group();
        speaker.userData.id = id;
        speaker.name = name;

        // Speaker cone
        const coneGeometry = new THREE.ConeGeometry(0.4, 0.6, 32);
        const coneMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.rotation.x = Math.PI / 2;

        // Sound waves visualization
        for (let i = 1; i <= 3; i++) {
            const waveGeometry = new THREE.TorusGeometry(0.3 * i, 0.02, 8, 32);
            const waveMaterial = new THREE.MeshBasicMaterial({
                color: 0x00aaff,
                transparent: true,
                opacity: 0.4
            });
            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.rotation.y = Math.PI / 2;
            wave.position.z = 0.3 * i;
            speaker.add(wave);
        }

        speaker.add(cone);
        return speaker;
    }

    // Helper: Create force field
    private static createForceField(type: string, id: number, name: string): THREE.Object3D {
        const forceField = new THREE.Group();
        forceField.userData.id = id;
        forceField.name = name;

        let helper: THREE.Object3D;
        let color = 0xff0000;

        switch (type) {
            case 'force':
                color = 0xff0000;
                helper = this.createForceArrows(color);
                break;
            case 'wind':
                color = 0x00ff00;
                helper = this.createWindLines();
                break;
            case 'vortex':
                color = 0xff00ff;
                helper = this.createVortexSpiral();
                break;
            case 'magnetic':
                color = 0x0000ff;
                helper = this.createMagneticField();
                break;
            case 'harmonic':
                color = 0xffff00;
                helper = this.createHarmonicWaves();
                break;
            case 'charge':
                color = 0x00ffff;
                helper = this.createChargeField();
                break;
            case 'lennard-jones':
                color = 0xff8800;
                helper = this.createLennardJonesField();
                break;
            case 'texture':
                color = 0x8800ff;
                helper = new THREE.Mesh(
                    new THREE.PlaneGeometry(1, 1),
                    new THREE.MeshBasicMaterial({ color, wireframe: true })
                );
                break;
            case 'curve_guide':
                color = 0x00ff88;
                helper = this.createCurveGuide();
                break;
            case 'boid':
                color = 0xff0088;
                helper = this.createBoidField();
                break;
            case 'turbulence':
                color = 0x88ff00;
                helper = this.createTurbulenceField();
                break;
            case 'drag':
                color = 0x0088ff;
                helper = this.createDragField();
                break;
            case 'fluid_flow':
                color = 0x00aaff;
                helper = this.createFluidFlowField();
                break;
            default:
                helper = new THREE.AxesHelper(0.5);
        }

        forceField.add(helper);
        return forceField;
    }

    // Force field helpers
    private static createForceArrows(color: number): THREE.Object3D {
        const group = new THREE.Group();
        const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 0),
            1,
            color
        );
        group.add(arrow);
        return group;
    }

    private static createWindLines(): THREE.Object3D {
        const group = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const points = [
                new THREE.Vector3(-1, (i - 2) * 0.3, 0),
                new THREE.Vector3(1, (i - 2) * 0.3, 0)
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
            group.add(line);
        }
        return group;
    }

    private static createVortexSpiral(): THREE.Object3D {
        const points = [];
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const angle = t * Math.PI * 6;
            const radius = t * 0.8;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                t * 2 - 1,
                Math.sin(angle) * radius
            ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff00ff }));
    }

    private static createMagneticField(): THREE.Object3D {
        const group = new THREE.Group();
        // Create circular field lines
        for (let r = 0.3; r <= 1; r += 0.35) {
            const curve = new THREE.EllipseCurve(0, 0, r, r, 0, 2 * Math.PI, false, 0);
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(
                points.map(p => new THREE.Vector3(p.x, p.y, 0))
            );
            const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));
            group.add(line);
        }
        return group;
    }

    private static createHarmonicWaves(): THREE.Object3D {
        const points = [];
        for (let i = 0; i <= 50; i++) {
            const x = (i / 50) * 2 - 1;
            const y = Math.sin(i / 5) * 0.5;
            points.push(new THREE.Vector3(x, y, 0));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffff00 }));
    }

    private static createChargeField(): THREE.Object3D {
        const group = new THREE.Group();
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00ffff })
        );
        group.add(sphere);
        return group;
    }

    private static createLennardJonesField(): THREE.Object3D {
        const group = new THREE.Group();
        // Concentric circles to represent potential
        for (let i = 1; i <= 3; i++) {
            const torus = new THREE.Mesh(
                new THREE.TorusGeometry(0.3 * i, 0.02, 8, 32),
                new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true })
            );
            group.add(torus);
        }
        return group;
    }

    private static createCurveGuide(): THREE.Object3D {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-0.5, 0.5, 0),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.5, -0.5, 0),
            new THREE.Vector3(1, 0, 0)
        ]);
        const curvePoints = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x00ff88 }));
    }

    private static createBoidField(): THREE.Object3D {
        const group = new THREE.Group();
        // Create small triangles representing boids
        for (let i = 0; i < 5; i++) {
            const shape = new THREE.Shape();
            shape.moveTo(0, 0.1);
            shape.lineTo(-0.05, -0.05);
            shape.lineTo(0.05, -0.05);
            const geometry = new THREE.ShapeGeometry(shape);
            const boid = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0088 }));
            boid.position.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0);
            boid.rotation.z = Math.random() * Math.PI * 2;
            group.add(boid);
        }
        return group;
    }

    private static createTurbulenceField(): THREE.Object3D {
        const points = [];
        for (let i = 0; i <= 30; i++) {
            const angle = (i / 30) * Math.PI * 4;
            const radius = 0.5 + Math.random() * 0.3;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                (Math.random() - 0.5) * 0.5
            ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x88ff00 }));
    }

    private static createDragField(): THREE.Object3D {
        const group = new THREE.Group();
        // Arrows pointing inward
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const arrow = new THREE.ArrowHelper(
                new THREE.Vector3(-Math.cos(angle), -Math.sin(angle), 0),
                new THREE.Vector3(Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, 0),
                0.5,
                0x0088ff
            );
            group.add(arrow);
        }
        return group;
    }

    private static createFluidFlowField(): THREE.Object3D {
        const group = new THREE.Group();
        // Streamlines
        for (let y = -0.5; y <= 0.5; y += 0.25) {
            const points = [];
            for (let x = -1; x <= 1; x += 0.1) {
                const flow = Math.sin(x * 2) * 0.2;
                points.push(new THREE.Vector3(x, y + flow, 0));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x00aaff }));
            group.add(line);
        }
        return group;
    }
}
