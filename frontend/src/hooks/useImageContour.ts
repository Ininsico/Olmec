import { useRef, useCallback, useState } from 'react'
import { ImageShapeFitter, type FitConfig } from '../utils/ImageShapeFitter'

export function useImageContour() {
  const fitterRef = useRef(new ImageShapeFitter())
  const [pointData, setPointData] = useState<{ points: Float32Array; w: number; h: number } | null>(null)
  const [running, setRunning] = useState(false)

  const loadImage = useCallback((src: string | HTMLImageElement | HTMLCanvasElement) => {
    return new Promise<{ w: number; h: number }>((resolve, reject) => {
      const handle = (img: HTMLImageElement) => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('No canvas context')); return }
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        fitterRef.current.setTarget(imageData)
        resolve({ w: canvas.width, h: canvas.height })
      }

      if (typeof src === 'string') {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => handle(img)
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = src
      } else if (src instanceof HTMLCanvasElement) {
        const imageData = src.getContext('2d')!.getImageData(0, 0, src.width, src.height)
        fitterRef.current.setTarget(imageData)
        resolve({ w: src.width, h: src.height })
      } else {
        handle(src)
      }
    })
  }, [])

  const loadImageData = useCallback((data: ImageData) => {
    fitterRef.current.setTarget(data)
    return { w: data.width, h: data.height }
  }, [])

  const fitCircle = useCallback((
    segments: number = 32,
    cx: number = 0.5,
    cy: number = 0.5,
    radius: number = 0.3,
    config?: Partial<FitConfig>
  ): Float32Array => {
    setRunning(true)
    const result = fitterRef.current.fitCircle(segments, cx, cy, radius, config)
    setPointData({ points: result, w: fitterRef.current.width, h: fitterRef.current.height })
    setRunning(false)
    return result
  }, [])

  const fitGrid = useCallback((
    gridX: number,
    gridY: number,
    config?: Partial<FitConfig>
  ): Float32Array => {
    setRunning(true)
    const result = fitterRef.current.fitGrid(gridX, gridY, config)
    setPointData({ points: result, w: fitterRef.current.width, h: fitterRef.current.height })
    setRunning(false)
    return result
  }, [])

  const fitPoints = useCallback((
    initialPoints: number[][],
    config?: Partial<FitConfig>
  ): Float32Array => {
    setRunning(true)
    const result = fitterRef.current.fit(initialPoints, config)
    setPointData({ points: result, w: fitterRef.current.width, h: fitterRef.current.height })
    setRunning(false)
    return result
  }, [])

  const getEdgeMap = useCallback(() => fitterRef.current.getEdgeMap(), [])
  const getGrayscale = useCallback(() => fitterRef.current.getGrayscale(), [])
  const getFitter = useCallback(() => fitterRef.current, [])

  return {
    fitCircle,
    fitGrid,
    fitPoints,
    loadImage,
    loadImageData,
    getEdgeMap,
    getGrayscale,
    getFitter,
    pointData,
    running,
    get width() { return fitterRef.current.width },
    get height() { return fitterRef.current.height },
  }
}
