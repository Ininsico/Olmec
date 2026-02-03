import React from 'react';

export const PropertiesPanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-2">Properties</h3>
                {/* Properties Context Tabs - Icons like Blender */}
                <div className="flex flex-wrap gap-1 mb-4 border-b border-white/10 pb-2">
                    {['tools', 'desktop', 'globe', 'object-group', 'cube', 'wrench', 'wind', 'star', 'bullseye', 'link', 'database', 'image', 'dot-circle'].map((icon, i) => (
                        <button key={i} className={`w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 text-[10px] ${i === 4 ? 'bg-white text-black' : 'text-slate-400'}`}>
                            <i className={`fas fa-${icon}`}></i>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {/* Transform */}
                <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded-sm uppercase tracking-wider flex items-center justify-between">
                        <div className="flex items-center gap-2"><i className="fas fa-caret-down"></i> Transform</div>
                    </h4>
                    <div className="space-y-1 p-1">
                        {['Location', 'Rotation', 'Scale'].map((label) => (
                            <div key={label} className="grid grid-cols-4 gap-1 items-center">
                                <span className="text-[9px] text-slate-400">{label.substring(0, 3)}</span>
                                {['X', 'Y', 'Z'].map((axis, j) => (
                                    <div key={axis} className="relative">
                                        <span className={`absolute left-1 top-1 text-[8px] font-bold ${j === 0 ? 'text-red-500' : j === 1 ? 'text-green-500' : 'text-blue-500'}`}>{axis}</span>
                                        <input
                                            type="number"
                                            className="w-full bg-black border border-white/10 rounded-sm pl-3 pr-1 py-1 text-[9px] text-white font-mono focus:border-white outline-none text-right"
                                            placeholder="0"
                                            defaultValue={label === 'Scale' ? "1.000" : "0.000"}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div className="grid grid-cols-4 gap-1 items-center mt-2">
                            <span className="text-[9px] text-slate-400">Dim</span>
                            {['X', 'Y', 'Z'].map((axis) => (
                                <div key={'dim' + axis} className="relative">
                                    <input type="number" className="w-full bg-black/50 border border-white/5 rounded-sm px-1 py-1 text-[9px] text-slate-500 font-mono outline-none text-right" defaultValue="2.000" disabled />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Relations */}
                <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-400 px-2 py-1 rounded-sm uppercase tracking-wider flex items-center gap-2 hover:bg-white/5 cursor-pointer"><i className="fas fa-caret-right"></i> Relations</h4>
                </div>

                {/* Collections */}
                <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-400 px-2 py-1 rounded-sm uppercase tracking-wider flex items-center gap-2 hover:bg-white/5 cursor-pointer"><i className="fas fa-caret-right"></i> Collections</h4>
                </div>

                <div className="h-px bg-white/10"></div>

                {/* Modifiers Placeholder */}
                <div className="space-y-2">
                    <button className="w-full bg-white/5 border border-white/10 py-1 text-[10px] text-blue-300 rounded hover:bg-white/10 flex items-center justify-center gap-2">
                        <i className="fas fa-wrench"></i> Add Modifier
                    </button>
                    <div className="text-[9px] text-center text-slate-600 italic">No modifiers applied</div>
                </div>

                <div className="h-px bg-white/10"></div>

                {/* Material */}
                <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded-sm uppercase tracking-wider flex items-center justify-between">
                        <div className="flex items-center gap-2"><i className="fas fa-caret-down"></i> Surface</div>
                    </h4>

                    <div className="p-1 space-y-2">
                        <div className="flex gap-2 text-[10px] items-center">
                            <span className="w-16 text-slate-400">Base Color</span>
                            <div className="flex-1 flex gap-1 h-5 bg-white/5 border border-white/10 rounded p-0.5">
                                <input type="color" className="h-full aspect-square rounded-sm overflow-hidden" defaultValue="#ffffff" />
                                <span className="text-[9px] text-white opacity-50 my-auto">#FFFFFF</span>
                            </div>
                        </div>
                        {[
                            { l: 'Subsurface', v: 0.0 }, { l: 'Metallic', v: 0.0 }, { l: 'Specular', v: 0.5 }, { l: 'Roughness', v: 0.5 }, { l: 'Anisotropic', v: 0.0 }, { l: 'Sheen', v: 0.0 }, { l: 'Clearcoat', v: 0.0 }, { l: 'IOR', v: 1.45 }, { l: 'Transmission', v: 0.0 }, { l: 'Emission', v: 0.0 }, { l: 'Alpha', v: 1.0 }
                        ].map(p => (
                            <div key={p.l} className="flex gap-2 text-[10px] items-center">
                                <span className="w-16 text-slate-400 truncate">{p.l}</span>
                                <div className="flex-1 relative group">
                                    <div className="absolute top-0 bottom-0 bg-white/10 left-0 rounded-sm" style={{ width: `${p.v * 100}%` }}></div>
                                    <input type="number" defaultValue={p.v} step="0.01" className="w-full bg-transparent border border-white/10 rounded-sm px-1 py-0.5 text-[9px] text-white font-mono relative z-10 text-right hover:border-white/30" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
