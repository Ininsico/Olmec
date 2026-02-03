import React from 'react';

export const RenderPanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Render</h3>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase">Engine</h4>
                    <select className="w-full bg-black border border-white/10 rounded p-1 text-[10px] text-white">
                        <option>Eevee</option>
                        <option>Cycles</option>
                        <option>Workbench</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase">Sampling</h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <span className="text-slate-300">Render</span>
                        <input type="number" className="bg-black border border-white/10 rounded px-1 text-right" defaultValue="64" />
                        <span className="text-slate-300">Viewport</span>
                        <input type="number" className="bg-black border border-white/10 rounded px-1 text-right" defaultValue="16" />
                    </div>
                </div>
            </div>
        </div>
    );
};
