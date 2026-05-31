<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface TrailGhost {
  x: number
  y: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const enabled = ref(false)
const TRAIL_GHOST_COUNT = 9

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let trailGhosts: TrailGhost[] = []
let lastX: number | null = null
let lastY: number | null = null
let targetX = -80
let targetY = -80
let trailOpacity = 0
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
    trailGhosts = []
    trailOpacity = 0
  }
}

function resetTrail(x: number, y: number) {
  trailGhosts = Array.from({ length: TRAIL_GHOST_COUNT }, () => ({ x, y }))
  targetX = x
  targetY = y
  trailOpacity = 1
}

function ensureTrail(x: number, y: number) {
  if (trailGhosts.length !== TRAIL_GHOST_COUNT) {
    resetTrail(x, y)
  }
}

function updateTrailTarget(x: number, y: number) {
  ensureTrail(x, y)
  targetX = x
  targetY = y
  trailOpacity = Math.min(1, trailOpacity + 0.28)
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
  if (Math.hypot(x - px, y - py) > 1) {
    updateTrailTarget(x, y)
  }
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

function updateTrailGhosts() {
  if (trailGhosts.length !== TRAIL_GHOST_COUNT) return

  const visible = cursorVisible && !nativeCursorZone
  trailOpacity = visible ? Math.min(1, trailOpacity + 0.05) : trailOpacity * 0.82

  trailGhosts[0].x += (targetX - trailGhosts[0].x) * 0.46
  trailGhosts[0].y += (targetY - trailGhosts[0].y) * 0.46

  for (let i = 1; i < trailGhosts.length; i += 1) {
    const leader = trailGhosts[i - 1]
    const ghost = trailGhosts[i]
    const ease = Math.max(0.15, 0.34 - i * 0.018)
    ghost.x += (leader.x - ghost.x) * ease
    ghost.y += (leader.y - ghost.y) * ease
  }
}

function drawTrailCurve(lineWidth: number, color: string, blur: number) {
  if (!ctx || trailGhosts.length < 2) return

  const tail = trailGhosts[trailGhosts.length - 1]
  const head = trailGhosts[0]
  const gradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y)
  gradient.addColorStop(0, 'rgba(2, 6, 15, 0)')
  gradient.addColorStop(0.38, color.replace('ALPHA', `${0.18 * trailOpacity}`))
  gradient.addColorStop(1, color.replace('ALPHA', `${0.62 * trailOpacity}`))

  ctx.strokeStyle = gradient
  ctx.lineWidth = lineWidth
  ctx.shadowColor = color.replace('ALPHA', `${0.26 * trailOpacity}`)
  ctx.shadowBlur = blur
  ctx.beginPath()
  ctx.moveTo(tail.x, tail.y)

  for (let i = trailGhosts.length - 2; i > 0; i -= 1) {
    const ghost = trailGhosts[i]
    const next = trailGhosts[i - 1]
    ctx.quadraticCurveTo(ghost.x, ghost.y, (ghost.x + next.x) / 2, (ghost.y + next.y) / 2)
  }

  ctx.lineTo(head.x, head.y)
  ctx.stroke()
  ctx.shadowBlur = 0
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

  updateTrailGhosts()

  if (trailOpacity > 0.02 && trailGhosts.length === TRAIL_GHOST_COUNT) {
    drawTrailCurve(13, 'rgba(2, 6, 23, ALPHA)', 18)

    ctx.globalCompositeOperation = 'screen'
    drawTrailCurve(3.2, 'rgba(89, 86, 140, ALPHA)', 10)
    ctx.globalCompositeOperation = 'source-over'

    for (let i = trailGhosts.length - 1; i >= 1; i -= 1) {
      const ghost = trailGhosts[i]
      const t = 1 - i / (trailGhosts.length - 1)
      const radius = 8 + t * 12
      const alpha = trailOpacity * (0.06 + t * 0.14)
      const smoke = ctx.createRadialGradient(ghost.x, ghost.y, 0, ghost.x, ghost.y, radius)
      smoke.addColorStop(0, `rgba(2, 6, 23, ${alpha})`)
      smoke.addColorStop(0.46, `rgba(45, 39, 88, ${alpha * 0.45})`)
      smoke.addColorStop(1, 'rgba(2, 6, 15, 0)')
      ctx.fillStyle = smoke
      ctx.beginPath()
      ctx.arc(ghost.x, ghost.y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const head = trailGhosts[0]
    const headGlow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 18)
    headGlow.addColorStop(0, `rgba(226, 232, 240, ${0.18 * trailOpacity})`)
    headGlow.addColorStop(0.48, `rgba(99, 102, 241, ${0.08 * trailOpacity})`)
    headGlow.addColorStop(1, 'rgba(2, 6, 15, 0)')
    ctx.fillStyle = headGlow
    ctx.beginPath()
    ctx.arc(head.x, head.y, 18, 0, Math.PI * 2)
    ctx.fill()
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
