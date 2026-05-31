<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const route = useRoute()
const { frontmatter, isDark } = useData()
const commentsRef = ref<HTMLElement | null>(null)

function mountComments() {
  if (!commentsRef.value || frontmatter.value.comments === false) return

  commentsRef.value.innerHTML = ''

  const script = document.createElement('script')
  script.src = 'https://utteranc.es/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('repo', 'assasin831/blog')
  script.setAttribute('issue-term', 'pathname')
  script.setAttribute('label', 'comment')
  script.setAttribute('theme', isDark.value ? 'github-dark' : 'github-light')

  commentsRef.value.appendChild(script)
}

onMounted(() => {
  mountComments()
})

watch(
  () => route.path,
  () => nextTick(mountComments)
)

watch(
  () => isDark.value,
  () => nextTick(mountComments)
)
</script>

<template>
  <section v-if="frontmatter.comments !== false" class="comments-block">
    <div class="comments-head">
      <span>GitHub 留言</span>
      <strong>欢迎交流想法、建议和项目问题</strong>
      <p>留言会通过 GitHub 账号授权发布到这个博客仓库的 Issue 讨论中。</p>
    </div>
    <div ref="commentsRef" class="comments-widget"></div>
  </section>
</template>
