import os
import torch
import argparse
from PIL import Image
from torchvision import transforms
from models.model_lrm import OlmecLRM
from utils.mesh import MeshEngine

class OlmecMastermind:
    def __init__(self, mode="inference", model_path=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.mode = mode
        self.model = None
        if mode == "inference":
            self._ensure_weights(model_path)
            self._init_model(model_path or "models/olmec_sota_latest.pt")

    def _ensure_weights(self, path):
        if path and os.path.exists(path): return
        target = "models/olmec_sota_latest.pt"
        if os.path.exists(target): return
        os.makedirs("models", exist_ok=True)
        print("[*] Downloading SOTA Olmec Weights from Hub...")
        import urllib.request
        # Downloading a high-quality LRM base model (Placeholder for real SOTA endpoint)
        url = "https://huggingface.co/stabilityai/TripoSR/resolve/main/model.ckpt"
        urllib.request.urlretrieve(url, target)
        print("[+] Weights ready.")

    def _init_model(self, model_path):
        self.model = OlmecLRM().to(self.device)
        if model_path and os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()

    def generate_3d(self, image_path=None, text=None, resolution=128, output_name="output.glb"):
        input_tensor = None
        if image_path:
            img = Image.open(image_path).convert("RGB")
            transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            input_tensor = transform(img).unsqueeze(0).to(self.device).unsqueeze(1) 

        with torch.no_grad():
            v, f = self.model.generate(i=input_tensor, text=text, res=resolution)

        engine = MeshEngine(vertices=v, faces=f)
        engine.poisson_recon(depth=10)
        engine.taubin_smooth(iters=10)
        engine.export(output_name)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", type=str, default="inference", choices=["inference", "train"])
    parser.add_argument("--image", type=str)
    parser.add_argument("--text", type=str)
    parser.add_argument("--weights", type=str)
    parser.add_argument("--res", type=int, default=128)
    parser.add_argument("--output", type=str, default="gen_sota.glb")
    args = parser.parse_args()
    master = OlmecMastermind(mode=args.mode, model_path=args.weights)
    if args.mode == "inference":
        master.generate_3d(args.image, text=args.text, resolution=args.res, output_name=args.output)
