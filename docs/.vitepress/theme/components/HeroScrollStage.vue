<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

let hero: HTMLElement | null = null
let raf = 0

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

function readNavHeight() {
  const nav = document.querySelector<HTMLElement>('.VPNav')
  return nav?.offsetHeight || 64
}

function updateHeroProgress() {
  if (!hero) return

  const navHeight = readNavHeight()
  const rect = hero.getBoundingClientRect()
  const stickyHeight = window.innerHeight - navHeight
  const pinDistance = Math.max(hero.offsetHeight - stickyHeight, 1)
  const progress = clamp((navHeight - rect.top) / pinDistance)

  hero.style.setProperty('--hero-progress', progress.toFixed(4))
}

function tick() {
  updateHeroProgress()
  raf = window.requestAnimationFrame(tick)
}

onMounted(() => {
  hero = document.querySelector<HTMLElement>('.landing-hero')
  if (!hero) return

  hero.classList.add('hero-stage-ready')
  raf = window.requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(raf)
  hero?.style.removeProperty('--hero-progress')
  hero?.classList.remove('hero-stage-ready')
  hero = null
})
</script>

<template></template>
