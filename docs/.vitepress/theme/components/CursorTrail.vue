<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface TrailCell {
  vx: number
  vy: number
  energy: number
  glow: number
  grain: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const enabled = ref(false)
const CELL_SIZE = 20
const MAX_DEPOSIT_STEPS = 18

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let trailCells: TrailCell[] = []
let activeCells = new Set<number>()
let gridCols = 0
let gridRows = 0
let lastX: number | null = null
let lastY: number | null = null
let cursorVisible = false
let nativeCursorZone = false

function buildTrailGrid(width: number, height: number) {
  gridCols = Math.ceil(width / CELL_SIZE) + 2
  gridRows = Math.ceil(height / CELL_SIZE) + 2
  trailCells = Array.from({ length: gridCols * gridRows }, (_, index) => ({
    vx: 0,
    vy: 0,
    energy: 0,
    glow: 0,
    grain: ((index * 37) % 17) / 17
  }))
  activeCells = new Set<number>()
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.floor(window.innerWidth * ratio)
  canvas.height = Math.floor(window.innerHeight * ratio)
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  ctx = canvas.getContext('2d')
  ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
  buildTrailGrid(window.innerWidth, window.innerHeight)
}

function isNativeCursorTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('.comments-block, .comments-card, .comments-widget, .utterances, iframe'))
}

function setNativeCursorZone(value: boolean) {
  nativeCursorZone = value
  document.documentElement.classList.toggle('sword-cursor-native-zone', value)
  if (cursorRef.value) {
    cursorRef.value.dataset.nativeZone = value ? 'true' : 'false'
  }
  if (value) {
    hideCursor()
  }
}

function depositTrailEnergy(x: number, y: number, dirX: number, dirY: number, strength: number) {
  const col = Math.floor(x / CELL_SIZE)
  const row = Math.floor(y / CELL_SIZE)

  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      const cellCol = col + ox
      const cellRow = row + oy
      if (cellCol < 0 || cellRow < 0 || cellCol >= gridCols || cellRow >= gridRows) continue

      const index = cellRow * gridCols + cellCol
      const centerX = (cellCol + 0.5) * CELL_SIZE
      const centerY = (cellRow + 0.5) * CELL_SIZE
      const distance = Math.hypot(centerX - x, centerY - y)
      const falloff = Math.max(0, 1 - distance / (CELL_SIZE * 1.45))
      if (falloff <= 0) continue

      const cell = trailCells[index]
      const energy = strength * falloff
      cell.energy = Math.min(1.4, cell.energy + energy * 0.8)
      cell.glow = Math.min(1.1, cell.glow + energy * 0.5)
      cell.vx = cell.vx * 0.58 + dirX * (0.42 + energy * 0.28)
      cell.vy = cell.vy * 0.58 + dirY * (0.42 + energy * 0.28)
      activeCells.add(index)
    }
  }
}

function addGridTrail(x: number, y: number, px: number, py: number, strength = 1) {
  const distance = Math.hypot(x - px, y - py)
  if (distance < 2) return

  const dx = x - px
  const dy = y - py
  const length = Math.max(distance, 1)
  const dirX = dx / length
  const dirY = dy / length
  const steps = Math.min(MAX_DEPOSIT_STEPS, Math.max(1, Math.ceil(distance / (CELL_SIZE * 0.55))))

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    depositTrailEnergy(px + dx * t, py + dy * t, dirX, dirY, strength * (0.72 + t * 0.28))
  }
}

function moveCursor(event: MouseEvent | PointerEvent) {
  if ('pointerType' in event && event.pointerType !== 'mouse') return
  const inNativeZone = isNativeCursorTarget(event.target)
  setNativeCursorZone(inNativeZone)
  if (inNativeZone) return

  const x = event.clientX
  const y = event.clientY
  const px = lastX ?? x
  const py = lastY ?? y

  lastX = x
  lastY = y
  cursorVisible = true
  cursorRef.value?.style.setProperty('--cursor-x', `${x}px`)
  cursorRef.value?.style.setProperty('--cursor-y', `${y}px`)
  addGridTrail(x, y, px, py, event.buttons ? 1.35 : 0.86)
}

function checkCursorZone(event: MouseEvent | PointerEvent) {
  if ('pointerType' in event && event.pointerType !== 'mouse') return
  setNativeCursorZone(isNativeCursorTarget(event.target))
}

function hideCursor() {
  cursorVisible = false
  lastX = null
  lastY = null
}

