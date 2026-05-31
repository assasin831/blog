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
        <radialGradient id="paw-top-fur" cx="34%" cy="22%" r="78%">
          <stop offset="0%" stop-color="#fff7e7" />
          <stop offset="45%" stop-color="#d9ad79" />
          <stop offset="100%" stop-color="#8d5e38" />
        </radialGradient>
        <linearGradient id="paw-claw" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#fffaf0" />
          <stop offset="100%" stop-color="#9b6a42" />
        </linearGradient>
        <filter id="paw-soft-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#120d0a" flood-opacity="0.32" />
        </filter>
      </defs>
      <g filter="url(#paw-soft-shadow)">
        <path
          class="paw-top-base"
          fill="url(#paw-top-fur)"
          d="M15.7 42.5c.9-12.2 9.3-20.4 20.1-20.4 11 0 19.8 8.4 20.7 20.7.8 11.2-6.2 18.2-20.4 18.2-14.3 0-21.2-7.2-20.4-18.5Z"
        />
        <ellipse class="paw-top-toe" fill="url(#paw-top-fur)" cx="17.9" cy="27.5" rx="8.3" ry="10.3" transform="rotate(-22 17.9 27.5)" />
        <ellipse class="paw-top-toe" fill="url(#paw-top-fur)" cx="30.7" cy="19.3" rx="8.8" ry="11.2" transform="rotate(-7 30.7 19.3)" />
        <ellipse class="paw-top-toe" fill="url(#paw-top-fur)" cx="44.7" cy="20.7" rx="8.6" ry="10.9" transform="rotate(13 44.7 20.7)" />
        <ellipse class="paw-top-toe" fill="url(#paw-top-fur)" cx="55.8" cy="30.2" rx="7.5" ry="9.8" transform="rotate(29 55.8 30.2)" />
        <path class="paw-claw" fill="url(#paw-claw)" d="M12.2 17.1c4.3.4 7.4 2.1 9.4 5.2-4.4-.8-7.5-.2-9.4 1.9-.7-2.4-.7-4.8 0-7.1Z" />
        <path class="paw-claw" fill="url(#paw-claw)" d="M28 8.8c4 1.3 6.5 3.8 7.6 7.3-3.9-1.7-7-1.9-9.4-.4-.1-2.6.5-4.9 1.8-6.9Z" />
        <path class="paw-claw" fill="url(#paw-claw)" d="M47.8 10.5c2.8 2.5 4.1 5.5 3.8 8.9-2.9-2.6-5.6-3.7-8.1-3.1.7-2.5 2.2-4.5 4.3-5.8Z" />
        <path class="paw-claw" fill="url(#paw-claw)" d="M63 22.7c1.1 3.6.5 6.8-1.8 9.5-1.3-3.5-3.2-5.8-5.6-6.9 1.9-1.7 4.4-2.6 7.4-2.6Z" />
        <path class="paw-fur-line" d="M25.2 34.6c3.1-2.6 6.6-3.9 10.5-3.9 4.3 0 8.1 1.5 11.4 4.4" />
        <path class="paw-fur-line" d="M29.5 45.2c4.1 1.8 8.5 1.9 13.2.2" />
        <path class="paw-fur-line" d="M19.7 34.1c-2.4 2.2-3.6 5.1-3.7 8.7" />
        <path class="paw-fur-line" d="M53.2 36.1c2 2.5 2.8 5.6 2.4 9.1" />
      </g>
    </svg>
  </div>
</template>
