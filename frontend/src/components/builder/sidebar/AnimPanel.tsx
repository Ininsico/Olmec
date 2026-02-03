import React from 'react';

export const AnimPanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Animation</h3>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <button className="border border-white/10 p-2 rounded hover:bg-white hover:text-black transition-colors flex flex-col items-center">
                        <i className="fas fa-key mb-1 text-lg"></i>
                        <span className="text-[9px]">Insert Key</span>
                    </button>
                    <button className="border border-white/10 p-2 rounded hover:bg-white hover:text-black transition-colors flex flex-col items-center">
                        <i className="fas fa-trash mb-1 text-lg"></i>
                        <span className="text-[9px]">Delete Key</span>
                    </button>
                </div>
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase">Playback</h4>
                    <div className="flex gap-1 justify-center bg-white/5 p-2 rounded">
                        <i className="fas fa-step-backward p-2 hover:text-white cursor-pointer"></i>
                        <i className="fas fa-play p-2 hover:text-white cursor-pointer"></i>
                        <i className="fas fa-step-forward p-2 hover:text-white cursor-pointer"></i>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-[9px] text-slate-400">Start:</span>
                        <input type="number" className="w-full bg-black border border-white/10 rounded px-1 text-[9px]" defaultValue="1" />
                        <span className="text-[9px] text-slate-400">End:</span>
                        <input type="number" className="w-full bg-black border border-white/10 rounded px-1 text-[9px]" defaultValue="250" />
                    </div>
                </div>
            </div>
        </div>
    );
};
