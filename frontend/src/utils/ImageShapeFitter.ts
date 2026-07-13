export interface FitConfig {
  iterations: number
  learningRate: number
  stiffness: number
  damping: number
  edgeWeight: number
  curvatureWeight: number
  zMode: 'flat' | 'edge_strength' | 'brightness' | 'inverse_brightness'
  zScale: number
  zOffset: number
  normalizeCoords: boolean
}

const DEFAULTS: FitConfig = {
  iterations: 120,
  learningRate: 0.15,
  stiffness: 0.08,
  damping: 0.85,
  edgeWeight: 2.0,
  curvatureWeight: 0.04,
  zMode: 'edge_strength',
  zScale: 1.0,
  zOffset: 0.0,
  normalizeCoords: true,
}

function grayscale(data: Uint8ClampedArray): Float32Array {
  const len = data.length >> 2
  const out = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const j = i << 2
    out[i] = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2]
  }
  return out
}

function sobel(gray: Float32Array, w: number, h: number): { mag: Float32Array; dx: Float32Array; dy: Float32Array } {
  const mag = new Float32Array(gray.length)
  const dx = new Float32Array(gray.length)
  const dy = new Float32Array(gray.length)

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx =
        -gray[i - w - 1] + gray[i - w + 1]
        - 2 * gray[i - 1] + 2 * gray[i + 1]
        - gray[i + w - 1] + gray[i + w + 1]
      const gy =
        -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1]
        + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1]
      dx[i] = gx
      dy[i] = gy
      mag[i] = Math.sqrt(gx * gx + gy * gy)
    }
  }
  return { mag, dx, dy }
}

function nonMaxSuppress(mag: Float32Array, dx: Float32Array, dy: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(mag.length)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const angle = Math.atan2(dy[i], dx[i])
      const dir = ((angle + Math.PI) / Math.PI) * 4
      const d = Math.round(dir) % 4

      let n1 = 0, n2 = 0
      if (d === 0) { n1 = mag[i - 1]; n2 = mag[i + 1] }
      else if (d === 1) { n1 = mag[i - w - 1]; n2 = mag[i + w + 1] }
      else if (d === 2) { n1 = mag[i - w]; n2 = mag[i + w] }
      else { n1 = mag[i - w + 1]; n2 = mag[i + w - 1] }

      if (mag[i] >= n1 && mag[i] >= n2) out[i] = mag[i]
    }
  }
  return out
}

function clamp01(v: number): number { return v < 0 ? 0 : v > 1 ? 1 : v }

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t }

function sampleField(field: Float32Array, w: number, h: number, x: number, y: number): number {
  const fx = clamp01(x) * (w - 1)
  const fy = clamp01(y) * (h - 1)
  const ix = Math.floor(fx)
  const iy = Math.floor(fy)
  const ox = fx - ix
  const oy = fy - iy
  const ix1 = Math.min(ix + 1, w - 1)
  const iy1 = Math.min(iy + 1, h - 1)
  const a = field[iy * w + ix]
  const b = field[iy * w + ix1]
  const c = field[iy1 * w + ix]
  const d = field[iy1 * w + ix1]
  return lerp(lerp(a, b, ox), lerp(c, d, ox), oy)
}

function sampleVec(fieldX: Float32Array, fieldY: Float32Array, w: number, h: number, x: number, y: number): [number, number] {
  const fx = clamp01(x) * (w - 1)
  const fy = clamp01(y) * (h - 1)
  const ix = Math.floor(fx)
  const iy = Math.floor(fy)
  const ox = fx - ix
  const oy = fy - iy
  const ix1 = Math.min(ix + 1, w - 1)
  const iy1 = Math.min(iy + 1, h - 1)

  const ax = fieldX[iy * w + ix]; const ay = fieldY[iy * w + ix]
  const bx = fieldX[iy * w + ix1]; const by = fieldY[iy * w + ix1]
  const cx = fieldX[iy1 * w + ix]; const cy = fieldY[iy1 * w + ix]
  const dx = fieldX[iy1 * w + ix1]; const dy = fieldY[iy1 * w + ix1]

  const rx = lerp(lerp(ax, bx, ox), lerp(cx, dx, ox), oy)
  const ry = lerp(lerp(ay, by, ox), lerp(cy, dy, ox), oy)
  return [rx, ry]
}

export class ImageShapeFitter {
  private w = 0
  private h = 0
  private edgeMap: Float32Array = new Float32Array()
  private gray: Float32Array = new Float32Array()
  private dx: Float32Array = new Float32Array()
  private dy: Float32Array = new Float32Array()

