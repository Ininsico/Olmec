# 🏺 Olmec 3D: God Mode AI Suite

Welcome to the ultimate 3D reconstruction pipeline. This suite has been upgraded to be the "best of the best," fixing previous bugs and adding professional-grade tools.

## 🚀 Quick Start (Web UI)
Launch the interactive web interface to generate 3D models from images in your browser:
```bash
python web_app.py
```

## 🛠️ The Mastermind CLI
Use `Mastermind.py` for all your AI needs. It's a unified controller for training and inference.

**Generate a 3D model:**
```bash
python Mastermind.py --image data/input.png --weights models/latest.pt
```

## 💎 Elite Mesh Refinement
We've added a `SuperRefiner` that uses SOTA topology optimization.
- **Isotropic Remeshing**: Creates a perfectly uniform vertex distribution.
- **Hole Filling**: Automatically repairs broken geometry.
- **Decimation**: Reduces polygon count while preserving detail.

**Run Refiner independently:**
```bash
python tools/refiner.py --input output.glb
```

## 🐞 Fixed Issues (The "Shit Show" cleanup)
- Fixed `VisionEncoder` vs `MultiScaleEncoder` class mismatch.
- Fixed missing `numpy` and `torch.nn.functional` imports in the encoder.
- Fixed `generate_mesh` method name error in `inference.py`.
- Corrected input tensor dimensions for single-image inference.

## 🧪 Future SOTA Roadmap
- [ ] **Text-to-3D**: Integration with Stable Diffusion for prompt-based generation.
- [ ] **Texture Refinement**: Diffusion-based UV texture generation.
- [ ] **Real-time Splatting**: Direct Gaussian Splatting export.

---
*Built for Ininsico(3D) by Antigravity AI.*
