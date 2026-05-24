import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from scipy import ndimage
from skimage import measure, segmentation, color, filters, morphology
import trimesh
import open3d as o3d

class ShapeFromShading:
    def __init__(self):
        self.light_dir = np.array([0.0, 0.0, 1.0])
        self.albedo = 0.8

    def estimate_normals(self, image):
        img = np.array(image.convert("L")).astype(np.float64) / 255.0
        gx = filters.sobel_h(img)
        gy = filters.sobel_v(img)
        g_mag = np.sqrt(gx**2 + gy**2) + 1e-8
        nx = -gx / g_mag
        ny = -gy / g_mag
        nz = np.sqrt(np.maximum(0.0, 1.0 - nx**2 - ny**2))
        normals = np.stack([nx, ny, nz], axis=-1)
        normals = normals / (np.linalg.norm(normals, axis=-1, keepdims=True) + 1e-8)
        return normals

    def frankot_chellappa(self, normals):
        h, w = normals.shape[:2]
        p = -normals[..., 0] / (normals[..., 2] + 1e-8)
        q = -normals[..., 1] / (normals[..., 2] + 1e-8)
        u = np.fft.fftfreq(w).reshape(1, -1)
        v = np.fft.fftfreq(h).reshape(-1, 1)
        u2 = u**2 + v**2
        u2[0, 0] = 1.0
        P = np.fft.fft2(p)
        Q = np.fft.fft2(q)
        Z = (-1j * u * P - 1j * v * Q) / u2
        depth = np.real(np.fft.ifft2(Z))
        depth = depth - depth.min()
        depth = depth / depth.max() * 2.0 - 1.0
        return depth

    def depth_to_pointcloud(self, depth, color_img, max_points=50000):
        h, w = depth.shape
        ys, xs = np.meshgrid(np.arange(h), np.arange(w), indexing='ij')
        cx, cy = w / 2.0, h / 2.0
        fx = fy = max(w, h)
        z = depth
        x = (xs - cx) * z / fx
        y = (ys - cy) * z / fy
        points = np.stack([x, y, z], axis=-1).reshape(-1, 3)
        colors = np.array(color_img).reshape(-1, 3) / 255.0
        valid = np.isfinite(points).all(axis=1) & (np.abs(points[:, 2]) < 10.0)
        points = points[valid]
        colors = colors[valid]
        if len(points) > max_points:
            idx = np.random.choice(len(points), max_points, replace=False)
            points = points[idx]
            colors = colors[idx]
        return points, colors

class RBFSDF:
    def __init__(self, epsilon=1.0):
        self.epsilon = epsilon
        self.centers = None
        self.weights = None

    def rbf(self, x, c):
        d = torch.cdist(x, c)
        return torch.exp(-(d**2) / (self.epsilon**2))

    def fit(self, points, normals):
        pts = torch.from_numpy(points).float()
        n = torch.from_numpy(normals).float()
        n = n / (n.norm(dim=-1, keepdim=True) + 1e-8)
        self.centers = pts.clone()
        n_pts = pts.shape[0]
        off_surface = pts + 0.01 * n
        on_surface = pts
        all_pts = torch.cat([on_surface, off_surface], dim=0)
        all_sdf = torch.cat([torch.zeros(n_pts, 1), 0.01 * torch.ones(n_pts, 1)], dim=0)
        K = self.rbf(all_pts, self.centers)
        self.weights = torch.linalg.lstsq(K, all_sdf).solution

    def evaluate(self, points):
        pts = torch.from_numpy(points).float()
        K = self.rbf(pts, self.centers)
        return (K @ self.weights).numpy().reshape(-1)

class PoissonReconstructor:
    def __init__(self, depth=10):
        self.depth = depth

    def reconstruct(self, points, normals):
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points)
        pcd.normals = o3d.utility.Vector3dVector(normals)
        mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd, depth=self.depth)
        densities = np.asarray(densities)
        mesh.remove_vertices_by_mask(densities < np.quantile(densities, 0.1))
        return mesh

class MeshOptimizer:
    def __init__(self):
        pass

    def taubin_smooth(self, mesh, iters=5):
        o3d_m = mesh
        o3d_m = o3d_m.filter_smooth_taubin(number_of_iterations=iters)
        return o3d_m

    def decimate(self, mesh, target_faces=10000):
        return mesh.simplify_quadric_decimation(target_faces)

