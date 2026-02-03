import React from 'react';

export const ShadingPanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Shading</h3>
                <p className="text-xs text-slate-500">Material Nodes</p>
            </div>
            <div className="space-y-4">
                <div className="border border-white/10 rounded p-2 bg-white/5">
                    <div className="text-[10px] font-bold text-white mb-2 flex justify-between">
                        <span>Principled BSDF</span>
                        <i className="fas fa-times text-slate-500 cursor-pointer"></i>
                    </div>
                    <div className="space-y-1">
                        {['Base Color', 'Subsurface', 'Metallic', 'Specular', 'Roughness', 'Emission', 'Alpha', 'Normal'].map(prop => (
                            <div key={prop} className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span className="text-[9px] text-slate-300">{prop}</span>
                                </div>
                                <input type="text" className="w-12 bg-black border border-white/10 text-[8px] text-right rounded px-1" defaultValue="0.5" />
                            </div>
                        ))}
                    </div>
                </div>
                <button className="w-full py-1.5 border border-dashed border-white/20 rounded text-[10px] text-slate-400 hover:text-white hover:border-white/40">
                    <i className="fas fa-plus mr-1"></i> Add Node
                </button>
            </div>
        </div>
    );
};
