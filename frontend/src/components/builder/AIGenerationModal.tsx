import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wand2, Upload, Box, AlertCircle, CheckCircle2, Settings } from 'lucide-react'
import { useImageContour } from '../../hooks/useImageContour'
import type { FitConfig } from '../../utils/ImageShapeFitter'

const PRESETS: { label: string; config: Partial<FitConfig> }[] = [
  { label: 'Tight contour', config: { iterations: 200, stiffness: 0.12, edgeWeight: 3.0, curvatureWeight: 0.02 } },
  { label: 'Smooth shape', config: { iterations: 150, stiffness: 0.06, edgeWeight: 1.5, curvatureWeight: 0.08 } },
  { label: 'Quick draft', config: { iterations: 50, stiffness: 0.1, edgeWeight: 2.0, curvatureWeight: 0.04 } },
  { label: '3D heightmap', config: { iterations: 100, stiffness: 0.05, edgeWeight: 1.0, zMode: 'edge_strength', zScale: 0.5 } },
]

interface AIGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  onPointsGenerated: (points: Float32Array, label: string) => void
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({ isOpen, onClose, onPointsGenerated }) => {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [segments, setSegments] = useState(64)
  const [presetIdx, setPresetIdx] = useState(0)
  const [mode, setMode] = useState<'circle' | 'grid'>('circle')
  const [gridRes, setGridRes] = useState(16)

  const { loadImage, fitCircle, fitGrid, pointData, running } = useImageContour()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setImage(null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setError(null)
    }
  }, [isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        setError('Image too large. Maximum 10MB.')
        return
      }
      setImage(file)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleGenerate = useCallback(async () => {
    if (!image || !preview) { setError('Select an image first'); return }
    setIsGenerating(true)
    setError(null)

    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = preview })
      await loadImage(img)

      const cfg = PRESETS[presetIdx].config
      let result: Float32Array
      if (mode === 'circle') {
        result = fitCircle(segments, 0.5, 0.5, 0.35, cfg)
      } else {
        result = fitGrid(gridRes, gridRes, cfg)
      }

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          ctx.drawImage(img, 0, 0)
          ctx.strokeStyle = '#dc2626'
          ctx.lineWidth = 2
          ctx.beginPath()
          for (let i = 0; i < result.length; i += 3) {
            const x = result[i] * canvasRef.current.width
            const y = result[i + 1] * canvasRef.current.height
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.stroke()
          ctx.fillStyle = '#dc262680'
          for (let i = 0; i < result.length; i += 3) {
            ctx.beginPath()
            ctx.arc(result[i] * canvasRef.current.width, result[i + 1] * canvasRef.current.height, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      onPointsGenerated(result, PRESETS[presetIdx].label)
      setTimeout(() => { setIsGenerating(false); onClose() }, 1200)
    } catch (err: any) {
      setError(err.message || 'Generation failed')
      setIsGenerating(false)
    }
  }, [image, preview, mode, segments, gridRes, presetIdx, loadImage, fitCircle, fitGrid, onPointsGenerated, onClose])

  const isDisabled = isGenerating || !image

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
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-richred/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-richred rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                  <Wand2 className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Image → 3D Points</h2>
                  <p className="text-[10px] uppercase tracking-widest text-richred font-black">Deterministic Contour Fittting</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upload Reference Image</label>
                <div
                  className={`w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer ${preview ? 'border-richred/50 bg-richred/5' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                  onClick={() => !isGenerating && document.getElementById('ai-image-upload')?.click()}
                >
                  <input
                    id="ai-image-upload"
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    disabled={isGenerating}
                  />
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-contain p-4" />
                  ) : (
                    <>
                      <Upload className="text-slate-500 mb-2" size={32} />
                      <p className="text-xs text-slate-500 font-medium text-center px-8">
                        Drop an image or click to upload<br />
                        <span className="text-[10px] opacity-50">PNG, JPG, WebP • Max 10MB</span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mode</label>
                  <select
                    value={mode}
                    onChange={e => setMode(e.target.value as 'circle' | 'grid')}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                  >
                    <option value="circle">Contour (Circle)</option>
                    <option value="grid">Surface (Grid)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preset</label>
                  <select
                    value={presetIdx}
                    onChange={e => setPresetIdx(Number(e.target.value))}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                  >
                    {PRESETS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                  </select>
                </div>
                {mode === 'circle' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points</label>
                    <input type="number" min={4} max={256} value={segments}
                      onChange={e => setSegments(Number(e.target.value))}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}
                {mode === 'grid' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grid Resolution</label>
                    <input type="number" min={4} max={64} value={gridRes}
                      onChange={e => setGridRes(Number(e.target.value))}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} width={400} height={300} className="w-full h-36 bg-black/40 rounded-2xl hidden" />

              <AnimatePresence mode="wait">
                {isGenerating && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 text-richred font-mono text-xs">
                      <div className="w-4 h-4 border-2 border-richred/30 border-t-richred rounded-full animate-spin"></div>
                      Fitting contour... {running ? 'optimizing' : 'done'}
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-richred"
                        initial={{ width: '10%' }}
                        animate={{ width: '90%' }}
                        transition={{ duration: 1.5 }}
                      />
                    </div>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-500 text-xs"
                  >
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold mb-1">Generation Failed</p>
                      <p className="opacity-80">{error}</p>
                    </div>
                  </motion.div>
                )}
                {!isGenerating && !error && image && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-green-500 text-xs"
                  >
                    <CheckCircle2 size={14} />
                    Image ready. Points will fit to image contours. No AI, no training.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-8 pt-0">
              <button
                disabled={isDisabled}
                onClick={handleGenerate}
                className="w-full bg-richred hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_10px_30px_rgba(220,38,38,0.2)] disabled:shadow-none"
              >
                {isGenerating ? (
                  <><Box size={20} />FITTING CONTOUR...</>
                ) : (
                  <><Settings size={20} />GENERATE 3D POINTS</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
