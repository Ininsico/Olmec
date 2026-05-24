import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Upload, Box, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface AIGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'text' | 'image';
    onModelGenerated: (modelUrl: string) => void;
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({ isOpen, onClose, mode, onModelGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setStatus('Initializing SOTA Pipeline...');
        
        try {
            const formData = new FormData();
            if (mode === 'text') formData.append('text', prompt);
            if (mode === 'image' && image) formData.append('image', image);
            formData.append('resolution', '128');

            const token = localStorage.getItem('token');
            const response = await axios.post('/api/ai/generate', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setStatus('Model Generated Successfully!');
                onModelGenerated(response.data.modelUrl);
                setTimeout(onClose, 1500);
            }
        } catch (err: any) {
            console.error('Generation failed:', err);
            setError(err.response?.data?.error || 'Generation failed. Ensure AI Core is online.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-richred/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-richred rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                                    <Wand2 className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">AI Mesh Engine</h2>
                                    <p className="text-[10px] uppercase tracking-widest text-richred font-black">SOTA Generation Core</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6">
                            {mode === 'text' ? (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Describe your object</label>
                                    <textarea 
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g. A futuristic chair with organic curves, ultra-minimalist style..."
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-richred outline-none transition-all resize-none"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upload Reference Image</label>
                                    <div 
                                        className={`w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${preview ? 'border-richred/50 bg-richred/5' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                                        onClick={() => document.getElementById('ai-image-upload')?.click()}
                                    >
                                        <input 
                                            id="ai-image-upload"
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="h-full w-full object-contain p-4" />
                                        ) : (
                                            <>
                                                <Upload className="text-slate-500 mb-2" size={32} />
                                                <p className="text-xs text-slate-500 font-medium text-center px-8">Drag and drop or click to upload<br/><span className="text-[10px] opacity-50">Best results with transparent backgrounds</span></p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Status/Error */}
                            <AnimatePresence>
                                {isGenerating && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex items-center gap-3 text-richred font-mono text-xs"
                                    >
                                        <div className="w-4 h-4 border-2 border-richred/30 border-t-richred rounded-full animate-spin"></div>
                                        {status}
                                    </motion.div>
                                )}
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs"
                                    >
                                        <AlertCircle size={16} />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-8 pt-0">
                            <button 
                                disabled={isGenerating || (mode === 'text' && !prompt) || (mode === 'image' && !image)}
                                onClick={handleGenerate}
                                className="w-full bg-richred hover:bg-richred-700 disabled:bg-slate-800 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
                            >
                                {isGenerating ? 'PROCESSING_NEURAL_MAP...' : (
                                    <>
                                        <Box size={20} />
                                        GENERATE 3D MESH
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
