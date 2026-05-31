<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import CursorTrail from './components/CursorTrail.vue'
import HeroScrollStage from './components/HeroScrollStage.vue'
import Utterances from './components/Utterances.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-after>
      <Utterances />
    </template>
  </DefaultTheme.Layout>
  <HeroScrollStage />
  <CursorTrail />
</template>
