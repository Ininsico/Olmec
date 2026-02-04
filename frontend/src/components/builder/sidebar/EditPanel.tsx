import React, { useState } from 'react';

interface EditPanelProps {
    onTransformAction?: (action: string) => void;
    selectedObject?: any; // Should be SceneObject type
    onPropertyChange?: (id: number, prop: string, value: any) => void;
}

export const EditPanel: React.FC<EditPanelProps> = ({ onTransformAction, selectedObject, onPropertyChange }) => {
    const [editMode, setEditMode] = useState<'object' | 'vertex' | 'edge' | 'face'>('object');

    const handleTransformClick = (action: string) => {
        if (onTransformAction) {
            onTransformAction(action.toLowerCase().replace(/\s+/g, '_'));
        }
    };

    const handleValueChange = (prop: string, axis: 'x' | 'y' | 'z', value: number) => {
        if (selectedObject && onPropertyChange) {
            onPropertyChange(selectedObject.id, `${prop}.${axis}`, value);
        }
    };

    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Mode</h3>
                <div className="flex gap-1 mb-2 text-[10px]">
                    <button
                        className={`flex-1 py-1 rounded border border-white/10 transition-colors ${editMode === 'object' ? 'bg-richred text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        onClick={() => setEditMode('object')}
                    >
                        Object
                    </button>
                    <button
                        className={`flex-1 py-1 rounded border border-white/10 transition-colors ${editMode === 'vertex' ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        onClick={() => setEditMode('vertex')}
                    >
                        Vertex
                    </button>
                    <button
                        className={`flex-1 py-1 rounded border border-white/10 transition-colors ${editMode === 'edge' ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        onClick={() => setEditMode('edge')}
                    >
                        Edge
                    </button>
                    <button
                        className={`flex-1 py-1 rounded border border-white/10 transition-colors ${editMode === 'face' ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        onClick={() => setEditMode('face')}
                    >
                        Face
                    </button>
                </div>
            </div>

            {/* Transform Properties - Only visible in Object Mode */}
            {editMode === 'object' && selectedObject && (
                <div className="mb-6 space-y-4 border-b border-white/10 pb-4">
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
                ))}
            </div>
        </div>
    );
};
