# GitHub Pages 是怎么工作的

GitHub Pages 是 GitHub 提供的静态网站托管服务。它可以把仓库里的 HTML、CSS、JavaScript、图片和静态构建产物发布成一个公开网站。

## 两种常见网站地址

用户主页：

```text
https://你的用户名.github.io/
```

项目主页：

```text
https://你的用户名.github.io/仓库名/
```

如果仓库名是 `你的用户名.github.io`，它通常就是用户主页。

## 静态博客发布流程

1. 在本地写 Markdown。
2. VitePress 把 Markdown 构建成 HTML。
3. GitHub Actions 执行构建命令。
4. 构建产物上传到 GitHub Pages。
5. 用户访问网址时看到的是静态页面。

## 为什么适合个人博客

- 不需要服务器。
- 不需要数据库。
- 文章可以用 Git 管理。
- 每次提交就是一次发布记录。
- 适合记录学习、项目复盘和作品展示。

