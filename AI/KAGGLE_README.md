# Training Olmec 3D on Kaggle

Follow these steps to train your 3D generation model on Kaggle:

## 1. Setup Kaggle Notebook
1. Create a new Notebook on Kaggle.
2. In the **Settings** (right sidebar), enable **GPU T4 x2** (Accelerator).
3. Enable **Internet Access**.

## 2. Upload the Code
You can upload the `AI/` folder to a Kaggle Dataset or copy-paste the files into the notebook cells.

## 3. Install Dependencies
Run this in a cell:
```bash
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

## 4. Dataset
You will need a 3D dataset. I recommend using the **Objaverse** dataset renders. 
- Search for "Objaverse Renders" in Kaggle Datasets and add it to your notebook.
- Update the `train.py` dataset path to point to `/kaggle/input/...`

## 5. Start Training
Run the training script using `accelerate`:
```bash
accelerate launch train.py
```

## 6. Exporting Weights
After training, download the `.pt` files from the `/kaggle/working/checkpoints` directory. Use these with `inference.py` on your local machine to generate models!

---
**Model Specs:**
- **Mode:** Large Reconstruction Model (LRM)
- **Input:** 224x224 RGB Image
- **Output:** 128^3 Density Grid -> OBJ/GLB Mesh
- **Avg Inference Time:** ~200ms on GPU
