import React from 'react';

export const PhysicsPanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Physics</h3>
            </div>
            <div className="space-y-2">
                {['Rigid Body', 'Cloth', 'Soft Body', 'Fluid', 'Collision', 'Force Field', 'Dynamic Paint'].map(phys => (
                    <button key={phys} className="w-full flex items-center justify-between p-2 border border-white/10 rounded hover:bg-white/10 group">
                        <div className="flex items-center gap-2">
                            <i className={`fas fa-${phys === 'Rigid Body' ? 'cube' : phys === 'Cloth' ? 'tshirt' : 'wind'} text-slate-400 group-hover:text-white`}></i>
                            <span className="text-[10px] text-slate-300 group-hover:text-white">{phys}</span>
                        </div>
                        <i className="fas fa-plus text-[10px] opacity-0 group-hover:opacity-100"></i>
                    </button>
                ))}
            </div>
        </div>
    );
};
