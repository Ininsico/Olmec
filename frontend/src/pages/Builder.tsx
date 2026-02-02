import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Box, Save, Plus, Layers, Settings, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Builder: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen bg-[#0f0f11] text-white flex flex-col overflow-hidden">
            {/* Top Bar / Toolbar */}
            <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#18181b]">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center space-x-2">
                        <Box size={20} className="text-richred-500" />
                        <span className="font-bold">Untitled Project</span>
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <nav className="flex items-center space-x-1">
                        {['File', 'Edit', 'View', 'Add', 'Object', 'Help'].map(item => (
                            <button key={item} className="px-3 py-1 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors">
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md flex items-center space-x-2 transition-colors">
                        <Play size={12} />
                        <span>Run</span>
                    </button>
                    <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md flex items-center space-x-2 transition-colors">
                        <Save size={12} />
                        <span>Save</span>
                    </button>
                </div>
            </header>

            {/* Main Editor Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar (Tools) */}
                <aside className="w-16 border-r border-white/10 bg-[#18181b] flex flex-col items-center py-4 space-y-4">
                    {[Plus, Box, Layers, Settings].map((Icon, i) => (
                        <button key={i} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <Icon size={20} />
                        </button>
                    ))}
                </aside>

                {/* 3D Viewport Area */}
                <main className="flex-1 bg-[#09090b] relative flex items-center justify-center">
                    <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] grid-rows-[repeat(40,minmax(0,1fr))] opacity-[0.03]">
                        {/* Grid Pattern Placeholder */}
                        {Array.from({ length: 1600 }).map((_, i) => (
                            <div key={i} className="border-[0.5px] border-white" />
                        ))}
                    </div>

                    <div className="text-center">
                        <div className="loader mb-4 w-12 h-12 border-4 border-richred-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-slate-500 font-mono text-sm">Initializing 3D Engine...</p>
                    </div>
                </main>

                {/* Right Sidebar (Properties) */}
                <aside className="w-80 border-l border-white/10 bg-[#18181b] p-4">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Properties</div>

                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="text-sm font-bold text-slate-300 mb-2">Transform</div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                                <div>X: 0.00</div>
                                <div>Y: 0.00</div>
                                <div>Z: 0.00</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom Status Bar */}
            <footer className="h-6 bg-[#18181b] border-t border-white/10 flex items-center px-4 text-[10px] text-slate-500 justify-between">
                <div>Ready</div>
                <div>v1.0.0-beta</div>
            </footer>
        </div>
    );
};

export default Builder;
