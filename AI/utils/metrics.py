import torch

def compute_iou(pred_sdf, gt_sdf, threshold=0.0):
    """
    Compute Voxel IoU for SDF reconstructions.
    """
    pred_occ = pred_sdf < threshold
    gt_occ = gt_sdf < threshold
    
    intersection = (pred_occ & gt_occ).float().sum()
    union = (pred_occ | gt_occ).float().sum()
    
    return (intersection / (union + 1e-6)).item()

def compute_fscore(pred_points, gt_points, threshold=0.01):
    """
    Compute F-Score @ threshold for point clouds.
    """
    # [B, N, M]
    dists = torch.cdist(pred_points, gt_points, p=2)
    
    # Precision: points in pred that have a neighbor in gt within threshold
    precision = (dists.min(dim=2)[0] < threshold).float().mean()
    
    # Recall: points in gt that have a neighbor in pred within threshold
    recall = (dists.min(dim=1)[0] < threshold).float().mean()
    
    f_score = (2 * precision * recall) / (precision + recall + 1e-6)
    return f_score.item()

def compute_chamfer_l1(pred_points, gt_points):
    """
    L1 Chamfer Distance as a metric.
    """
    dist = torch.cdist(pred_points, gt_points, p=2)
    d1 = dist.min(dim=2)[0].mean()
    d2 = dist.min(dim=1)[0].mean()
    return (d1 + d2).item()
