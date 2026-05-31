import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '每日学习与工作记录',
  description: '记录开发、学习、项目复盘和技术成长',
  lang: 'zh-CN',
  base: '/blog/',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['link', { rel: 'icon', href: '/blog/logo.svg' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '每日记录', link: '/posts/' },
      { text: '项目笔记', link: '/projects/smartmall-ai' },
      { text: '学习笔记', link: '/learning/' },
      { text: '关于', link: '/about' }
    ],
    sidebar: {
      '/posts/': [
        {
          text: '每日记录',
          items: [
            { text: '记录索引', link: '/posts/' },
            { text: '2026-05-30 SmartMall AI 项目复盘', link: '/posts/2026-05-30' }
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
