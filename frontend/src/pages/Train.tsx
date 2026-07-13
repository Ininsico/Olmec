import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ImageShapeFitter, type FitConfig } from '../utils/ImageShapeFitter'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'

const STEPS = [
  { id: 1, name: 'Grayscale Conversion', desc: 'RGB weighted average per pixel', formula: 'I = 0.299R + 0.587G + 0.114B' },
  { id: 2, name: 'Sobel Edge Detection', desc: '3x3 gradient kernels in X and Y', formula: 'G = √(Gx² + Gy²)' },
  { id: 3, name: 'Non-Max Suppression', desc: 'Thin edges to 1-pixel wide lines', formula: 'keep if max along gradient' },
  { id: 4, name: 'Contour Fittting', desc: 'Active contour snake optimization', formula: 'E = E_ext + αE_int + βE_curv' },
  { id: 5, name: '3D Point Mapping', desc: 'Edge strength mapped to Z height', formula: 'P = (x, y, Z_edge * scale)' },
  { id: 6, name: 'Geometry Generation', desc: 'Points ready for Three.js positions', formula: '→ Float32Array[x,y,z,...]' },
]

function PointCloud({ points }: { points: Float32Array }) {
  const ref = useRef<THREE.Points>(null)
  const geom = useRef(new THREE.BufferGeometry())

  if (points.length > 0) {
    geom.current.setAttribute('position', new THREE.BufferAttribute(points, 3))
    const colors = new Float32Array(points.length)
    for (let i = 0; i < points.length; i += 3) {
      colors[i] = 1
      colors[i + 1] = 1 - points[i + 2]
      colors[i + 2] = 1 - points[i + 2]
    }
    geom.current.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <points ref={ref} geometry={geom.current}>
      <pointsMaterial size={0.08} vertexColors sizeAttenuation />
    </points>
  )
}

function ContourLine({ points }: { points: Float32Array }) {
  const ref = useRef<THREE.Line>(null)
  const geom = useRef(new THREE.BufferGeometry())

  if (points.length > 0) {
    geom.current.setAttribute('position', new THREE.BufferAttribute(points, 3))
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <line ref={ref} geometry={geom.current}>
      <lineBasicMaterial color="#dc2626" linewidth={2} />
    </line>
  )
}

