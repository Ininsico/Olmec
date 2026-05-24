import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : '/ai-api';

const PIPELINE_STEPS = [
  { id: 1, name: 'Shape from Shading', desc: 'Surface normals from image intensity gradients', formula: 'n = (-∂I/∂x, -∂I/∂y, 1) / √((∂I/∂x)²+(∂I/∂y)²+1)' },
  { id: 2, name: 'Frankot-Chellappa Integration', desc: 'FFT-based depth reconstruction from normals', formula: 'Z = F⁻¹( (-juP - jvQ) / (u²+v²) )' },
  { id: 3, name: 'Point Cloud Generation', desc: 'Depth map projection into 3D space', formula: 'X = (x-cx)·Z/fx, Y = (y-cy)·Z/fy' },
  { id: 4, name: 'SDF Computation', desc: 'Signed distance via KD-tree nearest neighbor', formula: 'φ(x) = min||x - pᵢ|| × sign(x)' },
  { id: 5, name: 'Marching Cubes', desc: 'Triangle mesh extraction from SDF grid', formula: 'Isosurface φ(x) = 0' },
  { id: 6, name: 'Poisson Reconstruction', desc: 'Manifold surface fitting with Taubin smoothing', formula: 'Δφ = ∇·n' },
];

const Train: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [meshInfo, setMeshInfo] = useState<{ verts: number; faces: number; size: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResultUrl(null);
    setMeshInfo(null);
    setError(null);
  };

  const generate3D = async () => {
    if (!image) return;
    setGenerating(true);
    setError(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }, 800);

    try {
      const formData = new FormData();
      formData.append('file', image);
      const res = await axios.post(`${API_BASE}/generate`, formData, {
        headers: { 'x-api-key': 'OLMEC_DEV_KEY_99' },
        responseType: 'blob',
        timeout: 60000,
      });

      clearInterval(stepInterval);
      setCurrentStep(6);

      const url = URL.createObjectURL(res.data);
      setResultUrl(url);

      const contentLen = res.headers['content-length'];
      if (contentLen) {
        const sizeKB = (parseInt(contentLen) / 1024).toFixed(1);
        setMeshInfo({ verts: 0, faces: 0, size: sizeKB + ' KB' });
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResultUrl(null);
    setMeshInfo(null);
    setError(null);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter mb-2">
            OLMEC <span className="text-richred">MATH</span>
          </h1>
          <p className="text-slate-400 text-lg">Deterministic 3D Reconstruction Engine</p>
          <div className="flex gap-2 mt-3">
            <span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-mono">NO NEURAL NETS</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-mono">PURE MATHEMATICS</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-mono">NO TRAINING DATA</span>
          </div>
        </motion.div>

        {/* Pipeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-12">
          {PIPELINE_STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-4 border text-center transition-all ${
                currentStep >= step.id
                  ? 'bg-green-500/10 border-green-500/40'
                  : currentStep > 0 && currentStep < step.id
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className={`text-lg font-black mb-1 ${
                currentStep >= step.id ? 'text-green-400' : 'text-slate-500'
              }`}>0{step.id}</div>
              <div className="text-xs font-bold mb-1">{step.name}</div>
              <div className="text-[9px] text-slate-500 leading-tight">{step.formula}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Input</h2>
            {!preview ? (
              <label className="block border-2 border-dashed border-white/20 rounded-2xl p-16 text-center cursor-pointer hover:border-white/40 transition-all">
                <div className="text-4xl mb-4 text-slate-500">+</div>
                <div className="text-sm text-slate-400">Drop an image or click to browse</div>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            ) : (
              <div>
                <img src={preview} alt="preview" className="w-full rounded-2xl mb-4 max-h-80 object-contain" />
                <div className="flex gap-3">
                  <button onClick={generate3D} disabled={generating}
                    className="flex-1 bg-richred text-white h-12 rounded-2xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50">
                    {generating ? 'RECONSTRUCTING...' : 'GENERATE 3D'}
                  </button>
                  <button onClick={reset}
                    className="px-6 h-12 rounded-2xl border border-white/20 text-sm hover:bg-white/10 transition-all">
                    RESET
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Output */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Output</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            {resultUrl ? (
              <div>
                <div className="w-full h-80 rounded-2xl bg-black/50 flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <div className="text-5xl mb-2">✅</div>
                    <div className="text-sm font-bold text-green-400">MODEL GENERATED</div>
                    <div className="text-xs text-slate-500 mt-1">{meshInfo?.size || 'Unknown size'}</div>
                  </div>
                </div>
                <a href={resultUrl} download="olmec_output.glb"
                  className="mt-4 block w-full bg-richred text-center h-12 leading-[48px] rounded-2xl font-bold hover:scale-[1.02] transition-all text-sm">
                  DOWNLOAD .GLB
                </a>
              </div>
            ) : generating ? (
              <div className="flex flex-col items-center justify-center h-80 text-slate-500">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                <div className="text-sm">{PIPELINE_STEPS[currentStep]?.name || 'Processing...'}</div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-slate-600 text-sm">
                {image ? 'Click GENERATE 3D' : 'Upload an image to begin'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Train;
