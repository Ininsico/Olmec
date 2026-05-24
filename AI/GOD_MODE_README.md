# Olmec 3D: Mathematical 3D Reconstruction Engine

Pure mathematical 3D reconstruction from single images.
No neural networks. No pattern recognition. No training data dependencies.

## Algorithm Pipeline

1. **Shape from Shading** - Recovers surface normals from image intensity using photometric constraints
2. **Frankot-Chellappa Integration** - Integrates normal field into depth map via FFT
3. **Point Cloud Generation** - Projects depth map into 3D space using camera geometry
4. **SDF Computation** - Signed Distance Function via KD-tree nearest neighbor + RBF interpolation
5. **Marching Cubes** - Extracts triangle mesh from SDF grid
6. **Poisson Surface Reconstruction** - Refines mesh with manifold surface fitting
7. **Taubin Smoothing** - Applies curvature-flow smoothing for clean geometry

## Mathematical Foundation

- Surface normals from image gradients: n = (-∂I/∂x, -∂I/∂y, 1) / |...|
- Depth via Frankot-Chellappa: Z = F^{-1}( (-juP - jvQ) / (u^2 + v^2) )
- SDF via KD-tree query: φ(x) = sign(x) * min||x - x_i||
- Mesh via Marching Cubes: Extract isosurface φ(x) = 0

## Quick Start

```bash
# Web UI
python web_app.py

# CLI
python Mastermind.py --image data/sample.png --output result.glb

# API
python OlmecAPI.py
curl -X POST -F "file=@image.png" http://localhost:8000/generate

# Dashboard
python dashboard_server.py
```

No weights to download. No model checkpoints. Just math.
