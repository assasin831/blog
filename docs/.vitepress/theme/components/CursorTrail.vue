<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface TrailParticle {
  x: number
  y: number
  px: number
  py: number
  vx: number
  vy: number
  life: number
  maxLife: number
  width: number
  shade: number
  sparkle: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const enabled = ref(false)

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let particles: TrailParticle[] = []
let lastX: number | null = null
let lastY: number | null = null
let cursorVisible = false

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

function addParticles(x: number, y: number, px: number, py: number, count = 2) {
  const distance = Math.hypot(x - px, y - py)
  if (distance < 2) return

  for (let i = 0; i < count; i += 1) {
    const drift = Math.random() * Math.PI * 2
    const offset = (Math.random() - 0.5) * 10
    const dx = x - px
    const dy = y - py
    const length = Math.max(distance, 1)
    const normalX = -dy / length
    const normalY = dx / length
    const trailX = x + normalX * offset
    const trailY = y + normalY * offset
    const trailPX = px + normalX * offset * 0.35
    const trailPY = py + normalY * offset * 0.35
    const speed = 0.08 + Math.random() * 0.34

    particles.push({
      x: trailX,
      y: trailY,
      px: trailPX,
      py: trailPY,
      vx: Math.cos(drift) * speed,
      vy: Math.sin(drift) * speed - 0.04,
      life: 24 + Math.random() * 26,
      maxLife: 50,
      width: 2.2 + Math.random() * 5.8,
      shade: Math.random(),
      sparkle: Math.random()
    })
  }

  if (particles.length > 160) {
    particles = particles.slice(-120)
  }
}

function moveCursor(event: MouseEvent | PointerEvent) {
  if ('pointerType' in event && event.pointerType !== 'mouse') return

  const x = event.clientX
  const y = event.clientY
  const px = lastX ?? x
  const py = lastY ?? y

  lastX = x
  lastY = y
  cursorVisible = true
  cursorRef.value?.style.setProperty('--cursor-x', `${x}px`)
  cursorRef.value?.style.setProperty('--cursor-y', `${y}px`)
  addParticles(x, y, px, py, event.buttons ? 5 : 2)
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

  particles = particles.filter((particle) => {
    particle.x += particle.vx
    particle.y += particle.vy
    particle.px += particle.vx * 0.35
    particle.py += particle.vy * 0.35
    particle.vx *= 0.982
    particle.vy *= 0.982
    particle.life -= 1

    const alpha = Math.pow(Math.max(particle.life / particle.maxLife, 0), 1.35)
    const gradient = ctx!.createLinearGradient(particle.px, particle.py, particle.x, particle.y)
    gradient.addColorStop(0, `rgba(2, 6, 15, 0)`)
    gradient.addColorStop(0.42, `rgba(17, 18, 32, ${alpha * 0.16})`)
    gradient.addColorStop(1, `rgba(7, 8, 14, ${alpha * 0.72})`)

    ctx!.strokeStyle = gradient
    ctx!.lineWidth = particle.width * (0.8 + alpha * 0.55)
    ctx!.beginPath()
    ctx!.moveTo(particle.px, particle.py)
    ctx!.lineTo(particle.x, particle.y)
    ctx!.stroke()

    if (particle.sparkle > 0.32) {
      const radius = particle.width * (2.2 + alpha * 1.8)
      const shine = ctx!.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * 2.7)
      shine.addColorStop(0, `rgba(12, 11, 20, ${alpha * 0.44})`)
      shine.addColorStop(0.42, `rgba(50, 34, 78, ${alpha * 0.18})`)
      shine.addColorStop(1, `rgba(2, 6, 15, 0)`)
      ctx!.fillStyle = shine
      ctx!.beginPath()
      ctx!.arc(particle.x, particle.y, radius * 2.7, 0, Math.PI * 2)
      ctx!.fill()
    }

    return particle.life > 0
  })

  if (cursorRef.value) {
    cursorRef.value.dataset.visible = cursorVisible ? 'true' : 'false'
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
    window.addEventListener('pointermove', moveCursor)
    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('pointerleave', hideCursor)
    raf = window.requestAnimationFrame(draw)
  })
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('has-sword-cursor')
  window.removeEventListener('resize', resizeCanvas)
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
