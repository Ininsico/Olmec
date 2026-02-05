# Geometry Operations - Quick Reference

**Fast lookup for all operations** ⚡

---

## 🔺 Vertex Operations

| Operation | Parameters | Description |
|-----------|------------|-------------|
| `extrudeVertices` | indices, distance | Move along normals |
| `moveVertices` | indices, offset | Translate by vector |
| `scaleVertices` | indices, scale, center? | Scale from point |
| `mergeVertices` | indices | Average position |
| `smoothVertices` | indices, factor | Laplacian smooth |
| `flattenVertices` | indices, axis | Project to plane |
| `alignVertices` | indices, axis, value | Snap to axis |
| `snapVerticesToGrid` | indices, gridSize | Grid snapping |
| `bevelVertices` | indices, amount | Chamfer corners |
| `connectVertices` | v0, v1 | Create edge |
| `dissolveVertices` | indices | Remove & merge |

## 📏 Edge Operations

| Operation | Parameters | Description |
|-----------|------------|-------------|
| `extrudeEdges` | keys, distance | Extrude outward |
| `bevelEdges` | keys, amount, segments | Smooth chamfer |
| `loopCut` | key, position | Add edge loop |
| `subdivideEdge` | key, cuts | Multiple cuts |
| `slideEdge` | key, factor | Slide on surface |
| `bridgeEdges` | key1, key2 | Connect edges |
| `collapseEdge` | key | Merge to midpoint |
| `dissolveEdge` | key | Merge faces |
| `offsetEdge` | key, distance | Move perpendicular |
| `creaseEdge` | key, amount | Sharp rendering |

## 🔷 Face Operations

| Operation | Parameters | Description |
|-----------|------------|-------------|
| `extrudeFaces` | indices, distance, scale | Extrude with scale |
| `insetFaces` | indices, amount, depth | Inner faces |
| `subdivideFaces` | indices, iterations | Loop subdivision |
| `deleteFaces` | indices | Remove faces |
| `flipFaceNormals` | indices | Reverse winding |
| `triangulateFaces` | geometry | To triangles |
| `pokeFaces` | indices | Star from center |
| `solidifyFaces` | indices, thickness | Add thickness |
| `gridFillFace` | index, gridX, gridY | Parametric grid |
| `rotateFaces` | indices, angle, axis | Rotate around center |
| `scaleFaces` | indices, scale | Scale from center |
| `detachFaces` | indices | Separate geometry |

## 🔄 Subdivision

| Algorithm | Parameters | Best For |
|-----------|------------|----------|
| Catmull-Clark | iterations | Smooth organic shapes |
| Doo-Sabin | iterations | Quad meshes |
| Butterfly | iterations | Preserving features |
| √3 | iterations | Uniform triangles |
| Adaptive | threshold, iterations | Detail regions |
| Mid-Edge | iterations | Simple subdivision |

## 🔧 Utilities

| Operation | Returns | Description |
|-----------|---------|-------------|
| `getVertexNeighbors` | number[] | Connected vertices |
| `getFacesContainingVertex` | number[] | Faces using vertex |
| `getEdges` | Map | Edge data structure |
| `calculateVertexNormal` | Vector3 | Vertex normal |
| `getFaceNormal` | Vector3 | Face normal |
| `mergeVertices` | Geometry | Weld vertices |
| `toIndexed` | Geometry | Convert to indexed |
| `laplacianSmooth` | void | Smooth in-place |

## 🚀 Advanced

| Operation | Returns | Description |
|-----------|---------|-------------|
| `decimateMesh` | Geometry | Reduce polygons |
| `geodesicDistance` | number | Surface distance |
| `convexHull` | Geometry | Convex boundary |
| `computeCurvature` | Float32Array | Gaussian curvature |
| `remeshUniform` | Geometry | Uniform triangles |
| `computeAmbientOcclusion` | Float32Array | AO values |

## 📊 Analysis

| Metric | Type | Description |
|--------|------|-------------|
| `computeQualityMetrics` | Object | All statistics |
| `detectSelfIntersections` | number[] | Overlapping faces |
| `findConnectedComponents` | number[][] | Mesh islands |
| `isManifold` | boolean | Topology valid |
| `computeVertexValence` | Uint32Array | Edge counts |
| `findBoundaryLoops` | number[][] | Boundary edges |
| `computeGenus` | number | Topological holes |
| `detectFlippedNormals` | number[] | Wrong orientation |
| `computeAdjacencyMatrix` | Map | Face connectivity |

---

## 📝 Common Patterns

### Typical Workflow
```typescript
// 1. Import modules
import { FaceOperations, SubdivisionAlgorithms } from './geometry';

// 2. Select elements
const selectedFaces = [0, 1, 2, 3];

// 3. Apply operation
const extruded = FaceOperations.extrudeFaces(mesh, selectedFaces, 0.5);

// 4. Smooth if needed
const smooth = SubdivisionAlgorithms.butterflySubdivision(extruded, 1);
```

### Edge Key Format
```typescript
// Edges are identified by "min_max" format
const edge = "3_7";  // Connect vertex 3 and 7
```

### Axis Values
```typescript
'x' | 'y' | 'z'  // For flatten, align operations
```

---

## ⚡ Performance Tips

1. **Use indexed geometry** for large meshes
2. **Batch operations** when possible
3. **Limit subdivision** iterations (1-3 usually sufficient)
4. **Use adaptive** subdivision for efficiency
5. **Cache results** of expensive computations

---

## 🐛 Common Gotchas

⚠️ **Non-indexed geometry** - Convert first with `toIndexed()`  
⚠️ **Edge keys** - Use `getEdgeKey()` for consistent format  
⚠️ **Degenerate faces** - Check with quality metrics  
⚠️ **Scale factor 0** - Avoid, causes degenerate geometry  
⚠️ **Too many iterations** - Subdivision grows exponentially  

---

## 🎯 Decision Guide

**Need smooth surfaces?**  
→ Catmull-Clark subdivision

**Need to reduce polygons?**  
→ `decimateMesh()`

**Need feature preservation?**  
→ Butterfly or Adaptive subdivision

**Need uniform triangles?**  
→ √3 subdivision or `remeshUniform()`

**Need quality check?**  
→ `computeQualityMetrics()`

**Need topology fix?**  
→ Check `isManifold()`, then `mergeVertices()`

---

**All operations are production-ready and fully implemented!**