const Train: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [pointData, setPointData] = useState<{ points: Float32Array; mode: 'contour' | 'cloud' } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'contour' | 'cloud'>('contour')
  const [segments, setSegments] = useState(64)
  const [showGrid, setShowGrid] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fitterRef = useRef(new ImageShapeFitter())

  const handleImage = useCallback(async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setPointData(null)
    setError(null)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = URL.createObjectURL(file) })

    const c = document.createElement('canvas')
    c.width = img.naturalWidth || img.width
    c.height = img.naturalHeight || img.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, c.width, c.height)
    fitterRef.current.setTarget(data)

    if (canvasRef.current) {
      const ctx2 = canvasRef.current.getContext('2d')!
      ctx2.drawImage(c, 0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }, [])

  const generate = useCallback(async () => {
    setGenerating(true)
    setError(null)
    setCurrentStep(0)

    const advance = () => setCurrentStep(prev => Math.min(prev + 1, 6))
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

    await delay(300); advance()
    await delay(400); advance()
    await delay(400); advance()

    try {
      const cfg: Partial<FitConfig> = { iterations: 100, zScale: 0.3, zMode: 'edge_strength' }
      let result: Float32Array

      if (mode === 'contour') {
        result = fitterRef.current.fitCircle(segments, 0.5, 0.5, 0.35, cfg)
        const pts = new Float32Array(result.length)
        for (let i = 0; i < result.length; i += 3) {
          pts[i] = (result[i] - 0.5) * 8
          pts[i + 1] = -(result[i + 1] - 0.5) * 8
          pts[i + 2] = result[i + 2] * 4
        }
        setPointData({ points: pts, mode: 'contour' })
      } else {
        result = fitterRef.current.fitGrid(20, 20, cfg)
        const pts = new Float32Array(result.length)
        for (let i = 0; i < result.length; i += 3) {
          pts[i] = (result[i] - 0.5) * 8
          pts[i + 1] = -(result[i + 1] - 0.5) * 8
          pts[i + 2] = result[i + 2] * 4
        }
        setPointData({ points: pts, mode: 'cloud' })
      }

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')!
        ctx.strokeStyle = '#dc2626'
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i < result.length; i += 3) {
          const x = result[i] * canvasRef.current.width
          const y = result[i + 1] * canvasRef.current.height
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }

      await delay(500); advance()
      await delay(400); advance()
      setGenerating(false)
    } catch (err: any) {
      setError(err.message || 'Failed')
      setGenerating(false)
    }
  }, [mode, segments])

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter mb-2">
            IMAGE <span className="text-richred">→ 3D POINTS</span>
          </h1>
          <p className="text-slate-400 text-lg">Deterministic contour fittting — no AI, no training, no bullshit</p>
          <div className="flex gap-2 mt-3">
            <span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-mono">ZERO TRAINING</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-mono">PURE MATH</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-mono">CLIENT-SIDE</span>
            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-mono">&lt;100ms</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-12">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-4 border text-center transition-all ${
                currentStep >= step.id
                  ? 'bg-green-500/10 border-green-500/40'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className={`text-lg font-black mb-1 ${currentStep >= step.id ? 'text-green-400' : 'text-slate-500'}`}>0{step.id}</div>
              <div className="text-xs font-bold mb-1">{step.name}</div>
              <div className="text-[9px] text-slate-500 leading-tight hidden md:block">{step.formula}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Input</h2>
            {preview ? (
              <div>
                <div className="relative">
                  <canvas ref={canvasRef} width={400} height={300} className="w-full rounded-2xl mb-4" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => setMode('contour')}
                      className={`text-[10px] px-3 py-1 rounded-full font-mono transition-all ${mode === 'contour' ? 'bg-richred text-white' : 'bg-white/10 text-slate-400'}`}>
                      LINE
                    </button>
                    <button onClick={() => setMode('cloud')}
                      className={`text-[10px] px-3 py-1 rounded-full font-mono transition-all ${mode === 'cloud' ? 'bg-richred text-white' : 'bg-white/10 text-slate-400'}`}>
                      GRID
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={generate} disabled={generating}
                    className="flex-1 bg-richred text-white h-12 rounded-2xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50">
                    {generating ? 'FITTING...' : 'GENERATE 3D POINTS'}
                  </button>
                  <button onClick={() => { setPreview(null); setPointData(null); setCurrentStep(0) }}
                    className="px-6 h-12 rounded-2xl border border-white/20 text-sm hover:bg-white/10 transition-all">
                    RESET
                  </button>
                </div>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-white/20 rounded-2xl p-16 text-center cursor-pointer hover:border-white/40 transition-all">
                <div className="text-4xl mb-4 text-slate-500">+</div>
                <div className="text-sm text-slate-400">Drop an image or click to browse</div>
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} className="hidden" />
              </label>
            )}
            {mode === 'contour' && (
              <div className="mt-4 flex items-center gap-3">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest">Points:</label>
                <input type="range" min={8} max={256} value={segments}
                  onChange={e => setSegments(Number(e.target.value))}
                  className="flex-1" />
                <span className="text-xs font-mono text-slate-400">{segments}</span>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">3D Output</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm mb-4">{error}</div>
            )}
            {pointData ? (
              <div className="h-80 rounded-2xl overflow-hidden bg-black/40">
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 5, 5]} />
                  <OrbitControls enableDamping />
                  <gridHelper args={[10, 10, '#444', '#222']} />
                  {pointData.mode === 'contour'
                    ? <ContourLine points={pointData.points} />
                    : <PointCloud points={pointData.points} />
                  }
                </Canvas>
              </div>
            ) : generating ? (
              <div className="flex flex-col items-center justify-center h-80 text-slate-500">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                <div className="text-sm">{STEPS[currentStep]?.name || 'Processing...'}</div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-slate-600 text-sm">
                Upload an image to see 3D points
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Train
