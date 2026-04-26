import pymeshlab
import os

class SuperRefiner:
    """
    Elite Mesh Refinement Engine using PyMeshLab.
    Performs remeshing, hole filling, and topological cleanup.
    """
    def __init__(self, input_path):
        self.ms = pymeshlab.MeshSet()
        self.ms.load_new_mesh(input_path)
        self.input_path = input_path

    def refine(self, target_faces=20000):
        print(f"[*] Refining mesh: {self.input_path}")
        
        # 1. Remove isolated components (noise)
        self.ms.apply_filter('meshing_remove_connected_components_by_diameter', mincomponentdiag=pymeshlab.Percentage(5))
        
        # 2. Fill Holes
        self.ms.apply_filter('meshing_fill_holes', maxholesize=100)
        
        # 3. SOTA Remeshing (Isotropic)
        self.ms.apply_filter('meshing_isotropic_explicit_remeshing', targetlen=pymeshlab.Percentage(0.5))
        
        # 4. Simplification to target face count
        self.ms.apply_filter('meshing_decimation_quadric_edge_collapse', targetfacenum=target_faces)
        
        # 5. Smooth normals
        self.ms.apply_filter('compute_normal_per_vertex')
        
        output_path = self.input_path.replace(".glb", "_refined.glb")
        self.ms.save_current_mesh(output_path)
        print(f"[+] Refinement complete: {output_path}")
        return output_path

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=str, required=True)
    args = parser.parse_args()
    
    refiner = SuperRefiner(args.input)
    refiner.refine()
