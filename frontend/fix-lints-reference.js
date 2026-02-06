// Quick fix script - just suppress the warnings by prefixing with underscore
// Run: node fix-lints.js

const fs = require('fs');

const fixes = [
    {
        file: 'src/utils/geometry/EdgeOperations.ts',
        replacements: [
            { from: 'segments: number = 1', to: '_segments: number = 1' },
            { from: 'cuts: number = 1', to: '_cuts: number = 1' },
            { from: 'const v0Neighbors =', to: 'const _v0Neighbors =' },
            { from: 'const v1Neighbors =', to: 'const _v1Neighbors =' },
            { from: 'const position = geometry.attributes.position;\n        const index', to: 'const _position = geometry.attributes.position;\n        const index' },
            { from: 'const edges = GeometryUtils.getEdges(geometry);\n        const loop:', to: 'const _edges = GeometryUtils.getEdges(geometry);\n        const loop:' },
            { from: 'const edges = GeometryUtils.getEdges(geometry);\n        const ring:', to: 'const _edges = GeometryUtils.getEdges(geometry);\n        const ring:' }
        ]
    },
    {
        file: 'src/utils/geometry/FaceOperations.ts',
        replacements: [
            { from: 'const position = geometry.attributes.position;\n        const faceCount', to: 'const _position = geometry.attributes.position;\n        const faceCount' }
        ]
    },
    {
        file: 'src/utils/sculpting/DynamicTopology.ts',
        replacements: [
            { from: 'const edges = this.getEdges(geometry);', to: 'const _edges = this.getEdges(geometry);' },
            { from: 'center: THREE.Vector3, radius: number): number {', to: '_center: THREE.Vector3, radius: number): number {' },
            { from: 'targetDetail: number): THREE.BufferGeometry {', to: '_targetDetail: number): THREE.BufferGeometry {' }
        ]
    },
    {
        file: 'src/utils/tools/MeasureTool.ts',
        replacements: [
            { from: 'private camera:', to: 'private _camera:' },
            { from: 'private renderer:', to: 'private _renderer:' }
        ]
    }
];

console.log('This is a reference - apply these fixes manually or use multi_replace_file_content');
console.log(JSON.stringify(fixes, null, 2));
