# Personal Blog

这是一个基于 VitePress 和 GitHub Pages 的个人博客，用来记录每天的工作、学习和项目复盘。

## 本地运行

```bash
npm install
npm run dev
```

## 写新文章

在 `docs/posts/` 下新建 Markdown 文件，例如：

```text
docs/posts/2026-05-31.md
```

然后在 `docs/posts/index.md` 里加一条链接。

## 发布到 GitHub Pages

1. GitHub 仓库地址：`https://github.com/assasin831/blog`。
2. 把本项目推送到该仓库。
3. 打开仓库 `Settings -> Pages`。
4. `Build and deployment` 选择 `GitHub Actions`。
5. 每次推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布。

发布后的项目站点地址通常是：

```text
https://assasin831.github.io/blog/
```
