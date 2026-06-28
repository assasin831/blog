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
    date: '2026-06-28',
    title: '6.28 学习：SmartMall AI 秒杀活动、DLQ 审计与 6 月日志补齐',
    summary:
      '集中完成秒杀活动配置、活动库存隔离、管理员分页、DLQ 重投审计，并把 6.12 到 6.28 的 SmartMall AI 推进记录补回博客。',
    tags: 'SmartMall AI / Seckill Campaign / DLQ Audit / Pagination / Blog',
    href: '/posts/2026-06-28.html'
  },
  {
    date: '2026-06-27',
    title: '6.27 学习：SmartMall AI 部署与后续优化清单整理',
    summary:
      '整理服务器迁移、前端部署、秒杀活动验证、压测和 AI 导购 Agent 后续优化清单，为下一阶段调优留入口。',
    tags: 'SmartMall AI / Deployment / Load Test / Agent / Checklist',
    href: '/posts/2026-06-27.html'
  },
  {
    date: '2026-06-26',
    title: '6.26 学习：个人博客每日记录分页与索引维护',
    summary:
      '维护 VitePress 每日记录分页、posts 索引和侧边栏，为 6 月中下旬 SmartMall AI 连续补记做准备。',
    tags: 'VitePress / Blog / Pagination / GitHub Pages',
    href: '/posts/2026-06-26.html'
  },
  {
    date: '2026-06-25',
    title: '6.25 学习：SmartMall AI 缓存、MQ 与后台运维复盘',
    summary:
      '复盘三层缓存、RabbitMQ/outbox、后台可观测和故障恢复之间的关系，整理 SmartMall AI 的生产化方向。',
    tags: 'SmartMall AI / Cache / RabbitMQ / Outbox / Admin Console',
    href: '/posts/2026-06-25.html'
  },
  {
    date: '2026-06-24',
    title: '6.24 学习：SmartMall AI 工程化构建与回归检查',
    summary:
      '对后端 Maven、前端 vue-tsc 和 Vite 构建做回归检查，确认秒杀活动、DLQ 审计和后台分页类型一致。',
    tags: 'SmartMall AI / Build / Vue / Spring Boot / Regression',
    href: '/posts/2026-06-24.html'
  },
  {
    date: '2026-06-23',
    title: '6.23 学习：SmartMall AI 秒杀安全边界复盘',
    summary:
      '复盘 requestId 幂等、活动时间、单用户限购、Redis Lua 扣库存和异步失败补偿等秒杀安全边界。',
    tags: 'SmartMall AI / Seckill / Idempotency / Redis Lua / Compensation',
    href: '/posts/2026-06-23.html'
  },
  {
    date: '2026-06-22',
    title: '6.22 学习：SmartMall AI outbox 与 RabbitMQ 运维链路复盘',
    summary:
      '梳理业务事件、outbox、RabbitMQ、consumer、DLQ、重投和审计之间的完整异步消息路径。',
    tags: 'SmartMall AI / RabbitMQ / Outbox / DLQ / Audit',
    href: '/posts/2026-06-22.html'
  },
  {
    date: '2026-06-21',
    title: '6.21 学习：SmartMall AI 性能观测与后台分页验证',
    summary:
      '围绕秒杀活动分页、请求分页、DLQ 审计、RabbitMQ 队列深度和 MySQL 快照继续做后台验证。',
    tags: 'SmartMall AI / Performance / Pagination / MQ Monitor',
    href: '/posts/2026-06-21.html'
  },
  {
    date: '2026-06-20',
    title: '6.20 学习：SmartMall AI 管理员后台信息密度调整',
    summary:
      '整合 RabbitMQ、outbox、秒杀活动、秒杀请求、DLQ 和性能快照，让后台排障路径更集中。',
    tags: 'SmartMall AI / Admin Console / Observability / UI',
    href: '/posts/2026-06-20.html'
  },
  {
    date: '2026-06-19',
    title: '6.19 学习：SmartMall AI 用户端秒杀活动入口优化',
    summary:
      '商品详情页接入当前活动查询，只有活动有效时展示秒杀入口，并展示活动库存、限购和结束时间。',
    tags: 'SmartMall AI / Vue / Seckill Campaign / Product Detail',
    href: '/posts/2026-06-19.html'
  },
  {
    date: '2026-06-18',
    title: '6.18 学习：SmartMall AI 订单与秒杀请求索引复盘',
    summary:
      '围绕用户订单、后台订单、秒杀状态和活动维度查询继续梳理 MySQL 组合索引。',
    tags: 'SmartMall AI / MySQL Index / Orders / Seckill Requests',
    href: '/posts/2026-06-18.html'
  },
  {
    date: '2026-06-17',
    title: '6.17 学习：SmartMall AI DLQ 审计后台展示',
    summary:
      '管理员消息队列页面增加 DLQ 重投审计列表，让死信恢复操作可以追踪和复盘。',
    tags: 'SmartMall AI / DLQ / Audit / Admin Console',
    href: '/posts/2026-06-17.html'
  },
  {
    date: '2026-06-16',
    title: '6.16 学习：SmartMall AI DLQ 重投审计表设计',
    summary:
      '设计 DLQ 重投审计表，记录操作者、重投数量、跳过数量、错误数量、routing key 和 payload hash。',
    tags: 'SmartMall AI / DLQ / Audit / RabbitMQ',
    href: '/posts/2026-06-16.html'
  },
  {
    date: '2026-06-15',
    title: '6.15 学习：SmartMall AI 秒杀请求后台分页与运维查询',
    summary:
      '把管理员秒杀请求列表从 limit 查询升级为 page/pageSize 分页，并支持状态、用户、商品、requestId 和订单号排障。',
    tags: 'SmartMall AI / Seckill / Pagination / Admin Query',
    href: '/posts/2026-06-15.html'
  },
  {
    date: '2026-06-14',
    title: '6.14 学习：SmartMall AI 管理员秒杀活动配置入口',
    summary:
      '补齐管理员秒杀活动配置思路，支持活动创建、修改、启停，让秒杀从代码配置走向运营配置。',
    tags: 'SmartMall AI / Seckill Campaign / Admin Console',
    href: '/posts/2026-06-14.html'
  },
  {
    date: '2026-06-13',
    title: '6.13 学习：SmartMall AI 秒杀 campaignId 与 Redis 库存隔离',
    summary:
      '将 campaignId 接入秒杀请求、Redis 活动库存、用户限购 key 和异步消息，避免多场活动互相影响。',
    tags: 'SmartMall AI / Redis / Seckill / Campaign',
    href: '/posts/2026-06-13.html'
  },
  {
    date: '2026-06-12',
    title: '6.12 学习：SmartMall AI 秒杀活动表设计与链路拆分',
    summary:
      '设计 mall_seckill_campaign，把普通商品和秒杀活动拆开，为活动库存、限购、时间窗口和后台配置做准备。',
    tags: 'SmartMall AI / Seckill / MySQL / Data Model',
    href: '/posts/2026-06-12.html'
  },
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
