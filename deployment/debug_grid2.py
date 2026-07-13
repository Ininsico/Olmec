from PIL import Image
import numpy as np
import sys
sys.path.insert(0, '/opt/olmec/AI')

from olmec_math_engine import ImageProcessor, ReliefConstructor

img = Image.open('/opt/olmec/AI/nano_banana_collection/banana_og.png').convert("RGB")
img256 = img.resize((256, 256))
img_np = np.array(img256)

proc = ImageProcessor()
mask = proc.extract_silhouette(img_np)
hm = proc.intensity_heightmap(img_np, mask, sigma=3.0)

con = ReliefConstructor(depth_scale=1.5, base_thickness=0.3)

# Replicate the build_grid_mesh logic manually
grid_size = 48
h, w = mask.shape
step_y = max(1, h // grid_size)
step_x = max(1, w // grid_size)
rows = h // step_y + 1
cols = w // step_x + 1
print(f"step_y={step_y} step_x={step_x} rows={rows} cols={cols}")

ys = np.arange(0, h, step_y)[:rows]
xs = np.arange(0, w, step_x)[:cols]
print(f"ys: len={len(ys)}, first={ys[0]}, last={ys[-1]}")
print(f"xs: len={len(xs)}, first={xs[0]}, last={xs[-1]}")

grid_y, grid_x = np.meshgrid(ys, xs, indexing='ij')
print(f"grid_y shape: {grid_y.shape}")

cx, cy = w / 2.0, h / 2.0
scale = max(w, h)
xn = ((grid_x.astype(float) - cx) / scale)
yn = ((grid_y.astype(float) - cy) / scale)

height_grid = hm[grid_y, grid_x]
mask_grid = mask[grid_y, grid_x]
print(f"height_grid shape: {height_grid.shape}")
print(f"mask_grid sum: {mask_grid.sum()}")

height_grid[~mask_grid] = 0.0
zf = height_grid * con.depth_scale
zb = np.full_like(zf, -con.base_thickness)
print(f"zf shape: {zf.shape}, range: {zf.min():.4f} to {zf.max():.4f}")

n = rows * cols
print(f"n = {n}")

# Build face list
face_list = []
for r in range(rows - 1):
    for c in range(cols - 1):
        v00 = r * cols + c
        v01 = r * cols + (c + 1)
        v10 = (r + 1) * cols + c
        v11 = (r + 1) * cols + (c + 1)
        face_list.append([v00, v01, v10])
        face_list.append([v01, v11, v10])

print(f"face_list len = {len(face_list)}")
print(f"face_list first: {face_list[0]}")
print(f"face_list last: {face_list[-1]}")

# Build front verts
front_verts = np.stack([xn.ravel(), yn.ravel(), zf.ravel()], axis=-1)
print(f"front_verts shape: {front_verts.shape}")

faces_front = np.array(face_list)
print(f"faces_front shape: {faces_front.shape}")

faces_back = faces_front[:, [0, 2, 1]] + n
faces = np.vstack([faces_front, faces_back])
print(f"faces shape after front+back: {faces.shape}")

side_count = 0
for r in range(rows):
    for c in range(cols - 1):
        i = r * cols + c
        j = r * cols + (c + 1)
        faces = np.vstack([faces, [[i, j, j + n], [i, j + n, i + n]]])
        side_count += 2
print(f"Added {side_count} side faces (horizontal)")

for r in range(rows - 1):
    for c in range(cols):
        i = r * cols + c
        j = (r + 1) * cols + c
        faces = np.vstack([faces, [[i, j, j + n], [i, j + n, i + n]]])
        side_count += 2
print(f"Added {side_count} total side faces")

verts = np.vstack([front_verts, np.stack([xn.ravel(), yn.ravel(), zb.ravel()], axis=-1)])
print(f"Final: verts={verts.shape}, faces={faces.shape}")
