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
    date: '2026-06-11',
    title: '6.11 学习：SmartMall AI 秒杀状态闭环、DLQ 精准重投与订单查询优化',
    summary:
      '延续 6.10 后续计划，完成用户端秒杀状态轮询、管理员秒杀请求检索、DLQ 二次确认与单条重投、订单查询索引优化，以及 slow log / explain 性能采集脚本。',
    tags: 'SmartMall AI / Seckill / DLQ / RabbitMQ / MySQL Index / Slow Query',
    href: '/posts/2026-06-11.html'
  },
  {
    date: '2026-06-10',
    title: '6.10 学习：SmartMall AI DLQ 管理、秒杀状态持久化与 5000 混合流量压测',
    summary:
      '继续按 6.9 计划推进 SmartMall AI：补齐 DLQ 查看与安全重投、秒杀请求状态 MySQL 持久化、HikariCP 与 MySQL 性能快照、后台 MQ 可视化，并完成 5000 条混合流量压测。',
    tags: 'SmartMall AI / RabbitMQ / DLQ / Seckill Status / HikariCP / Mixed Load Test',
    href: '/posts/2026-06-10.html'
  },
  {
    date: '2026-06-09',
    title: '6.9 学习：SmartMall AI RabbitMQ 可观测性与秒杀幂等补偿优化',
    summary:
      '继续完善 RabbitMQ routing key 统计、Management API 队列深度、秒杀 requestId 幂等、用户重复购买限制、Redis 库存失败补偿，并完成行为、订单、秒杀三条链路压测。',
    tags: 'SmartMall AI / RabbitMQ / Queue Depth / Routing Key / Seckill / Idempotency',
    href: '/posts/2026-06-09.html'
  },
  {
    date: '2026-06-08',
    title: '6.8 学习：SmartMall AI RabbitMQ/outbox 深度优化与 5000 并发压测闭环',
    summary:
      '继续优化 RabbitMQ/outbox 链路，完成用户画像异步化、outbox 并行投递、订单事件 5000 压测、参数矩阵报告、管理员监控页和登录态细节修复。',
    tags: 'SmartMall AI / RabbitMQ / Outbox / 5000 Load Test / Admin Monitor / Seckill',
    href: '/posts/2026-06-08.html'
  },
  {
    date: '2026-06-07',
    title: '6.7 学习：SmartMall AI 消息队列 outbox 与 RabbitMQ 压测优化',
    summary:
      '继续完善 RabbitMQ 消息链路，新增 outbox 可靠投递、消费者并发参数、失败重试、管理员观测接口和行为事件压测脚本。',
    tags: 'SmartMall AI / RabbitMQ / Outbox / Retry / DLQ / Messaging Load Test',
    href: '/posts/2026-06-07.html'
  },
  {
    date: '2026-06-06',
    title: '6.6 学习：SmartMall AI 引入 RabbitMQ 事件总线与异步削峰',
    summary:
      '在三级缓存和 Agent 审计之后，继续引入 RabbitMQ 消息队列，完成行为事件、订单事件、死信队列、降级发布器、管理员观测接口和验证脚本。',
    tags: 'SmartMall AI / RabbitMQ / Message Queue / Async Events / DLQ / Load Test',
    href: '/posts/2026-06-06.html'
  },
  {
    date: '2026-06-05',
    title: '6.5 学习：SmartMall AI 缓存热点观测与 Agent 审计链路完善',
    summary:
      '继续完善缓存可观测性和 Agent 审计能力，新增热点 key 排名、Redis key 快照、工作流审计、工具调用审计和观测脚本，并完成 500 请求压测。',
    tags: 'SmartMall AI / Hot Keys / Redis Monitor / Agent Audit / Observability / Load Test',
    href: '/posts/2026-06-05.html'
  },
  {
    date: '2026-06-04',
    title: '6.4 学习：SmartMall AI 三级缓存深化与导购 Agent 工作流优化',
    summary:
      '继续完善 Caffeine + Redis + MySQL 三级缓存，补充空值缓存、热点 key 回源锁、TTL 抖动和启动预热，并参考 LangGraph / Spring AI 优化导购 Agent 工作流。',
    tags: 'SmartMall AI / Three-level Cache / Agent Workflow / Spring AI / LangGraph / Load Test',
    href: '/posts/2026-06-04.html'
  },
  {
    date: '2026-06-03',
    title: '6.3 学习：SmartMall AI 商品服务端排序、缓存维度与压测验证',
    summary:
      '按 6.2 后续计划继续推进商品分页后的服务端排序，补充 sort 参数、缓存 key 维度、前端 URL 状态和脚本化压测验证。',
    tags: 'SmartMall AI / Server-side Sorting / MySQL Index / Cache / Vue / Load Test',
    href: '/posts/2026-06-03.html'
  },
  {
    date: '2026-06-02',
    title: '6.2 学习：SmartMall AI 商品分页、接口兼容与压测链路继续优化',
    summary:
      '按 6.1 后续计划继续推进商品列表分页，补充后端分页返回结构、前端分页交互、缓存 key 设计和压测脚本更新。',
    tags: 'SmartMall AI / Pagination / MyBatis Plus / Vue / Cache / Load Test',
    href: '/posts/2026-06-02.html'
  },
  {
    date: '2026-06-01',
    title: '6.1 学习：SmartMall AI 线上访问恢复、Waas 部署与数据库迁移排障',
    summary:
      '记录 SmartMall AI 从线上 502 到恢复访问的完整排障过程，并补充三重缓存架构、300 并发压测、缓存命中率、MySQL migration 兼容性和登录页默认账号清理。',
    tags: 'Waas / Nginx / Spring Boot / MySQL Migration / Three-Level Cache / Load Test',
    href: '/posts/2026-06-01.html'
  },
  {
    date: '2026-05-31',
    title: '5.31 学习：SmartMall AI 部署、调试与博客上线复盘',
    summary:
      '记录智能商城从本地开发走到远端部署的过程：Waas 端口映射、Nginx 反代、MySQL/Redis、CORS、登录安全与 GitHub Pages 博客沉淀。',
    tags: 'Deployment / Spring Boot / Vue / MySQL / Nginx / GitHub Pages',
    href: '/posts/2026-05-31.html'
  },
  {
    date: '2026-05-30',
    title: 'SmartMall AI 智能商城复盘与个人博客上线',
    summary:
      '记录智能商城的 Agent 优化、界面打磨、数据库三层架构思想，以及 VitePress + GitHub Pages 博客上线过程。',
    tags: 'SmartMall AI / Agent / Vue / Spring Boot / MySQL / GitHub Pages',
    href: '/posts/2026-05-30.html'
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
