import React from 'react';
import { ObjectModePanel } from '../modes/ObjectModePanel';
import { VertexModePanel } from '../modes/VertexModePanel';
import { EdgeModePanel } from '../modes/EdgeModePanel';
import { FaceModePanel } from '../modes/FaceModePanel';

interface EditPanelProps {
    editMode: 'object' | 'vertex' | 'edge' | 'face';
    onEditModeChange: (mode: 'object' | 'vertex' | 'edge' | 'face') => void;
    onTransformAction?: (action: string) => void;
    selectedObject?: any;
    onPropertyChange?: (id: number, prop: string, value: any) => void;
}

export const EditPanel: React.FC<EditPanelProps> = ({
    editMode,
    onEditModeChange,
    onTransformAction,
    selectedObject,
    onPropertyChange
}) => {
    return (
        <div className="p-3">
            {/* Mode Selector */}
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Mode</h3>
                <div className="flex gap-1 mb-2 text-[10px]">
                    <button
                        className={`flex-1 py-1 rounded border border-white/10 transition-colors ${editMode === 'object' ? 'bg-richred text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        onClick={() => onEditModeChange('object')}
                        title="Object Mode - Transform entire objects"
                    >
                        <i className="fas fa-cube text-[8px] mr-1"></i>
                        Object
                    </button>
                    <button
                        className={`flex-1 py-1 rounded border border-white/10 transition-colors ${editMode === 'vertex' ? 'bg-richred text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        onClick={() => onEditModeChange('vertex')}
                        title="Vertex Mode - Edit individual vertices"
                    >
                        <i className="fas fa-circle text-[6px] mr-1"></i>
                        Vertex
                    </button>
                    <button
                        className={`flex-1 py-1 rounded border border-white/10 transition-colors ${editMode === 'edge' ? 'bg-richred text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        onClick={() => onEditModeChange('edge')}
                        title="Edge Mode - Edit edges"
                    >
                        <i className="fas fa-minus text-[8px] mr-1"></i>
                        Edge
                    </button>
                    <button
                        className={`flex-1 py-1 rounded border border-white/10 transition-colors ${editMode === 'face' ? 'bg-richred text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        onClick={() => onEditModeChange('face')}
                        title="Face Mode - Edit faces/polygons"
                    >
                        <i className="fas fa-square text-[8px] mr-1"></i>
                        Face
                    </button>
                </div>
            </div>

            {/* Mode-Specific Content */}
            <div className="mode-content">
                {editMode === 'object' && (
                    <ObjectModePanel
                        selectedObject={selectedObject}
                        onPropertyChange={onPropertyChange}
                        onTransformAction={onTransformAction}
                    />
                )}

                {editMode === 'vertex' && (
                    <VertexModePanel
                        selectedObject={selectedObject}
                        onTransformAction={onTransformAction}
                    />
                )}

                {editMode === 'edge' && (
                    <EdgeModePanel
                        selectedObject={selectedObject}
                        onTransformAction={onTransformAction}
                    />
                )}

                {editMode === 'face' && (
                    <FaceModePanel
                        selectedObject={selectedObject}
                        onTransformAction={onTransformAction}
                    />
                )}
            </div>
        </div>
    );
};
