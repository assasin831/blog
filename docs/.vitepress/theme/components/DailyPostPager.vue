<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'

type Post = {
  date: string
  title: string
  summary: string
  tags: string
  href: string
}

const pageSize = 5
const currentPage = ref(1)
const pagerEl = ref<HTMLElement | null>(null)

const posts: Post[] = [
  {
    date: '2026-06-01',
    title: '6.1 学习：SmartMall AI 线上访问恢复、Waas 部署与数据库迁移排障',
    summary:
      '记录 SmartMall AI 从线上 502 到恢复访问的完整排障过程，并补充三重缓存架构、300 并发压测、缓存命中率、MySQL migration 兼容性和登录页默认账号清理。',
    tags: 'Waas / Nginx / Spring Boot / MySQL Migration / Three-Level Cache / Load Test',
    href: '/posts/2026-06-01'
  },
  {
    date: '2026-05-31',
    title: '5.31 学习：SmartMall AI 部署、调试与博客上线复盘',
    summary:
      '记录智能商城从本地开发走到远端部署的过程：Waas 端口映射、Nginx 反代、MySQL/Redis、CORS、登录安全与 GitHub Pages 博客沉淀。',
    tags: 'Deployment / Spring Boot / Vue / MySQL / Nginx / GitHub Pages',
    href: '/posts/2026-05-31'
  },
  {
    date: '2026-05-30',
    title: 'SmartMall AI 智能商城复盘与个人博客上线',
    summary:
      '记录智能商城的 Agent 优化、界面打磨、数据库三层架构思想，以及 VitePress + GitHub Pages 博客上线过程。',
    tags: 'SmartMall AI / Agent / Vue / Spring Boot / MySQL / GitHub Pages',
    href: '/posts/2026-05-30'
  }
]

const totalPages = computed(() => Math.max(1, Math.ceil(posts.length / pageSize)))

const visiblePosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return posts.slice(start, start + pageSize)
})

const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1))

function goToPage(page: number) {
  currentPage.value = Math.min(totalPages.value, Math.max(1, page))
  pagerEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section ref="pagerEl" class="daily-post-pager">
    <div class="post-toolbar">
      <span>2026</span>
      <strong>共 {{ posts.length }} 篇 · 每页 {{ pageSize }} 条 · 第 {{ currentPage }} / {{ totalPages }} 页</strong>
    </div>

    <div class="post-list">
      <a
        v-for="(post, index) in visiblePosts"
        :key="post.href"
        class="post-card"
        :class="{ featured: currentPage === 1 && index === 0 }"
        :href="withBase(post.href)"
      >
        <span>{{ post.date }}</span>
        <strong>{{ post.title }}</strong>
        <p>{{ post.summary }}</p>
        <small>{{ post.tags }}</small>
      </a>
    </div>

    <nav v-if="totalPages > 1" class="pager-controls" aria-label="每日记录分页">
      <button type="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">上一页</button>
      <button
        v-for="page in pageNumbers"
        :key="page"
        type="button"
        :class="{ active: page === currentPage }"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button type="button" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">下一页</button>
    </nav>
  </section>
</template>

<style scoped>
.daily-post-pager {
  scroll-margin-top: calc(var(--vp-nav-height, 64px) + 20px);
}

.post-card.featured {
  border-color: color-mix(in srgb, var(--blog-blue) 38%, var(--blog-line));
  background: linear-gradient(180deg, rgba(29, 78, 216, 0.08), color-mix(in srgb, var(--vp-c-bg) 93%, white));
}

.pager-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 18px 0 32px;
}

.pager-controls button {
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--blog-line);
  border-radius: 8px;
  color: var(--blog-ink);
  background: color-mix(in srgb, var(--vp-c-bg) 92%, white);
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease, color 0.16s ease, background 0.16s ease;
}

.pager-controls button:hover:not(:disabled),
.pager-controls button.active {
  color: white;
  border-color: var(--blog-blue);
  background: var(--blog-blue);
  transform: translateY(-1px);
}

.pager-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 640px) {
  .post-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .pager-controls {
    justify-content: flex-start;
  }
}
</style>
