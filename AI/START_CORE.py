import subprocess
import sys
import os
import argparse

def launch_master():
    print("[*] Launching OLMEC 3D CORE: MASTER MODE")
    print("[*] Dashboard: http://0.0.0.0:8080")
    print("[*] Inference API: http://0.0.0.0:8000")
    print("[*] Engine: Mathematical reconstruction (deterministic)")
    dashboard = subprocess.Popen([sys.executable, "dashboard_server.py"])
    api = subprocess.Popen([sys.executable, "OlmecAPI.py"])
    try:
        dashboard.wait()
        api.wait()
    except KeyboardInterrupt:
        print("[!] Shutting down...")
        dashboard.terminate()
        api.terminate()

def launch_worker(master_ip):
    print(f"[*] Launching OLMEC 3D CORE: WORKER MODE")
    print(f"[*] Connecting to Master at: {master_ip}")
    worker = subprocess.Popen([
        sys.executable, "ULTIMATE_TRAIN.py",
        "--master_ip", master_ip,
        "--worker_id", os.getenv("COMPUTERNAME", "Remote_Worker")
    ])
    try:
        worker.wait()
    except KeyboardInterrupt:
        print("[!] Shutting down worker...")
        worker.terminate()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Olmec 3D Core Management")
    parser.add_argument("mode", choices=["master", "worker"], help="Launch as master (server) or worker")
    parser.add_argument("--master_ip", type=str, help="IP of the master server (required for worker mode)")
    args = parser.parse_args()
    if args.mode == "master":
        launch_master()
    elif args.mode == "worker":
        if not args.master_ip:
            print("[!] Error: --master_ip is required for worker mode")
            sys.exit(1)
        launch_worker(args.master_ip)
