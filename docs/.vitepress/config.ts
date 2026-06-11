import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '每日学习与工作记录',
  description: '记录开发、学习、项目复盘和技术成长',
  lang: 'zh-CN',
  base: '/blog/',
  cleanUrls: false,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['link', { rel: 'icon', href: '/blog/logo.svg' }],
    ['link', { rel: 'preload', href: '/blog/images/landing-anime-bg-hero.jpg', as: 'image', type: 'image/jpeg' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '每日记录', link: '/posts/' },
      { text: '项目笔记', link: '/projects/smartmall-ai' },
      { text: '学习笔记', link: '/learning/' },
      { text: '留言板', link: '/guestbook' },
      { text: '关于', link: '/about' }
    ],
    sidebar: {
      '/posts/': [
        {
          text: '每日记录',
          items: [
            { text: '2026-06-11 SmartMall AI 秒杀闭环与 DLQ 精准重投', link: '/posts/2026-06-11.html' },
            { text: '记录索引', link: '/posts/' },
            { text: '2026-06-10 SmartMall AI DLQ 与混合流量压测', link: '/posts/2026-06-10.html' },
            { text: '2026-06-09 SmartMall AI MQ 可观测与秒杀补偿', link: '/posts/2026-06-09.html' },
            { text: '2026-06-08 SmartMall AI MQ 5000 压测闭环', link: '/posts/2026-06-08.html' },
            { text: '2026-06-07 SmartMall AI MQ outbox 优化', link: '/posts/2026-06-07.html' },
            { text: '2026-06-06 SmartMall AI RabbitMQ 事件总线', link: '/posts/2026-06-06.html' },
            { text: '2026-06-05 SmartMall AI 缓存观测与 Agent 审计', link: '/posts/2026-06-05.html' },
            { text: '2026-06-04 SmartMall AI 缓存与 Agent 工作流', link: '/posts/2026-06-04.html' },
            { text: '2026-06-03 SmartMall AI 服务端排序优化', link: '/posts/2026-06-03.html' },
            { text: '2026-06-02 SmartMall AI 商品分页优化', link: '/posts/2026-06-02.html' },
            { text: '2026-06-01 SmartMall AI 线上恢复复盘', link: '/posts/2026-06-01.html' },
            { text: '2026-05-31 SmartMall AI 部署复盘', link: '/posts/2026-05-31.html' },
            { text: '2026-05-30 SmartMall AI 项目复盘', link: '/posts/2026-05-30.html' }
          ]
        }
      ],
      '/projects/': [
        {
          text: '项目笔记',
          items: [
            { text: 'SmartMall AI 智能商城', link: '/projects/smartmall-ai' }
          ]
        }
      ],
      '/learning/': [
        {
          text: '学习笔记',
          items: [
            { text: '学习笔记索引', link: '/learning/' },
            { text: 'GitHub Pages 完整笔记', link: '/learning/github-pages' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/assasin831/blog' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: '记录每天的小进步。',
      copyright: 'Copyright © 2026'
    },
    editLink: {
      pattern: 'https://github.com/assasin831/blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    lastUpdated: {
      text: '最后更新'
    }
  }
})
