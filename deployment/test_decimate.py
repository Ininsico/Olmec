import open3d as o3d
print("open3d:", o3d.__version__)
m = o3d.geometry.TriangleMesh.create_sphere()
print("Sphere:", len(m.vertices), "verts,", len(m.triangles), "tris")
try:
    d = m.simplify_quadric_decimation(target_number_of_triangles=100)
    print("Decimated:", len(d.vertices), "verts,", len(d.triangles), "tris")
except Exception as e:
    print("Error:", e)
