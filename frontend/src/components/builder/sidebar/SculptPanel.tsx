import React from 'react';

export const SculptPanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Sculpt</h3>
                <div className="flex gap-1 mb-2">
                    <button className="flex-1 bg-white/10 py-1 text-[10px] rounded text-white border border-white/10 hover:bg-white/20">Brushes</button>
                    <button className="flex-1 bg-transparent py-1 text-[10px] rounded text-slate-500 border border-transparent hover:bg-white/5">Masks</button>
                    <button className="flex-1 bg-transparent py-1 text-[10px] rounded text-slate-500 border border-transparent hover:bg-white/5">Face Sets</button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Standard</h4>
                    <div className="grid grid-cols-3 gap-1">
                        {[
                            { tool: 'draw', icon: 'paint-brush', label: 'Draw' },
                            { tool: 'draw_sharp', icon: 'pen-fancy', label: 'Sharp' },
                            { tool: 'clay', icon: 'cookie', label: 'Clay' },
                            { tool: 'clay_strips', icon: 'bacon', label: 'Strips' },
                            { tool: 'layer', icon: 'layer-group', label: 'Layer' },
                            { tool: 'inflate', icon: 'expand', label: 'Inflate' },
                            { tool: 'blob', icon: 'tint', label: 'Blob' },
                            { tool: 'crease', icon: 'minus', label: 'Crease' },
                            { tool: 'smooth', icon: 'brush', label: 'Smooth' },
                            { tool: 'flatten', icon: 'square', label: 'Flat' },
                            { tool: 'fill', icon: 'fill-drip', label: 'Fill' },
                            { tool: 'scrape', icon: 'eraser', label: 'Scrape' },
                            { tool: 'pinch', icon: 'compress-arrows-alt', label: 'Pinch' },
                            { tool: 'grab', icon: 'hand-rock', label: 'Grab' },
                            { tool: 'elastic', icon: 'arrows-alt-h', label: 'Elastic' },
                            { tool: 'snake', icon: 'long-arrow-alt-right', label: 'Snake' },
                            { tool: 'thumb', icon: 'thumbs-up', label: 'Thumb' },
                            { tool: 'pose', icon: 'child', label: 'Pose' }
                        ].map(({ tool, icon, label }) => (
                            <div
                                key={tool}
                                className="border border-white/10 rounded p-2 cursor-pointer flex flex-col items-center gap-1 hover:bg-white hover:text-black transition-all group aspect-square justify-center"
                            >
                                <i className={`fas fa-${icon} text-sm transition-colors`}></i>
                                <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Masking</h4>
                    <div className="grid grid-cols-3 gap-1">
                        {[
                            { tool: 'mask', icon: 'mask', label: 'Mask' },
                            { tool: 'box_mask', icon: 'vector-square', label: 'Box' },
                            { tool: 'lasso_mask', icon: 'lasso', label: 'Lasso' },
                            { tool: 'line_mask', icon: 'slash', label: 'Line' }
                        ].map(({ tool, icon, label }) => (
                            <div
                                key={tool}
                                className="border border-white/10 rounded p-2 cursor-pointer flex flex-col items-center gap-1 hover:bg-white hover:text-black transition-all group aspect-square justify-center"
                            >
                                <i className={`fas fa-${icon} text-sm transition-colors`}></i>
                                <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
