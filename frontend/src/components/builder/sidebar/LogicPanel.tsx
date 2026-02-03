import React from 'react';

export const LogicPanel: React.FC = () => {
    return (
        <div className="p-3">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-white mb-1">Logic</h3>
            </div>
            <div className="space-y-4">
                <button className="w-full py-2 bg-white/10 text-white rounded font-bold text-[10px] hover:bg-white/20">
                    <i className="fas fa-plus mr-1"></i> Add Logic Brick
                </button>
                <div className="space-y-2">
                    {['Sensor', 'Controller', 'Actuator'].map(type => (
                        <div key={type} className="border border-white/10 rounded p-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{type}</span>
                                <i className="fas fa-plus text-[10px] cursor-pointer hover:text-white"></i>
                            </div>
                            <div className="text-[9px] text-slate-600 italic text-center py-2">No {type}s</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
