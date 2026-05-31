---
title: GitHub Pages 是怎么工作的
description: 从静态网站、项目站点路径、VitePress 配置、GitHub Actions 自动部署到 404 排查，完整梳理 GitHub Pages 的使用流程。
---

# GitHub Pages 是怎么工作的

GitHub Pages 可以把 GitHub 仓库里的静态网站发布成公网可访问的网页。它很适合个人博客、项目文档、作品集和学习笔记，因为这些内容大多数时候不需要后端服务器，也不需要数据库。

这篇笔记记录我这次搭建个人博客时真正走过的一套流程：本地用 VitePress 写 Markdown，推送到 GitHub 仓库，GitHub Actions 自动构建，最后通过 GitHub Pages 发布到线上。

## 先理解一句话

GitHub Pages 的本质是：

```text
把仓库里的静态构建产物，托管成一个可以访问的网站。
```

这里有三个关键词：

| 关键词 | 含义 |
| --- | --- |
| 仓库 | 代码和文章所在的 GitHub Repository |
| 静态构建产物 | HTML、CSS、JavaScript、图片等最终网页文件 |
| 托管 | GitHub 帮我们把这些文件放到公网服务器上 |

所以 GitHub Pages 不是传统意义上的后端服务器，它不会帮我们运行 Spring Boot、MySQL、Redis 这一类后端服务。它更像一个免费的静态网页托管平台。

## 适合做什么

GitHub Pages 很适合：

- 个人博客。
- 项目文档。
- 学习笔记。
- 简历和作品集。
- 开源项目官网。
- 静态前端 Demo。

不太适合：

- 需要登录态存储的复杂后台系统。
- 需要 MySQL、Redis 的动态网站。
- 需要运行 Java、Python、Node 后端服务的项目。
- 需要隐藏服务端密钥的应用。

如果网站只是展示文章、图片、项目介绍、文档，那么 GitHub Pages 就非常合适。

## 两种常见站点

GitHub Pages 常见有两种地址。

### 用户主页

如果仓库名是：

```text
用户名.github.io
```

那么访问地址通常是：

```text
https://用户名.github.io/
```

这种站点在根路径下，不需要额外的仓库名前缀。

### 项目主页

如果仓库名是普通项目名，比如我这次的仓库是：

```text
assasin831/blog
```

那么访问地址是：

```text
https://assasin831.github.io/blog/
```

注意最后多了 `/blog/`，这是项目站点最容易踩坑的地方。

## 为什么项目站点容易 404

项目站点不是部署在根路径，而是部署在仓库名前缀下面。

这次我的博客地址是：

```text
https://assasin831.github.io/blog/
```

所以页面实际路径应该是：

```text
https://assasin831.github.io/blog/posts/2026-05-30
```

如果链接写成：

```text
https://assasin831.github.io/posts/2026-05-30
```

就会跳到 GitHub 用户根路径下，自然会出现 404。

这个问题不是文章不存在，而是路径前缀丢了。

## VitePress 在这里做什么

VitePress 是一个静态站点生成器。它负责把 Markdown 文件转换成网页。

我写的是：

```text
docs/posts/2026-05-30.md
docs/projects/smartmall-ai.md
docs/learning/github-pages.md
```

VitePress 构建后会生成：

```text
docs/.vitepress/dist/posts/2026-05-30.html
docs/.vitepress/dist/projects/smartmall-ai.html
docs/.vitepress/dist/learning/github-pages.html
```

GitHub Pages 最终托管的是 `docs/.vitepress/dist` 里面的构建产物，而不是直接托管 Markdown 源文件。

## 本博客的关键配置

这次项目最关键的配置在：

```text
docs/.vitepress/config.ts
```

里面有一行非常重要：

```ts
base: '/blog/'
```

这表示网站部署在 `/blog/` 子路径下。VitePress 构建时会自动把导航、静态资源和页面路径处理成适合 GitHub Pages 项目站点的形式。

如果以后仓库换成 `assasin831.github.io` 这种用户主页仓库，那么 `base` 通常就可以改成：

```ts
base: '/'
```

## 导航链接怎么写

VitePress 的导航链接可以写项目内路径：

```ts
nav: [
  { text: '首页', link: '/' },
  { text: '每日记录', link: '/posts/' },
  { text: '项目笔记', link: '/projects/smartmall-ai' },
  { text: '学习笔记', link: '/learning/' }
]
```

因为 VitePress 知道 `base: '/blog/'`，所以构建后会自动变成：

```text
/blog/
/blog/posts/
/blog/projects/smartmall-ai
/blog/learning/
```

但如果在 Markdown 里手写原生 HTML 链接，比如：

```html
<a href="/posts/2026-05-30">查看记录</a>
```

上线后可能会变成根路径 `/posts/2026-05-30`，导致 404。为了稳妥，项目站点里的自定义 HTML 链接可以直接写完整前缀：

```html
<a href="/blog/posts/2026-05-30">查看记录</a>
```

这也是我之前修复首页卡片 404 的原因。

## 图片资源怎么放

VitePress 的公开静态资源放在：

```text
docs/public/
```

比如我给 SmartMall AI 项目页放的截图在：

```text
docs/public/images/smartmall/home.png
```

在 Markdown 中可以这样引用：

```md
![SmartMall AI 首页](/images/smartmall/home.png)
```

构建上线后，VitePress 会处理成：

```text
/blog/images/smartmall/home.png
```

这里不要在 Markdown 图片里直接写 `/blog/images/...`，否则构建阶段可能会把它当成不存在的本地资源来解析，导致构建失败。

## GitHub Actions 自动部署

这次博客使用 GitHub Actions 自动部署。工作流文件在：

