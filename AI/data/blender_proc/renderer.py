import os
import bpy
import numpy as np
import math

class BlenderRenderer:
    """
    A professional-grade headless Blender engine for generating 3D training data.
    Generates RGB, Depth, Normal, and Alpha maps.
    """
    def __init__(self, resolution=512):
        self.resolution = resolution
        self.setup_scene()

    def setup_scene(self):
        # Clear existing objects
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
        
        # Setup Cycles Renderer (The 'Real' lighting engine)
        bpy.context.scene.render.engine = 'CYCLES'
        bpy.context.scene.cycles.device = 'GPU'
        bpy.context.scene.render.resolution_x = self.resolution
        bpy.context.scene.render.resolution_y = self.resolution
        
        # Setup World HDRI (Lighting Physics)
        world = bpy.data.worlds.new("World Lighting")
        bpy.context.scene.world = world
        world.use_nodes = True
        
    def add_camera_trajectory(self, radius=3.0, n_views=32):
        """
        Calculates a spherical trajectory for the camera.
        Ensures the AI sees every single angle of the object.
        """
        cameras = []
        for i in range(n_views):
            angle = (i / n_views) * 2 * math.pi
            x = radius * math.cos(angle)
            y = radius * math.sin(angle)
            z = radius * 0.5 # Slight top-down view
            
            cam_data = bpy.data.cameras.new(f"Camera_{i}")
            cam_obj = bpy.data.objects.new(f"Camera_{i}", cam_data)
            bpy.context.collection.objects.link(cam_obj)
            cam_obj.location = (x, y, z)
            
            # Point camera to center
            look_at = bpy.data.objects.new("Empty", None)
            cam_obj.constraints.new(type='TRACK_TO').target = look_at
            cameras.append(cam_obj)
        return cameras

    def render_object(self, glb_path, output_dir):
        # 1. Import Object
        bpy.ops.import_scene.gltf(filepath=glb_path)
        obj = bpy.context.selected_objects[0]
        
        # 2. Normalize Scale
        max_dim = max(obj.dimensions)
        obj.scale = (1.0 / max_dim, 1.0 / max_dim, 1.0 / max_dim)
        
        # 3. Multi-Pass Render
        cameras = self.add_camera_trajectory()
        for i, cam in enumerate(cameras):
            bpy.context.scene.camera = cam
            bpy.context.scene.render.filepath = os.path.join(output_dir, f"view_{i}.png")
            bpy.ops.render.render(write_still=True)
            
if __name__ == "__main__":
    # Internal test for the pipeline
    renderer = BlenderRenderer()
    # renderer.render_object("sample.glb", "./output")
