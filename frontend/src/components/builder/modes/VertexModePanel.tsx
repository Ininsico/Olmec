import React from 'react';

interface VertexModePanelProps {
    selectedObject?: any;
    onTransformAction?: (action: string) => void;
}

export const VertexModePanel: React.FC<VertexModePanelProps> = ({
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
            {/* Vertex Selection Info */}
            <div className="glass-panel p-3 rounded-lg border border-white/10">
                <div className="text-[10px] text-slate-400 mb-1">Vertex Mode Active</div>
                <div className="text-[9px] text-slate-500">
                    {selectedObject ? 'Click vertices to select' : 'Select an object first'}
                </div>
            </div>

            {/* Vertex Tools */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vertex Tools</h4>
                <div className="grid grid-cols-2 gap-1">
                    {['Move', 'Scale', 'Extrude', 'Connect', 'Split', 'Merge', 'Dissolve', 'Rip'].map(item => (
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

            {/* Vertex Operations */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Operations</h4>
                <div className="grid grid-cols-2 gap-1">
                    {['Smooth', 'Flatten', 'Align', 'Snap', 'Bevel', 'Chamfer'].map(item => (
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

            {/* Vertex Selection */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Selection</h4>
                <div className="grid grid-cols-2 gap-1">
                    {['All', 'None', 'Inverse', 'Random', 'Linked', 'Similar'].map(item => (
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
        </div>
    );
};
