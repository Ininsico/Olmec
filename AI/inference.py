import os
import argparse
from olmec_math_engine import OlmecMathEngine

def main(image_path, refine=False, resolution=128):
    if not os.path.exists(image_path):
        print(f"[!] Image not found: {image_path}")
        return
    print(f"[*] Olmec 3D Reconstruction (Mathematical Algorithm)")
    print(f"[*] Input: {image_path}")
    engine = OlmecMathEngine(grid_res=64)
    mesh = engine.reconstruct_from_image(image_path, resolution=resolution, smooth=True)
    output_file = "generated_model.glb"
    engine.export_mesh(mesh, output_file)
    if refine:
        try:
            from tools.refiner import SuperRefiner
            print("[*] Running SuperRefiner...")
            refiner = SuperRefiner(output_file)
            refiner.refine()
        except ImportError:
            print("[!] SuperRefiner not available")
    print(f"[+] Done: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str, required=True, help="Path to input image")
    parser.add_argument("--model", type=str, default=None, help="Ignored in math mode")
    parser.add_argument("--refine", action="store_true", help="Enable mesh refinement")
    parser.add_argument("--res", type=int, default=128, help="Resolution")
    args = parser.parse_args()
    main(args.image, args.refine, args.res)
