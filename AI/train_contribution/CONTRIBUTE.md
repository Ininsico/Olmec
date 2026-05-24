# 🚀 Contribute to OLMEC SOTA Training

You are about to join the OLMEC Swarm. By running this worker, your laptop will contribute its compute power to refine the weights of our SOTA 3D reconstruction model.

## 🛠️ Prerequisites
- Python 3.9+
- NVIDIA GPU (Optional, but recommended)
- Internet connection

## ⚡ Quick Start (The "Swarm" Command)

1. **Clone the repo** (if you haven't):
   ```bash
   git clone https://github.com/your-repo/olmec-ai.git
   cd olmec-ai/AI
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Join the Cluster**:
   Replace `<MASTER_IP>` with the IP displayed on the [Train Page](http://localhost:5173/train).
   ```bash
   python START_CORE.py worker --master_ip <MASTER_IP>
   ```

## 🧠 How it works
Your machine will:
1. Pull the latest weights from the Master Node.
2. Process a batch of 3D data (SDF gradients).
3. Push the calculated gradients back to the Master.
4. Sync and repeat.

## 💎 Rewards
Contributors are tracked by their `worker_id`. Top contributors get early access to "GOD MODE" features and higher resolution generation limits.

---
*Powered by Ininsico(3D) Distributed Network*
