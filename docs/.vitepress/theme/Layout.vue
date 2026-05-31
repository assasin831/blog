<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import Utterances from './components/Utterances.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-after>
      <Utterances />
    </template>
  </DefaultTheme.Layout>
</template>
