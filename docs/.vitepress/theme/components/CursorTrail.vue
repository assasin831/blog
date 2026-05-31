<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface TrailPoint {
  x: number
  y: number
  life: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const enabled = ref(false)
const MAX_TRAIL_POINTS = 48
const TRAIL_SPACING = 5

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let trailPoints: TrailPoint[] = []
let lastX: number | null = null
let lastY: number | null = null
let cursorVisible = false
let nativeCursorZone = false

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
    trailPoints = []
  }
}

function pushTrailPoint(x: number, y: number, strength: number) {
  const lastPoint = trailPoints[trailPoints.length - 1]
  if (lastPoint && Math.hypot(x - lastPoint.x, y - lastPoint.y) < TRAIL_SPACING) {
    lastPoint.x = x
    lastPoint.y = y
    lastPoint.life = Math.min(1, lastPoint.life + strength * 0.22)
    return
  }

  trailPoints.push({
    x,
    y,
    life: Math.min(1, 0.82 + strength * 0.16)
  })

  if (trailPoints.length > MAX_TRAIL_POINTS) {
    trailPoints.splice(0, trailPoints.length - MAX_TRAIL_POINTS)
  }
}

function addMeteorTrail(x: number, y: number, px: number, py: number, strength = 1) {
  const distance = Math.hypot(x - px, y - py)
  if (distance < 2) return

  const dx = x - px
  const dy = y - py
  const steps = Math.min(14, Math.max(1, Math.ceil(distance / TRAIL_SPACING)))

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    pushTrailPoint(px + dx * t, py + dy * t, strength * (0.62 + t * 0.38))
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
  addMeteorTrail(x, y, px, py, event.buttons ? 1.18 : 0.92)
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

function drawMeteorLayer(widthScale: number, alphaScale: number, core = false) {
  if (!ctx || trailPoints.length < 2) return

  const tail = trailPoints[0]
  const head = trailPoints[trailPoints.length - 1]
  const alpha = Math.min(head.life * alphaScale, 1)
  if (alpha < 0.01) return

  const gradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y)
  if (core) {
    gradient.addColorStop(0, 'rgba(129, 140, 248, 0)')
    gradient.addColorStop(0.52, `rgba(165, 180, 252, ${alpha * 0.2})`)
    gradient.addColorStop(0.86, `rgba(191, 219, 254, ${alpha * 0.42})`)
    gradient.addColorStop(1, `rgba(248, 250, 252, ${alpha * 0.68})`)
  } else {
    gradient.addColorStop(0, 'rgba(2, 6, 15, 0)')
    gradient.addColorStop(0.32, `rgba(15, 23, 42, ${alpha * 0.16})`)
    gradient.addColorStop(0.78, `rgba(15, 23, 42, ${alpha * 0.46})`)
    gradient.addColorStop(1, `rgba(5, 7, 18, ${alpha * 0.86})`)
  }

  ctx.strokeStyle = gradient
  ctx.lineWidth = (core ? 1.2 : 3.6) + widthScale * head.life * (core ? 0.62 : 0.78)
  ctx.beginPath()
  ctx.moveTo(tail.x, tail.y)

  for (let i = 1; i < trailPoints.length - 1; i += 1) {
    const point = trailPoints[i]
    const next = trailPoints[i + 1]
    const midX = (point.x + next.x) / 2
    const midY = (point.y + next.y) / 2
    ctx.quadraticCurveTo(point.x, point.y, midX, midY)
  }

  ctx.lineTo(head.x, head.y)
  ctx.stroke()
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

  if (trailPoints.length > 1) {
    ctx.shadowColor = 'rgba(2, 6, 23, 0.3)'
    ctx.shadowBlur = 14
    drawMeteorLayer(22, 1.35)

    ctx.globalCompositeOperation = 'lighter'
    ctx.shadowColor = 'rgba(129, 140, 248, 0.3)'
    ctx.shadowBlur = 10
    drawMeteorLayer(6, 1.1, true)
    ctx.globalCompositeOperation = 'source-over'
    ctx.shadowBlur = 0
  }

  const head = trailPoints[trailPoints.length - 1]
  if (head && cursorVisible && !nativeCursorZone) {
    const headGlow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 26)
    headGlow.addColorStop(0, 'rgba(226, 232, 240, 0.28)')
    headGlow.addColorStop(0.45, 'rgba(99, 102, 241, 0.13)')
    headGlow.addColorStop(1, 'rgba(2, 6, 15, 0)')
    ctx.fillStyle = headGlow
    ctx.beginPath()
    ctx.arc(head.x, head.y, 26, 0, Math.PI * 2)
    ctx.fill()
  }

  for (const point of trailPoints) {
    point.life *= 0.955
  }
  trailPoints = trailPoints.filter((point) => point.life > 0.035)

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
