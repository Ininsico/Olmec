import trimesh
import numpy as np
import open3d as o3d

class MeshEngine:
    def __init__(self, vertices=None, faces=None):
        if vertices is not None:
            self.mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
        else:
            self.mesh = None

    def poisson_recon(self, depth=12, density_threshold=0.1):
        pcd = o3d.geometry.PointCloud()
        if len(self.mesh.faces) == 0:
            pcd.points = o3d.utility.Vector3dVector(np.asarray(self.mesh.vertices))
        else:
            pcd = self.mesh.as_open3d
        pcd.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))
        m, d = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd, depth=depth)
        v = np.asarray(m.vertices)
        f = np.asarray(m.triangles)
        d = np.asarray(d)
        mask = d > np.quantile(d, density_threshold)
        m.remove_vertices_by_mask(~mask)
        self.mesh = trimesh.Trimesh(vertices=np.asarray(m.vertices), faces=np.asarray(m.triangles))
        return self.mesh

    def laplacian_smooth(self, iters=10):
        o3d_m = self.mesh.as_open3d
        o3d_m = o3d_m.filter_smooth_laplacian(number_of_iterations=iters)
        self.mesh = trimesh.Trimesh(vertices=np.asarray(o3d_m.vertices), faces=np.asarray(o3d_m.triangles))
        return self.mesh

    def taubin_smooth(self, iters=10):
        o3d_m = self.mesh.as_open3d
        o3d_m = o3d_m.filter_smooth_taubin(number_of_iterations=iters)
        self.mesh = trimesh.Trimesh(vertices=np.asarray(o3d_m.vertices), faces=np.asarray(o3d_m.triangles))
        return self.mesh

    def export(self, path):
        self.mesh.export(path)
