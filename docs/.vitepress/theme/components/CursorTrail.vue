<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const enabled = ref(false)

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let particles: Particle[] = []
let lastX = 0
let lastY = 0
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

function addParticles(x: number, y: number, count = 3) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.45 + Math.random() * 1.45
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.25,
      life: 26 + Math.random() * 22,
      maxLife: 48,
      size: 2.2 + Math.random() * 5.8,
      hue: [205, 190, 32, 342][Math.floor(Math.random() * 4)]
    })
  }
  if (particles.length > 180) {
    particles = particles.slice(-140)
  }
}

function moveCursor(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return

  lastX = event.clientX
  lastY = event.clientY
  cursorVisible = true
  cursorRef.value?.style.setProperty('--cursor-x', `${lastX}px`)
  cursorRef.value?.style.setProperty('--cursor-y', `${lastY}px`)
  addParticles(lastX, lastY, event.buttons ? 6 : 3)
}

function hideCursor() {
  cursorVisible = false
}

function draw() {
  if (!ctx) {
    raf = window.requestAnimationFrame(draw)
    return
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  ctx.globalCompositeOperation = 'lighter'

  particles = particles.filter((particle) => {
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vx *= 0.982
    particle.vy *= 0.982
    particle.life -= 1

    const alpha = Math.max(particle.life / particle.maxLife, 0)
    const radius = particle.size * (0.7 + alpha)
    const gradient = ctx!.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * 3)
    gradient.addColorStop(0, `hsla(${particle.hue}, 95%, 74%, ${alpha * 0.78})`)
    gradient.addColorStop(0.45, `hsla(${particle.hue}, 95%, 66%, ${alpha * 0.28})`)
    gradient.addColorStop(1, `hsla(${particle.hue}, 95%, 62%, 0)`)

    ctx!.fillStyle = gradient
    ctx!.beginPath()
    ctx!.arc(particle.x, particle.y, radius * 3, 0, Math.PI * 2)
    ctx!.fill()

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
    <span class="toe toe-1"></span>
    <span class="toe toe-2"></span>
    <span class="toe toe-3"></span>
    <span class="toe toe-4"></span>
    <span class="pad"></span>
  </div>
</template>
