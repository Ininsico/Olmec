import React from 'react';

interface CreatePanelProps {
    onCreateShape: (shape: string) => void;
}

export const CreatePanel: React.FC<CreatePanelProps> = ({ onCreateShape }) => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Add</h3>
                <input type="text" placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-white/40 outline-none" />
            </div>

            <div className="space-y-4">
                {[
                    { cat: 'Mesh', items: ['Plane', 'Cube', 'Circle', 'UV Sphere', 'Ico Sphere', 'Cylinder', 'Cone', 'Torus', 'Grid', 'Monkey'] },
                    { cat: 'Curve', items: ['Bezier', 'Circle', 'Nurbs Curve', 'Nurbs Circle', 'Path'] },
                    { cat: 'Surface', items: ['Nurbs Surface', 'Nurbs Cylinder', 'Nurbs Sphere', 'Nurbs Torus'] },
                    { cat: 'Metaball', items: ['Ball', 'Capsule', 'Plane', 'Ellipsoid', 'Cube'] },
                    { cat: 'Text', items: ['Text'] },
                    { cat: 'Volume', items: ['Empty', 'Import OpenVDB'] },
                    { cat: 'Grease Pencil', items: ['Blank', 'Stroke', 'Monkey'] },
                    { cat: 'Armature', items: ['Single Bone', 'Human (Meta-Rig)'] },
                    { cat: 'Lattice', items: ['Lattice'] },
                    { cat: 'Empty', items: ['Plain Axes', 'Arrows', 'Single Arrow', 'Circle', 'Cube', 'Sphere', 'Cone', 'Image'] },
                    { cat: 'Light', items: ['Point', 'Sun', 'Spot', 'Area'] },
                    { cat: 'Light Probe', items: ['Reflection Cubemap', 'Reflection Plane', 'Irradiance Volume'] },
                    { cat: 'Camera', items: ['Camera'] },
                    { cat: 'Speaker', items: ['Speaker'] },
                    { cat: 'Force Field', items: ['Force', 'Wind', 'Vortex', 'Magnetic', 'Harmonic', 'Charge', 'Lennard-Jones', 'Texture', 'Curve Guide', 'Boid', 'Turbulence', 'Drag', 'Fluid Flow'] }
                ].map((category) => (
                    <div key={category.cat} className="space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between cursor-pointer hover:text-white group">
                            <div className="flex items-center gap-1">
                                <i className="fas fa-caret-down text-[8px]"></i>
                                {category.cat}
                            </div>
                            <span className="text-[9px] bg-white/5 px-1 rounded text-slate-500 group-hover:text-white">{category.items.length}</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-1 pl-1">
                            {category.items.map((item) => (
                                <button
                                    key={item}
                                    className="text-left px-2 py-1.5 border border-white/5 rounded hover:bg-white hover:text-black hover:border-white text-[9px] text-slate-300 transition-colors truncate"
                                    onClick={() => onCreateShape(item.toLowerCase().replace(' ', '_'))}
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
