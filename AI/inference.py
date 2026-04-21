import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms
from models.model_lrm import OlmecLRM
from utils.mesh import extract_mesh, export_to_glb

def main(image_path, model_path=None):
    # Setup Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load Model
    model = OlmecLRM().to(device)
    if model_path:
        model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()

    # Preprocess Image
    img = Image.open(image_path).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    input_tensor = transform(img).unsqueeze(0).to(device)

    # Generate 3D Data
    print("Generating 3D model...")
    with torch.no_grad():
        v, f = model.generate_mesh(input_tensor, resolution=128)

    # Extract & Save Mesh
    from utils.mesh import MeshEngine
    engine = MeshEngine(vertices=v, faces=f)
    print("Applying Poisson Manifold Reconstruction...")
    engine.poisson_recon(depth=9)
    engine.taubin_smooth(iters=5)
    
    output_file = "generated_model_sota.glb"
    engine.export(output_file)
    print(f"Success! SOTA Model saved to {output_file}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str, required=True, help="Path to input image")
    parser.add_argument("--model", type=str, default=None, help="Path to trained weights (.pt)")
    args = parser.parse_args()
    
    main(args.image, args.model)