  setTarget(imageData: ImageData): void {
    this.w = imageData.width
    this.h = imageData.height
    this.gray = grayscale(imageData.data)
    const { mag, dx, dy } = sobel(this.gray, this.w, this.h)
    this.dx = dx
    this.dy = dy
    this.edgeMap = nonMaxSuppress(mag, dx, dy, this.w, this.h)

    const max = this.edgeMap.reduce((a, b) => Math.max(a, b), 0)
    if (max > 0) {
      for (let i = 0; i < this.edgeMap.length; i++) {
        this.edgeMap[i] /= max
      }
    }
  }

  get width(): number { return this.w }
  get height(): number { return this.h }
  getEdgeMap(): Float32Array { return this.edgeMap }
  getGrayscale(): Float32Array { return this.gray }

  fit(
    initialPoints: number[][],
    config: Partial<FitConfig> = {}
  ): Float32Array {
    const cfg = { ...DEFAULTS, ...config }

    const n = initialPoints.length
    if (n < 3) throw new Error('Need at least 3 points')

    const pts: [number, number][] = initialPoints.map(p => [p[0], p[1]])
    const vel: [number, number][] = pts.map(() => [0, 0])

    for (let iter = 0; iter < cfg.iterations; iter++) {
      const decay = 1 - (iter / cfg.iterations) * 0.3
      const lr = cfg.learningRate * decay
      const edgeW = cfg.edgeWeight * (0.5 + 0.5 * decay)

      const forces: [number, number][] = pts.map(() => [0, 0])

      for (let i = 0; i < n; i++) {
        const px = pts[i][0]
        const py = pts[i][1]

        const edgeVal = sampleField(this.edgeMap, this.w, this.h, px, py)
        const [gx, gy] = sampleVec(this.dx, this.dy, this.w, this.h, px, py)
        const gradLen = Math.sqrt(gx * gx + gy * gy) + 0.001
        forces[i][0] += edgeW * edgeVal * (gx / gradLen)
        forces[i][1] += edgeW * edgeVal * (gy / gradLen)

        const prev = (i - 1 + n) % n
        const next = (i + 1) % n
        forces[i][0] += cfg.stiffness * ((pts[prev][0] + pts[next][0]) / 2 - px)
        forces[i][1] += cfg.stiffness * ((pts[prev][1] + pts[next][1]) / 2 - py)

        if (cfg.curvatureWeight > 0) {
          const pprev = (i - 2 + n) % n
          const nnext = (i + 2) % n
          const cpx = (pts[pprev][0] + pts[nnext][0]) / 2 - pts[prev][0]
          const cpy = (pts[pprev][1] + pts[nnext][1]) / 2 - pts[prev][1]
          forces[i][0] -= cfg.curvatureWeight * cpx
          forces[i][1] -= cfg.curvatureWeight * cpy
        }
      }

      for (let i = 0; i < n; i++) {
        vel[i][0] = cfg.damping * vel[i][0] + lr * forces[i][0]
        vel[i][1] = cfg.damping * vel[i][1] + lr * forces[i][1]
        pts[i][0] = clamp01(pts[i][0] + vel[i][0])
        pts[i][1] = clamp01(pts[i][1] + vel[i][1])
      }
    }

    const out = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const u = cfg.normalizeCoords ? pts[i][0] : pts[i][0] * this.w
      const v = cfg.normalizeCoords ? pts[i][1] : pts[i][1] * this.h
      out[i * 3] = u
      out[i * 3 + 1] = v

      let z = 0
      if (cfg.zMode === 'edge_strength') {
        z = sampleField(this.edgeMap, this.w, this.h, pts[i][0], pts[i][1])
      } else if (cfg.zMode === 'brightness') {
        z = 1 - sampleField(this.gray, this.w, this.h, pts[i][0], pts[i][1])
      } else if (cfg.zMode === 'inverse_brightness') {
        z = sampleField(this.gray, this.w, this.h, pts[i][0], pts[i][1])
      }
      out[i * 3 + 2] = z * cfg.zScale + cfg.zOffset
    }
    return out
  }

  fitGrid(
    gridX: number,
    gridY: number,
    config: Partial<FitConfig> = {}
  ): Float32Array {
    const pts: number[][] = []
    for (let gy = 0; gy < gridY; gy++) {
      for (let gx = 0; gx < gridX; gx++) {
        pts.push([gx / (gridX - 1), gy / (gridY - 1)])
      }
    }
    return this.fit(pts, config)
  }

  fitCircle(
    segments: number,
    cx: number = 0.5,
    cy: number = 0.5,
    radius: number = 0.3,
    config: Partial<FitConfig> = {}
  ): Float32Array {
    const pts: number[][] = []
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2
      pts.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius])
    }
    return this.fit(pts, config)
  }

  fitShape(
    shape: Float32Array,
    config: Partial<FitConfig> = {}
  ): Float32Array {
    const pts: number[][] = []
    for (let i = 0; i < shape.length; i += 3) {
      pts.push([shape[i], shape[i + 1]])
    }
    return this.fit(pts, config)
  }
}
