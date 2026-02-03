import React from 'react';

export const EditPanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Edit</h3>
                <div className="flex gap-1 mb-2 text-[10px]">
                    <button className="flex-1 bg-white/10 py-1 rounded text-white border border-white/10">Vertex</button>
                    <button className="flex-1 py-1 rounded text-slate-500 hover:bg-white/5">Edge</button>
                    <button className="flex-1 py-1 rounded text-slate-500 hover:bg-white/5">Face</button>
                </div>
            </div>
            <div className="space-y-4">
                {[
                    { cat: 'Transform', items: ['Move', 'Rotate', 'Scale', 'Transform', 'Annotate', 'Measure'] },
                    { cat: 'Add', items: ['Extrude', 'Inset', 'Bevel', 'Loop Cut', 'Knife', 'Poly Build'] },
                    { cat: 'Separate', items: ['Spin', 'Smooth', 'Edge Slide', 'Shrink/Fatten', 'Shear', 'Rip Region'] }
                ].map(cat => (
                    <div key={cat.cat} className="space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{cat.cat}</h4>
                        <div className="grid grid-cols-2 gap-1">
                            {cat.items.map(item => (
                                <button key={item} className="text-left px-2 py-1.5 border border-white/5 rounded hover:bg-white hover:text-black hover:border-white text-[9px] text-slate-300 transition-colors">
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
