import React from 'react';

export const ScenePanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-2">Outliner</h3>
                <div className="flex gap-1 mb-2">
                    <input type="text" placeholder="Filter..." className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-white/40 outline-none" />
                    <button className="w-6 h-6 border border-white/10 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10"><i className="fas fa-filter text-[10px]"></i></button>
                </div>
                <div className="flex gap-1 text-[10px] text-slate-500 border-b border-white/10 pb-2">
                    <button className="hover:text-white">View Layer</button>
                    <span>/</span>
                    <button className="hover:text-white">Scene</button>
                </div>
            </div>

            <div className="space-y-1 font-mono text-[10px]">
                {/* Mock Tree View */}
                <div className="flex items-center gap-1 text-white py-1 hover:bg-white/5 px-1 rounded cursor-pointer">
                    <i className="fas fa-caret-down text-[8px] text-slate-500"></i>
                    <i className="fas fa-layer-group text-white/50"></i>
                    <span>Scene Collection</span>
                </div>
                <div className="pl-4 space-y-1">
                    <div className="flex items-center gap-1 text-white py-1 hover:bg-white/5 px-1 rounded cursor-pointer">
                        <i className="fas fa-caret-down text-[8px] text-slate-500"></i>
                        <i className="fas fa-folder text-white/50"></i>
                        <span>Collection</span>
                        <div className="ml-auto flex gap-1 opacity-50">
                            <i className="fas fa-eye text-[8px]"></i>
                            <i className="fas fa-camera text-[8px]"></i>
                        </div>
                    </div>
                    <div className="pl-4 space-y-px">
                        <div className="flex items-center gap-1 text-richred py-1 bg-white/5 px-1 rounded cursor-pointer border-l-2 border-richred">
                            <i className="fas fa-cube text-richred"></i>
                            <span>Cube</span>
                            <div className="ml-auto flex gap-1 opacity-100">
                                <i className="fas fa-eye text-[8px]"></i>
                                <i className="fas fa-camera text-[8px]"></i>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 py-1 hover:bg-white/5 px-1 rounded cursor-pointer">
                            <i className="fas fa-lightbulb text-slate-500"></i>
                            <span>Light</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 py-1 hover:bg-white/5 px-1 rounded cursor-pointer">
                            <i className="fas fa-video text-slate-500"></i>
                            <span>Camera</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