function draw() {
  if (!ctx) {
    raf = window.requestAnimationFrame(draw)
    return
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  ctx.globalCompositeOperation = 'source-over'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (const index of Array.from(activeCells)) {
    const particle = trailCells[index]
    if (!particle || (particle.energy < 0.012 && particle.glow < 0.01)) {
      activeCells.delete(index)
      continue
    }

    const col = index % gridCols
    const row = Math.floor(index / gridCols)
    const centerX = (col + 0.5) * CELL_SIZE
    const centerY = (row + 0.5) * CELL_SIZE
    const alpha = Math.min(particle.energy, 1)
    const length = 8 + particle.energy * 18
    const shift = (particle.grain - 0.5) * CELL_SIZE * 0.42
    const velocityLength = Math.max(Math.hypot(particle.vx, particle.vy), 0.001)
    const dirX = particle.vx / velocityLength
    const dirY = particle.vy / velocityLength
    const normalX = -dirY
    const normalY = dirX
    const startX = centerX - dirX * length * 0.56 + normalX * shift
    const startY = centerY - dirY * length * 0.56 + normalY * shift
    const endX = centerX + dirX * length * 0.38 + normalX * shift * 0.28
    const endY = centerY + dirY * length * 0.38 + normalY * shift * 0.28

    const gradient = ctx!.createLinearGradient(startX, startY, endX, endY)
    gradient.addColorStop(0, `rgba(2, 6, 15, 0)`)
    gradient.addColorStop(0.46, `rgba(17, 18, 32, ${alpha * 0.13})`)
    gradient.addColorStop(1, `rgba(7, 8, 14, ${alpha * 0.58})`)

    ctx!.strokeStyle = gradient
    ctx!.lineWidth = 0.8 + particle.energy * 3.8
    ctx!.beginPath()
    ctx!.moveTo(startX, startY)
    ctx!.lineTo(endX, endY)
    ctx!.stroke()

    if (particle.glow > 0.06) {
      const radius = 5 + particle.glow * 18
      const shine = ctx!.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2.1)
      shine.addColorStop(0, `rgba(12, 11, 20, ${particle.glow * 0.32})`)
      shine.addColorStop(0.42, `rgba(50, 34, 78, ${particle.glow * 0.12})`)
      shine.addColorStop(1, `rgba(2, 6, 15, 0)`)
      ctx!.fillStyle = shine
      ctx!.beginPath()
      ctx!.arc(centerX, centerY, radius * 2.1, 0, Math.PI * 2)
      ctx!.fill()
    }

    particle.energy *= 0.86
    particle.glow *= 0.82
    particle.vx *= 0.9
    particle.vy *= 0.9
  }

  if (cursorRef.value) {
    cursorRef.value.dataset.visible = cursorVisible && !nativeCursorZone ? 'true' : 'false'
    cursorRef.value.dataset.nativeZone = nativeCursorZone ? 'true' : 'false'
  }

  raf = window.requestAnimationFrame(draw)
}

onMounted(() => {
  const finePointer = window.matchMedia('(pointer: fine)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!finePointer || reducedMotion) return

  enabled.value = true
  document.documentElement.classList.add('has-sword-cursor')

  void nextTick().then(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('pointerover', checkCursorZone)
    window.addEventListener('mouseover', checkCursorZone)
    window.addEventListener('pointermove', moveCursor)
    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('pointerleave', hideCursor)
    raf = window.requestAnimationFrame(draw)
  })
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('has-sword-cursor')
  document.documentElement.classList.remove('sword-cursor-native-zone')
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('pointerover', checkCursorZone)
  window.removeEventListener('mouseover', checkCursorZone)
  window.removeEventListener('pointermove', moveCursor)
  window.removeEventListener('mousemove', moveCursor)
  window.removeEventListener('pointerleave', hideCursor)
  window.cancelAnimationFrame(raf)
})
</script>

<template>
  <canvas v-if="enabled" ref="canvasRef" class="cursor-trail-canvas" aria-hidden="true"></canvas>
  <div v-if="enabled" ref="cursorRef" class="sword-cursor" aria-hidden="true">
    <svg class="sword-cursor-art" viewBox="0 0 64 128" focusable="false">
      <defs>
        <linearGradient id="sword-blade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#6b7280" />
          <stop offset="35%" stop-color="#1f2937" />
          <stop offset="76%" stop-color="#050816" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
        <linearGradient id="sword-edge" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#d1d5db" stop-opacity="0.82" />
          <stop offset="52%" stop-color="#64748b" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#020617" stop-opacity="0.2" />
        </linearGradient>
        <filter id="sword-shadow" x="-45%" y="-35%" width="190%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#020617" flood-opacity="0.58" />
        </filter>
      </defs>
      <g filter="url(#sword-shadow)">
        <path class="sword-blade" fill="url(#sword-blade)" d="M23 3h18l5 83-14 17-14-17Z" />
        <path class="sword-chip" d="M41 10 36 24l7-4M19 52l6 7-7 5M43 66l-7 5 8 7" />
        <path class="sword-edge" fill="url(#sword-edge)" d="M27 8h5v86l-6-9Z" />
        <path class="sword-ridge" d="M33 8v88" />
        <path class="sword-guard" d="M12 86h40l5 9H7Z" />
        <path class="sword-grip" d="M25 94h14v25H25Z" />
        <path class="sword-wrap" d="M25 99h14M25 106h14M25 113h14" />
        <circle class="sword-pommel" cx="32" cy="123" r="5" />
      </g>
    </svg>
  </div>
</template>
