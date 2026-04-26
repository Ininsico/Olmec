import gradio as gr
import os
from Mastermind import OlmecMastermind

ai = OlmecMastermind(mode="inference")

def process(img, text):
    if img is None and not text: return None
    tmp = "tmp.png"
    if img: img.save(tmp)
    out = "web_output.glb"
    ai.generate_3d(tmp, text=text, resolution=128, output_name=out)
    return out

with gr.Blocks(title="Olmec 3D SOTA") as demo:
    gr.Markdown("# Olmec 3D: SOTA Multi-modal Generation")
    with gr.Row():
        with gr.Column():
            input_img = gr.Image(type="pil", label="Image Context")
            input_text = gr.Textbox(label="Text Prompt", placeholder="Describe the object...")
            btn = gr.Button("GENERATE 3D MODEL", variant="primary")
        with gr.Column():
            output_3d = gr.Model3D(label="Generated SOTA Mesh")
    btn.click(fn=process, inputs=[input_img, input_text], outputs=output_3d)

if __name__ == "__main__":
    demo.launch()
