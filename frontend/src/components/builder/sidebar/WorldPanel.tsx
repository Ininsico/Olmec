import React from 'react';

export const WorldPanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">World</h3>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase">Surface</h4>
                    <div className="p-2 border border-white/10 rounded bg-white/5 space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-300">Background</span>
                            <button className="bg-black border border-white/10 px-2 rounded">Color</button>
                        </div>
                        <input type="color" className="w-full h-6 rounded cursor-pointer" defaultValue="#1a1a1a" />
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-300">Strength</span>
                            <input type="number" className="bg-black w-12 border border-white/10 rounded px-1 text-right" defaultValue="1.0" />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase">Volume</h4>
                    <button className="w-full py-1 border border-dashed border-white/20 rounded text-[10px] text-slate-500">None</button>
                </div>
            </div>
        </div>
    );
};