class OlmecMathEngine:
    def __init__(self, grid_res=64, sdf_eps=0.5):
        self.grid_res = grid_res
        self.sfs = ShapeFromShading()
        self.rbf_sdf = RBFSDF(epsilon=sdf_eps)
        self.reconstructor = PoissonReconstructor(depth=10)
        self.optimizer = MeshOptimizer()

    def compute_intrinsic_sdf(self, depth, color_img):
        h, w = depth.shape
        lin = np.linspace(-1.5, 1.5, self.grid_res)
        grid_x, grid_y, grid_z = np.meshgrid(lin, lin, lin, indexing='ij')
        grid_pts = np.stack([grid_x, grid_y, grid_z], axis=-1).reshape(-1, 3)
        ys, xs = np.meshgrid(np.arange(h), np.arange(w), indexing='ij')
        cx, cy = w / 2.0, h / 2.0
        fx = fy = max(w, h)
        z = depth
        x = (xs - cx) * z / fx
        y = (ys - cy) * z / fy
        depth_pts = np.stack([x, y, z], axis=-1).reshape(-1, 3)
        valid = np.isfinite(depth_pts).all(axis=1) & (np.abs(depth_pts[:, 2]) < 10.0)
        depth_pts = depth_pts[valid]
        if len(depth_pts) < 100:
            return grid_pts, np.zeros(grid_pts.shape[0])
        from scipy.spatial import cKDTree
        tree = cKDTree(depth_pts)
        dists, _ = tree.query(grid_pts)
        sdf_vals = dists.astype(np.float32)
        sdf_vals = sdf_vals.reshape(self.grid_res, self.grid_res, self.grid_res)
        sdf_vals = ndimage.gaussian_filter(sdf_vals, sigma=1.0)
        near_mask = dists < 0.15
        sdf_vals_flat = sdf_vals.reshape(-1)
        sdf_vals_flat[near_mask] *= -1.0
        inside = self._compute_inside_mask(depth, self.grid_res)
        sdf_vals_flat = sdf_vals.reshape(self.grid_res, self.grid_res, self.grid_res)
        if inside is not None:
            sdf_vals_flat[inside] *= -1.0
        sdf_vals = sdf_vals_flat
        return grid_pts, sdf_vals

    def _compute_inside_mask(self, depth, res):
        h, w = depth.shape
        mask = depth > depth.min() + 0.01
        mask = morphology.closing(mask, morphology.disk(3))
        mask = ndimage.binary_fill_holes(mask)
        if not mask.any():
            return None
        lin = np.linspace(-1.5, 1.5, res)
        grid_x, grid_y, grid_z = np.meshgrid(lin, lin, lin, indexing='ij')
        cx, cy, fx, fy = w/2, h/2, max(w, h), max(w, h)
        screen_x = (grid_x * fx / (grid_z + 1e-8) + cx).astype(int)
        screen_y = (grid_y * fy / (grid_z + 1e-8) + cy).astype(int)
        in_mask = (screen_x >= 0) & (screen_x < w) & (screen_y >= 0) & (screen_y < h)
        inside = np.zeros_like(grid_x, dtype=bool)
        inside[in_mask] = mask[screen_y[in_mask], screen_x[in_mask]]
        return inside

    def segment_foreground(self, image):
        img_np = np.array(image)
        gray = color.rgb2gray(img_np)
        thresh = filters.threshold_otsu(gray)
        mask = gray > thresh
        mask = morphology.remove_small_objects(mask, min_size=500)
        mask = morphology.remove_small_holes(mask, area_threshold=500)
        if not mask.any():
            mask = np.ones_like(gray, dtype=bool)
        return mask

    def apply_laplacian_smooth(self, points, iters=5, lamb=0.5):
        pts = points.copy()
        for _ in range(iters):
            pcd = o3d.geometry.PointCloud()
            pcd.points = o3d.utility.Vector3dVector(pts)
            pcd.estimate_normals()
            pcd = pcd.filter_smooth_simple(number_of_iterations=1)
            pts = np.asarray(pcd.points)
        return pts

    def reconstruct_from_image(self, image_path, resolution=128, smooth=True):
        img = Image.open(image_path).convert("RGB")
        img_resized = img.resize((resolution, resolution))
        img_np = np.array(img_resized)
        mask = self.segment_foreground(img_resized)
        print("  [1/6] Shape from Shading - estimating surface normals...")
        normals = self.sfs.estimate_normals(img_resized)
        print("  [2/6] Frankot-Chellappa integration - computing depth map...")
        depth = self.sfs.frankot_chellappa(normals)
        depth[~mask] = depth.min()
        depth = ndimage.median_filter(depth, size=5)
        print("  [3/6] Generating point cloud from depth...")
        points, colors = self.sfs.depth_to_pointcloud(depth, img_resized)
        print(f"  [4/6] Computing SDF with RBF interpolation (grid {self.grid_res}^3)...")
        grid_pts, sdf_vals = self.compute_intrinsic_sdf(depth, img_resized)
        print("  [5/6] Extracting mesh via Marching Cubes...")
        try:
            sdf_3d = sdf_vals.reshape(self.grid_res, self.grid_res, self.grid_res)
            verts, faces, _, _ = measure.marching_cubes(sdf_3d, level=0.0)
            verts = (verts / (self.grid_res - 1)) * 3.0 - 1.5
        except Exception as e:
            print(f"  [!] Marching cubes failed: {e}, using Poisson fallback...")
            pcd = o3d.geometry.PointCloud()
            pcd.points = o3d.utility.Vector3dVector(points)
            pcd.colors = o3d.utility.Vector3dVector(colors)
            pcd.estimate_normals()
            mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd, depth=8)[0]
            verts = np.asarray(mesh.vertices)
            faces = np.asarray(mesh.triangles)
        print(f"  [6/6] Running Poisson surface reconstruction + smoothing...")
        if len(faces) > 0:
            mesh = o3d.geometry.TriangleMesh(
                o3d.utility.Vector3dVector(verts),
                o3d.utility.Vector3iVector(faces)
            )
        else:
            pcd = o3d.geometry.PointCloud()
            pcd.points = o3d.utility.Vector3dVector(points)
            pcd.estimate_normals()
            mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd, depth=8)[0]
        if smooth:
            mesh = self.optimizer.taubin_smooth(mesh, iters=5)
        if mesh.has_triangles() and mesh.triangles.__len__() > 20000:
            mesh = self.optimizer.decimate(mesh, 10000)
        return mesh

    def export_mesh(self, mesh, output_path):
        verts = np.asarray(mesh.vertices)
        faces = np.asarray(mesh.triangles)
        if len(verts) == 0:
            print("[!] Empty mesh, creating fallback sphere")
            fallback = o3d.geometry.TriangleMesh.create_sphere(radius=1.0, resolution=20)
            o3d.io.write_triangle_mesh(output_path, fallback)
            return
        tmesh = trimesh.Trimesh(vertices=verts, faces=faces)
        tmesh.export(output_path)
        print(f"[+] Mesh exported to {output_path} ({len(verts)} verts, {len(faces)} faces)")
