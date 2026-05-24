import gradio as gr
import os
from Mastermind import OlmecMastermind

ai = OlmecMastermind(mode="inference")

def process(img, text):
    if img is None:
        return None
    tmp = "tmp_input.png"
    img.save(tmp)
    out = "web_output.glb"
    ai.generate_3d(tmp, text=text, resolution=128, output_name=out)
    return out

with gr.Blocks(title="Olmec 3D - Mathematical Reconstruction") as demo:
    gr.Markdown("# Olmec 3D: Mathematical 3D Reconstruction")
    gr.Markdown("Deterministic algorithm - Shape from Shading + SDF + Marching Cubes")
    with gr.Row():
        with gr.Column():
            input_img = gr.Image(type="pil", label="Input Image")
            btn = gr.Button("GENERATE 3D MODEL", variant="primary")
        with gr.Column():
            output_3d = gr.Model3D(label="Generated 3D Mesh")
    btn.click(fn=process, inputs=[input_img], outputs=output_3d)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
