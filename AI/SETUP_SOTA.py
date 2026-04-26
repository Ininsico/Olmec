import os
import urllib.request

def setup():
    os.makedirs("data/images", exist_ok=True)
    samples = {
        "knight.png": "https://raw.githubusercontent.com/VAST-AI-Research/TripoSR/main/figures/input_images/knight.png",
        "chair.png": "https://raw.githubusercontent.com/VAST-AI-Research/TripoSR/main/figures/input_images/chair.png",
        "teapot.png": "https://raw.githubusercontent.com/VAST-AI-Research/TripoSR/main/figures/input_images/teapot.png"
    }
    print("[*] Fetching High-Quality SOTA Sample Images...")
    for name, url in samples.items():
        path = os.path.join("data/images", name)
        if not os.path.exists(path):
            urllib.request.urlretrieve(url, path)
            print(f"[+] Downloaded: {name}")
    print("[!] Setup Complete. Run web_app.py to start generating.")

if __name__ == "__main__":
    setup()
