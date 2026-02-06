import React, { useState } from 'react';
import { BrushType, FalloffType } from '../../../utils/sculpting/SculptBrush';

interface SculptPanelProps {
    onBrushChange?: (brush: BrushType) => void;
    onSettingChange?: (setting: string, value: any) => void;
}

export const SculptPanel: React.FC<SculptPanelProps> = ({
    onBrushChange,
    onSettingChange
}) => {
    const [activeTab, setActiveTab] = useState<'brushes' | 'masks' | 'facesets'>('brushes');
    const [activeBrush, setActiveBrush] = useState<BrushType>(BrushType.DRAW);
    const [brushRadius, setBrushRadius] = useState(0.5);
    const [brushStrength, setBrushStrength] = useState(0.5);
    const [falloffType, setFalloffType] = useState<FalloffType>(FalloffType.SMOOTH);
    const [dyntopoEnabled, setDyntopoEnabled] = useState(false);
    const [symmetryX, setSymmetryX] = useState(false);
    const [symmetryY, setSymmetryY] = useState(false);
    const [symmetryZ, setSymmetryZ] = useState(false);

    const handleBrushSelect = (brush: BrushType) => {
        setActiveBrush(brush);
        onBrushChange?.(brush);
    };

    const handleRadiusChange = (value: number) => {
        setBrushRadius(value);
        onSettingChange?.('radius', value);
    };

    const handleStrengthChange = (value: number) => {
        setBrushStrength(value);
        onSettingChange?.('strength', value);
    };

    const handleFalloffChange = (value: FalloffType) => {
        setFalloffType(value);
        onSettingChange?.('falloff', value);
    };

    const handleDyntopoToggle = () => {
        const newValue = !dyntopoEnabled;
        setDyntopoEnabled(newValue);
        onSettingChange?.('dyntopo', newValue);
    };

    const handleSymmetryToggle = (axis: 'x' | 'y' | 'z') => {
        const setters = { x: setSymmetryX, y: setSymmetryY, z: setSymmetryZ };
        const values = { x: symmetryX, y: symmetryY, z: symmetryZ };
        const newValue = !values[axis];
        setters[axis](newValue);
        onSettingChange?.(`symmetry_${axis}`, newValue);
    };

    return (
        <div className="p-3">
            {/* Header Tabs */}
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Sculpt</h3>
                <div className="flex gap-1 mb-2">
                    <button
                        onClick={() => setActiveTab('brushes')}
                        className={`flex-1 py-1 text-[10px] rounded border ${activeTab === 'brushes'
                            ? 'bg-white/10 text-white border-white/10'
                            : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5'
                            }`}
                    >
                        Brushes
                    </button>
                    <button
                        onClick={() => setActiveTab('masks')}
                        className={`flex-1 py-1 text-[10px] rounded border ${activeTab === 'masks'
                            ? 'bg-white/10 text-white border-white/10'
                            : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5'
                            }`}
                    >
                        Masks
                    </button>
                    <button
                        onClick={() => setActiveTab('facesets')}
                        className={`flex-1 py-1 text-[10px] rounded border ${activeTab === 'facesets'
                            ? 'bg-white/10 text-white border-white/10'
                            : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5'
                            }`}
                    >
                        Face Sets
                    </button>
                </div>
            </div>

            {/* Brush Settings */}
            {activeTab === 'brushes' && (
                <div className="space-y-4">
                    {/* Brush Parameters */}
                    <div className="space-y-2 mb-4">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                                Radius: {brushRadius.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.1"
                                value={brushRadius}
                                onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                                Strength: {brushStrength.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={brushStrength}
                                onChange={(e) => handleStrengthChange(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">
                                Falloff
                            </label>
                            <select
                                value={falloffType}
                                onChange={(e) => handleFalloffChange(e.target.value as FalloffType)}
                                className="w-full bg-white/10 text-white text-[10px] px-2 py-1 rounded border border-white/10"
                            >
                                <option value={FalloffType.SMOOTH}>Smooth</option>
                                <option value={FalloffType.SPHERE}>Sphere</option>
                                <option value={FalloffType.ROOT}>Root</option>
                                <option value={FalloffType.SHARP}>Sharp</option>
                                <option value={FalloffType.LINEAR}>Linear</option>
                                <option value={FalloffType.CONSTANT}>Constant</option>
                            </select>
                        </div>
                    </div>

                    {/* Standard Brushes */}
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Standard
                        </h4>
                        <div className="grid grid-cols-3 gap-1">
                            {[
                                { tool: BrushType.DRAW, icon: 'paint-brush', label: 'Draw' },
                                { tool: BrushType.DRAW_SHARP, icon: 'pen-fancy', label: 'Sharp' },
                                { tool: BrushType.CLAY, icon: 'cookie', label: 'Clay' },
                                { tool: BrushType.CLAY_STRIPS, icon: 'bacon', label: 'Strips' },
                                { tool: BrushType.LAYER, icon: 'layer-group', label: 'Layer' },
                                { tool: BrushType.INFLATE, icon: 'expand', label: 'Inflate' },
                                { tool: BrushType.BLOB, icon: 'tint', label: 'Blob' },
                                { tool: BrushType.CREASE, icon: 'minus', label: 'Crease' },
                                { tool: BrushType.SMOOTH, icon: 'brush', label: 'Smooth' },
                                { tool: BrushType.FLATTEN, icon: 'square', label: 'Flat' },
                                { tool: BrushType.FILL, icon: 'fill-drip', label: 'Fill' },
                                { tool: BrushType.SCRAPE, icon: 'eraser', label: 'Scrape' },
                                { tool: BrushType.PINCH, icon: 'compress-arrows-alt', label: 'Pinch' },
                                { tool: BrushType.GRAB, icon: 'hand-rock', label: 'Grab' },
                                { tool: BrushType.ELASTIC, icon: 'arrows-alt-h', label: 'Elastic' },
                                { tool: BrushType.SNAKE, icon: 'long-arrow-alt-right', label: 'Snake' },
                                { tool: BrushType.THUMB, icon: 'thumbs-up', label: 'Thumb' },
                                { tool: BrushType.POSE, icon: 'child', label: 'Pose' }
                            ].map(({ tool, icon, label }) => (
                                <div
                                    key={tool}
                                    onClick={() => handleBrushSelect(tool)}
                                    className={`border rounded p-2 cursor-pointer flex flex-col items-center gap-1 transition-all group aspect-square justify-center ${activeBrush === tool
                                        ? 'bg-white text-black border-white'
                                        : 'border-white/10 hover:bg-white hover:text-black'
                                        }`}
                                >
                                    <i className={`fas fa-${icon} text-sm transition-colors`}></i>
                                    <span className="text-[8px] font-bold uppercase tracking-wider">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Symmetry */}
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Symmetry
                        </h4>
                        <div className="flex gap-1">
                            {['x', 'y', 'z'].map((axis) => (
                                <button
                                    key={axis}
                                    onClick={() => handleSymmetryToggle(axis as 'x' | 'y' | 'z')}
                                    className={`flex-1 py-2 text-[10px] rounded border font-bold uppercase ${(axis === 'x' && symmetryX) ||
                                        (axis === 'y' && symmetryY) ||
                                        (axis === 'z' && symmetryZ)
                                        ? 'bg-white text-black border-white'
                                        : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {axis.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Topology */}
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Dynamic Topology
                        </h4>
                        <button
                            onClick={handleDyntopoToggle}
                            className={`w-full py-2 text-[10px] rounded border font-bold uppercase ${dyntopoEnabled
                                ? 'bg-white text-black border-white'
                                : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                                }`}
                        >
                            {dyntopoEnabled ? 'Dyntopo ON' : 'Dyntopo OFF'}
                        </button>
                    </div>
                </div>
            )}

            {/* Masking Tools */}
            {activeTab === 'masks' && (
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Masking
                        </h4>
                        <div className="grid grid-cols-2 gap-1">
                            {[
                                { tool: 'mask', icon: 'mask', label: 'Mask' },
                                { tool: 'box_mask', icon: 'vector-square', label: 'Box' },
                                { tool: 'lasso_mask', icon: 'lasso', label: 'Lasso' },
                                { tool: 'line_mask', icon: 'slash', label: 'Line' },
                                { tool: 'clear_mask', icon: 'times', label: 'Clear' },
                                { tool: 'invert_mask', icon: 'exchange-alt', label: 'Invert' }
                            ].map(({ tool, icon, label }) => (
                                <div
                                    key={tool}
                                    onClick={() => onSettingChange?.('mask_tool', tool)}
                                    className="border border-white/10 rounded p-2 cursor-pointer flex flex-col items-center gap-1 hover:bg-white hover:text-black transition-all group aspect-square justify-center"
                                >
                                    <i className={`fas fa-${icon} text-sm transition-colors`}></i>
                                    <span className="text-[8px] font-bold uppercase tracking-wider">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Face Sets */}
            {activeTab === 'facesets' && (
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Face Sets
                        </h4>
                        <div className="grid grid-cols-2 gap-1">
                            {[
                                { tool: 'create', icon: 'plus', label: 'Create' },
                                { tool: 'grow', icon: 'expand-arrows-alt', label: 'Grow' },
                                { tool: 'shrink', icon: 'compress-arrows-alt', label: 'Shrink' },
                                { tool: 'clear', icon: 'times', label: 'Clear' }
                            ].map(({ tool, icon, label }) => (
                                <div
                                    key={tool}
                                    onClick={() => onSettingChange?.('faceset_tool', tool)}
                                    className="border border-white/10 rounded p-2 cursor-pointer flex flex-col items-center gap-1 hover:bg-white hover:text-black transition-all group aspect-square justify-center"
                                >
                                    <i className={`fas fa-${icon} text-sm transition-colors`}></i>
                                    <span className="text-[8px] font-bold uppercase tracking-wider">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
