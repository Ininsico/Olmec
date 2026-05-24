import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
// import { useAppStore } from '../store/useAppStore';

const Train: React.FC = () => {
    const [stats, setStats] = useState({ step: 0, loss: 0, active_workers: {} });
    const [isConnecting, setIsConnecting] = useState(false);
    const [contributionMode, setContributionMode] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Mock WebSocket or real if backend is up
    useEffect(() => {
        const socket = new WebSocket(`ws://${window.location.hostname}:8080/ws`);
        
        socket.onopen = () => {
            addLog("Connected to OLMEC Master Node.");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setStats(data);
        };

        socket.onerror = () => {
            addLog("Connection to Master Node failed. Retrying...");
        };

        return () => socket.close();
    }, []);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-20), `[${time}] ${msg}`]);
    };

    const startContribution = () => {
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnecting(false);
            setContributionMode(true);
            addLog("Initialized Web-Worker Contribution Mode.");
            addLog("Allocating virtual memory for gradient sync...");
            simulateTraining();
        }, 2000);
    };

    const simulateTraining = () => {
        if (!contributionMode) return;
        
        const workerId = `WebNode_${Math.random().toString(36).slice(2, 7)}`;
        
        const heartbeat = setInterval(async () => {
            try {
                await fetch(`http://${window.location.hostname}:8080/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        worker_id: workerId,
                        type: 'web',
                        component: 'renderer', // Web workers focus on rendering updates
                        loss: stats.loss,
                        step: stats.step
                    })
                });
            } catch (e) {
                console.error("Heartbeat failed", e);
            }
        }, 5000);

        const tasks = [
            "Calculating SDF gradients...",
            "Syncing weights with Master...",
            "Processing latent vector B-12...",
            "Optimizing topology mesh...",
            "Pushing local updates to cluster..."
        ];
        
        const runTask = () => {
            if (!contributionMode) {
                clearInterval(heartbeat);
                return;
            }
            const task = tasks[Math.floor(Math.random() * tasks.length)];
            addLog(`Contribution: ${task}`);
            setTimeout(runTask, 3000 + Math.random() * 5000);
        };
        runTask();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black tracking-tighter mb-2"
                        >
                            OLMEC <span className="text-richred">SWARM</span>
                        </motion.h1>
                        <p className="text-slate-400 text-lg">Distributed Neural Training Network</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Network Status</div>
                                <div className="text-sm font-bold">LIVE_SYNC_ACTIVE</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard title="GLOBAL_LOSS" value={stats.loss.toFixed(6)} sub="Total Convergence" color="richred" />
                            <MetricCard title="STEP_SYNC" value={stats.step.toLocaleString()} sub="Global Iterations" color="white" />
                            <MetricCard title="ACTIVE_NODES" value={Object.keys(stats.active_workers).length + 1} sub="Global Contributors" color="blue" />
                        </div>

                        {/* Network Map Visualization (Simplified) */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-[400px] relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                            </div>
                            
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">Node Topography</h3>
                            
                            <div className="relative h-full w-full flex items-center justify-center">
                                {/* Central Node */}
                                <div className="relative z-10 w-24 h-24 bg-richred rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                                    <span className="text-[10px] font-black">MASTER</span>
                                </div>

                                {/* Radial Worker Nodes */}
                                {Object.keys(stats.active_workers).map((id, index) => {
                                    const angle = (index / Object.keys(stats.active_workers).length) * Math.PI * 2;
                                    const x = Math.cos(angle) * 120;
                                    const y = Math.sin(angle) * 120;
                                    return (
                                        <motion.div 
                                            key={id}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1, x, y }}
                                            className="absolute w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md"
                                        >
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                                        </motion.div>
                                    );
                                })}

                                {/* Connection Lines (SVG) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    {Object.keys(stats.active_workers).map((id, index) => {
                                        const angle = (index / Object.keys(stats.active_workers).length) * Math.PI * 2;
                                        return (
                                            <line 
                                                key={`line-${id}`}
                                                x1="50%" y1="50%" x2={`${50 + (Math.cos(angle) * 30)}%`} y2={`${50 + (Math.sin(angle) * 30)}%`}
                                                stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4"
                                            />
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Terminal & Contribution */}
                    <div className="space-y-8">
                        {/* Terminal */}
                        <div className="bg-black border border-white/10 rounded-3xl p-6 h-[400px] flex flex-col font-mono text-[11px]">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-[10px] text-slate-500 ml-2">CORE_LOGS</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                {logs.map((log, i) => (
                                    <div key={i} className="text-slate-400">
                                        <span className="text-richred">{'>'}</span> {log}
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>

                        {/* Contribution Button */}
                        <div className="bg-white rounded-3xl p-8 text-black shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                            {!contributionMode ? (
                                <>
                                    <h3 className="text-xl font-bold mb-2">Join the Training Swarm</h3>
                                    <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                                        Contribute your device's compute power to help train the OLMEC SOTA model. 
                                        Web-based contribution uses your browser's idle resources to calculate 
                                        gradients for the mesh refiner.
                                    </p>
                                    <button 
                                        disabled={isConnecting}
                                        onClick={startContribution}
                                        className="w-full bg-black text-white h-14 rounded-2xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isConnecting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                INITIATING...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-bolt"></i>
                                                START CONTRIBUTION
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-check text-3xl text-green-600"></i>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">NODE_ACTIVE</h3>
                                    <p className="text-xs text-slate-500 mb-6">You are now contributing to the cluster.</p>
                                    <div className="bg-slate-100 rounded-2xl p-4 mb-6">
                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Contribution Hash</div>
                                        <div className="text-sm font-mono truncate">0x{Math.random().toString(16).slice(2, 10).toUpperCase()}...</div>
                                    </div>
                                    <button 
                                        onClick={() => setContributionMode(false)}
                                        className="text-xs font-bold text-red-600 hover:underline"
                                    >
                                        STOP CONTRIBUTION
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, sub, color }: any) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 transition-all hover:bg-white/[0.07] group">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 group-hover:text-white transition-colors">{title}</div>
        <div className={`text-3xl font-black mb-1 ${color === 'richred' ? 'text-richred' : 'text-white'}`}>{value}</div>
        <div className="text-[10px] text-slate-500 font-medium">{sub}</div>
    </div>
);

export default Train;
