import React from 'react';

interface FaceModePanelProps {
    selectedObject?: any;
    onTransformAction?: (action: string) => void;
}

export const FaceModePanel: React.FC<FaceModePanelProps> = ({
    selectedObject,
    onTransformAction
}) => {
    const handleAction = (action: string) => {
        if (onTransformAction) {
            onTransformAction(action.toLowerCase().replace(/\s+/g, '_'));
        }
    };

    return (
        <div className="space-y-4">
            {/* Face Selection Info */}
            <div className="glass-panel p-3 rounded-lg border border-white/10">
                <div className="text-[10px] text-slate-400 mb-1">Face Mode Active</div>
                <div className="text-[9px] text-slate-500">
                    {selectedObject ? 'Click faces to select' : 'Select an object first'}
                </div>
            </div>

            {/* Face Tools */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Face Tools</h4>
                <div className="grid grid-cols-2 gap-1">
                    {['Extrude', 'Inset', 'Bevel', 'Poke', 'Triangulate', 'Solidify'].map(item => (
                        <button
                            key={item}
                            className="text-left px-2 py-1.5 border border-white/5 rounded hover:bg-richred hover:text-white hover:border-richred text-[9px] text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleAction(item)}
                            disabled={!selectedObject}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Face Operations */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Operations</h4>
                <div className="grid grid-cols-2 gap-1">
                    {['Subdivide', 'Dissolve', 'Duplicate', 'Separate', 'Flip', 'Rotate'].map(item => (
                        <button
                            key={item}
                            className="text-left px-2 py-1.5 border border-white/5 rounded hover:bg-richred hover:text-white hover:border-richred text-[9px] text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleAction(item)}
                            disabled={!selectedObject}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Face Selection */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Selection</h4>
                <div className="grid grid-cols-2 gap-1">
                    {['All', 'None', 'Inverse', 'Linked', 'Similar', 'Random', 'Island', 'Boundary'].map(item => (
                        <button
                            key={item}
                            className="text-left px-2 py-1.5 border border-white/5 rounded hover:bg-richred hover:text-white hover:border-richred text-[9px] text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleAction(`select_${item}`)}
                            disabled={!selectedObject}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Face Normals */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Normals</h4>
                <div className="grid grid-cols-2 gap-1">
                    {['Flip', 'Recalculate', 'Reset', 'Smooth', 'Flatten', 'Average'].map(item => (
                        <button
                            key={item}
                            className="text-left px-2 py-1.5 border border-white/5 rounded hover:bg-richred hover:text-white hover:border-richred text-[9px] text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleAction(`normals_${item}`)}
                            disabled={!selectedObject}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Face Materials */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Materials</h4>
                <div className="grid grid-cols-2 gap-1">
                    {['Assign', 'Select', 'Deselect', 'Remove'].map(item => (
                        <button
                            key={item}
                            className="text-left px-2 py-1.5 border border-white/5 rounded hover:bg-richred hover:text-white hover:border-richred text-[9px] text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleAction(`material_${item}`)}
                            disabled={!selectedObject}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
