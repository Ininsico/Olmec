import React from 'react';

interface ObjectModePanelProps {
    selectedObject?: any;
    onPropertyChange?: (id: number, prop: string, value: any) => void;
    onTransformAction?: (action: string) => void;
}

export const ObjectModePanel: React.FC<ObjectModePanelProps> = ({
    selectedObject,
    onPropertyChange,
    onTransformAction
}) => {
    const handleValueChange = (prop: string, axis: 'x' | 'y' | 'z', value: number) => {
        if (selectedObject && onPropertyChange) {
            onPropertyChange(selectedObject.id, `${prop}.${axis}`, value);
        }
    };

    const handleTransformClick = (action: string) => {
        if (onTransformAction) {
            onTransformAction(action.toLowerCase().replace(/\s+/g, '_'));
        }
    };

    return (
        <div className="space-y-4">
            {/* Transform Properties - Only visible when object is selected */}
            {selectedObject && (
                <div className="space-y-4 border-b border-white/10 pb-4">
                    {/* Position */}
                    <div>
                        <div className="text-[10px] text-slate-400 mb-1 font-bold">Location</div>
                        <div className="grid grid-cols-3 gap-1">
                            {['x', 'y', 'z'].map(axis => (
                                <div key={axis} className="relative">
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 uppercase">{axis}</div>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/10 rounded px-1 py-1 pl-4 text-[10px] text-white focus:border-richred outline-none"
                                        value={selectedObject.position?.[axis]?.toFixed(2) || 0}
                                        onChange={(e) => handleValueChange('position', axis as 'x' | 'y' | 'z', parseFloat(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rotation */}
                    <div>
                        <div className="text-[10px] text-slate-400 mb-1 font-bold">Rotation</div>
                        <div className="grid grid-cols-3 gap-1">
                            {['x', 'y', 'z'].map(axis => (
                                <div key={axis} className="relative">
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 uppercase">{axis}</div>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/10 rounded px-1 py-1 pl-4 text-[10px] text-white focus:border-richred outline-none"
                                        value={selectedObject.rotation?.[axis]?.toFixed(2) || 0}
                                        onChange={(e) => handleValueChange('rotation', axis as 'x' | 'y' | 'z', parseFloat(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scale */}
                    <div>
                        <div className="text-[10px] text-slate-400 mb-1 font-bold">Scale</div>
                        <div className="grid grid-cols-3 gap-1">
                            {['x', 'y', 'z'].map(axis => (
                                <div key={axis} className="relative">
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 uppercase">{axis}</div>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/10 rounded px-1 py-1 pl-4 text-[10px] text-white focus:border-richred outline-none"
                                        value={selectedObject.scale?.[axis]?.toFixed(2) || 1}
                                        step={0.1}
                                        onChange={(e) => handleValueChange('scale', axis as 'x' | 'y' | 'z', parseFloat(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Transform Actions */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Transform</h4>
                <div className="grid grid-cols-2 gap-1">
                    {['Move', 'Rotate', 'Scale', 'Transform', 'Annotate', 'Measure'].map(item => (
                        <button
                            key={item}
                            className="text-left px-2 py-1.5 border border-white/5 rounded hover:bg-richred hover:text-white hover:border-richred text-[9px] text-slate-300 transition-colors"
                            onClick={() => handleTransformClick(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