```text
.github/workflows/deploy.yml
```

整体流程是：

```text
push 到 main
  -> GitHub Actions 启动
  -> 检出仓库代码
  -> 安装 Node
  -> npm ci 安装依赖
  -> npm run build 构建 VitePress
  -> 上传 docs/.vitepress/dist
  -> GitHub Pages 发布
```

关键配置如下：

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

这套流程的好处是：以后只需要写文章、提交、推送，GitHub 会自动帮我构建和发布。

## 本地开发流程

平时写文章时，不需要每次都推送到 GitHub 看效果，可以先在本地预览。

常用命令：

```bash
npm run dev
```

本地预览地址一般是：

```text
http://localhost:5174/blog/
```

写完后先构建：

```bash
npm run build
```

构建成功说明 Markdown、链接和资源路径大概率没有明显问题。

## 一次完整发布流程

以后新增一篇文章，可以按这个顺序来：

1. 在 `docs/posts/` 或 `docs/learning/` 下创建新的 Markdown 文件。
2. 在对应的索引页加上文章入口。
3. 如果需要导航或侧边栏入口，修改 `docs/.vitepress/config.ts`。
4. 如果有图片，放到 `docs/public/images/` 下。
5. 本地运行 `npm run build`。
6. 用浏览器打开本地预览页面。
7. 提交代码。
8. 推送到 GitHub。
9. 等 GitHub Actions 完成。
10. 打开线上地址确认是否更新。

## 404 排查表

这次部署过程中遇到最多的问题就是 404。以后可以按下面的表排查。

| 现象 | 可能原因 | 解决办法 |
| --- | --- | --- |
| 首页能打开，文章点进去 404 | 项目站点少了 `/blog/` 前缀 | 检查自定义链接是否写成 `/blog/...` |
| 本地能打开，线上图片 404 | 图片没有放到 `docs/public` | 把图片放入 public，并用 `/images/...` 引用 |
| 推送后线上还是旧内容 | GitHub Pages 还没部署完成 | 等 Actions 完成后刷新 |
| Actions 构建失败 | Markdown、图片路径或依赖有问题 | 先本地执行 `npm run build` |
| 页面地址有 `.html` 或没有 `.html` 混乱 | `cleanUrls` 配置和链接写法不一致 | 统一使用 VitePress 内部链接 |
| 打开仓库 Pages 设置看不到站点 | Pages Source 或 Actions 没配置好 | Settings -> Pages 选择 GitHub Actions |

## GitHub Pages 设置步骤

在 GitHub 仓库里需要确认：

1. 打开仓库 `Settings`。
2. 找到 `Pages`。
3. 在 `Build and deployment` 里选择 `GitHub Actions`。
4. 推送 `.github/workflows/deploy.yml`。
5. 等 Actions 第一次运行成功。
6. 访问生成的网址。

对这个博客来说，网址是：

```text
https://assasin831.github.io/blog/
```

## 和普通服务器部署的区别

普通服务器部署通常是：

```text
买服务器
  -> 配置 Nginx
  -> 上传前端 dist
  -> 配置域名和 HTTPS
  -> 自己维护服务器
```

GitHub Pages 则是：

```text
写 Markdown
  -> 推送 GitHub
  -> Actions 自动构建
  -> Pages 自动发布
```

它省掉了服务器维护成本，但也意味着它主要适合静态网站。

## 这次踩到的坑

### 1. 项目站点路径不是根路径

一开始点击“每日记录”和“项目笔记”会 404，就是因为链接没有正确处理 `/blog/` 前缀。

解决方式：

- VitePress 配置 `base: '/blog/'`。
- 导航链接交给 VitePress 处理。
- 自定义 HTML 链接手动写 `/blog/...`。

### 2. 图片路径不能乱写

项目页需要贴 SmartMall AI 的截图。截图放在：

```text
docs/public/images/smartmall/
```

Markdown 中写：

```md
![截图](/images/smartmall/home.png)
```

构建后自动发布为：

```text
https://assasin831.github.io/blog/images/smartmall/home.png
```

### 3. 推送成功不代表立刻上线

`git push` 成功只是代码进了 GitHub，真正上线还要等 GitHub Actions 和 Pages 部署完成。刚推送完访问可能还是旧内容，这是正常的。

## 我对 GitHub Pages 的理解

GitHub Pages 的价值不只是“免费托管网页”，更重要的是它把写作流程变得非常稳定：

- 内容写在 Markdown 里，容易长期维护。
- 所有历史都在 Git 里，修改有记录。
- 页面生成和部署自动化，减少重复操作。
- 非常适合把学习过程、项目复盘和作品展示持续积累起来。

对我来说，它现在最适合承担个人知识库和作品集的角色。复杂系统可以继续部署到服务器，但每天的学习记录、SmartMall AI 这种项目复盘、后续技术路线总结，都可以先放到这里。

## 后续可以优化什么

后面可以继续完善：

- 给文章增加分类和标签。
- 给首页增加最近文章列表。
- 给项目页增加更多截图和架构图。
- 增加自动生成 sitemap。
- 接入评论系统。
- 绑定自定义域名。
- 写一篇“从 0 到 1 搭建 VitePress 博客”的实战教程。

## 小结

GitHub Pages 的核心链路可以记成：

```text
Markdown 内容
  -> VitePress 构建
  -> GitHub Actions 自动执行
  -> Pages 托管 dist 目录
  -> 通过 https://用户名.github.io/仓库名/ 访问
```

只要理解了“静态网站”和“项目站点 base 路径”这两个概念，后面的部署、图片、跳转和 404 问题都会清晰很多。
