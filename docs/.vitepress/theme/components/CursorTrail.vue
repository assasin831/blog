<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

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
  hue: number
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
      life: 18 + Math.random() * 18,
      maxLife: 36,
      width: 1.2 + Math.random() * 2.8,
      hue: [205, 196, 42, 330][Math.floor(Math.random() * 4)],
      sparkle: Math.random()
    })
  }

  if (particles.length > 130) {
    particles = particles.slice(-100)
  }
}

function moveCursor(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return

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
  ctx.globalCompositeOperation = 'lighter'
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
    gradient.addColorStop(0, `hsla(${particle.hue}, 92%, 72%, 0)`)
    gradient.addColorStop(0.36, `hsla(${particle.hue}, 92%, 72%, ${alpha * 0.16})`)
    gradient.addColorStop(1, `hsla(${particle.hue}, 96%, 78%, ${alpha * 0.72})`)

    ctx!.strokeStyle = gradient
    ctx!.lineWidth = particle.width * (0.8 + alpha * 0.55)
    ctx!.beginPath()
    ctx!.moveTo(particle.px, particle.py)
    ctx!.lineTo(particle.x, particle.y)
    ctx!.stroke()

    if (particle.sparkle > 0.55) {
      const radius = particle.width * (1.7 + alpha)
      const shine = ctx!.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * 2.7)
      shine.addColorStop(0, `hsla(${particle.hue}, 95%, 82%, ${alpha * 0.5})`)
      shine.addColorStop(1, `hsla(${particle.hue}, 95%, 68%, 0)`)
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
  document.documentElement.classList.add('has-paw-cursor')

  requestAnimationFrame(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('pointermove', moveCursor)
    window.addEventListener('pointerleave', hideCursor)
    raf = window.requestAnimationFrame(draw)
  })
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('has-paw-cursor')
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('pointermove', moveCursor)
  window.removeEventListener('pointerleave', hideCursor)
  window.cancelAnimationFrame(raf)
})
</script>

<template>
  <canvas v-if="enabled" ref="canvasRef" class="cursor-trail-canvas" aria-hidden="true"></canvas>
  <div v-if="enabled" ref="cursorRef" class="paw-cursor" aria-hidden="true">
    <svg class="paw-cursor-art" viewBox="0 0 72 72" focusable="false">
      <defs>
        <radialGradient id="paw-fur" cx="36%" cy="26%" r="74%">
          <stop offset="0%" stop-color="#fff7e8" />
          <stop offset="46%" stop-color="#e7c9a1" />
          <stop offset="100%" stop-color="#b98557" />
        </radialGradient>
        <radialGradient id="paw-pad" cx="34%" cy="26%" r="78%">
          <stop offset="0%" stop-color="#ffe5e5" />
          <stop offset="48%" stop-color="#f5a2ae" />
          <stop offset="100%" stop-color="#c84f69" />
        </radialGradient>
        <filter id="paw-soft-shadow" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#172033" flood-opacity="0.26" />
        </filter>
      </defs>
      <g filter="url(#paw-soft-shadow)">
        <path
          class="paw-fur"
          fill="url(#paw-fur)"
          d="M12 41.5C10.6 31.5 17.8 23 28.2 20.8c11.4-2.4 23.6 2.4 29.4 12.8 5.2 9.4 2.6 20.5-6.1 25.8-8.4 5.1-23.8 4.6-32.3-1.2-5.1-3.5-6.5-9-7.2-16.7Z"
        />
        <ellipse class="paw-toe-fur" fill="url(#paw-fur)" cx="18.4" cy="26.5" rx="8.8" ry="11.1" transform="rotate(-24 18.4 26.5)" />
        <ellipse class="paw-toe-fur" fill="url(#paw-fur)" cx="32" cy="18.5" rx="9.2" ry="11.8" transform="rotate(-5 32 18.5)" />
        <ellipse class="paw-toe-fur" fill="url(#paw-fur)" cx="46.8" cy="21.2" rx="8.9" ry="11.1" transform="rotate(20 46.8 21.2)" />
        <ellipse class="paw-toe-fur" fill="url(#paw-fur)" cx="56.2" cy="34.2" rx="7.9" ry="9.9" transform="rotate(35 56.2 34.2)" />
        <ellipse class="paw-toe-pad" fill="url(#paw-pad)" cx="18.7" cy="27.1" rx="4.9" ry="6.4" transform="rotate(-24 18.7 27.1)" />
        <ellipse class="paw-toe-pad" fill="url(#paw-pad)" cx="32.1" cy="19.2" rx="5.2" ry="6.9" transform="rotate(-5 32.1 19.2)" />
        <ellipse class="paw-toe-pad" fill="url(#paw-pad)" cx="46.4" cy="21.8" rx="5" ry="6.4" transform="rotate(20 46.4 21.8)" />
        <ellipse class="paw-toe-pad" fill="url(#paw-pad)" cx="55.4" cy="34.6" rx="4.4" ry="5.7" transform="rotate(35 55.4 34.6)" />
        <path
          class="paw-pad"
          fill="url(#paw-pad)"
          d="M24.8 45.2c1.5-8.2 6.5-12.8 13.1-12.2 6.1.5 10.7 5.3 11.7 12.2 1.2 8.5-4.7 12.2-12.8 12.1-8.1-.1-13.6-4.2-12-12.1Z"
        />
        <path class="paw-highlight" d="M20.5 23.3c-2.8.6-4.3 2.9-4.5 5.3" />
        <path class="paw-highlight" d="M33.9 14.3c-3.2.3-5.3 2.1-6 5" />
        <path class="paw-highlight" d="M37.8 36.7c-4.1.5-7 3.3-8 7.5" />
      </g>
    </svg>
  </div>
</template>
