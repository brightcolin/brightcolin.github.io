# Colin 的个人网站

[English](README.md) | [简体中文](README.zh-CN.md)

面向科研交流与开源社区的个人网站，以英文为主，提供完整中文页面。内容包括当前科研方向、精选项目、教育背景、荣誉和简要个人介绍。

[英文主页](https://brightcolin.github.io/) · [中文主页](https://brightcolin.github.io/zh/)

采用原创 HTML/CSS 布局，参考学术主页的信息组织方式与开发者作品集的项目展示方式。没有复制模板源码或第三方美术素材。

## 本地预览

需要 Node.js 22 或更高版本，无需安装依赖。

```sh
node build.mjs
node check.mjs
node serve.mjs
```

打开 `http://127.0.0.1:4173`。英文首页位于 `/`，中文首页位于 `/zh/`。项目详情、关于页面和公开简历均有对应的中英文版本。

简历页支持通过浏览器打印或保存为 PDF。主要内容与导航在禁用 JavaScript 时仍可使用。

## 修改内容

| 文件 | 用途 |
| --- | --- |
| `content.mjs` | 中英文简介、科研经历、项目描述、荣誉与联系方式 |
| `build.mjs` | 页面模板与原创 SVG 架构示意图 |
| `assets/style.css` | 页面样式、移动端适配与打印排版 |
| `assets/site.js` | 打印按钮与轻量交互 |
| `dist/` | 构建生成的静态网站，不直接提交到仓库 |

修改后运行 `node build.mjs` 重新生成页面。`node check.mjs` 检查站内链接、锚点、中英文对应路径和文档结构。

## 部署与更新

网站源码仓库为 `brightcolin/brightcolin.github.io`。`brightcolin/brightcolin` 是独立的 GitHub 个人资料页仓库，两者用途不同。

1. 修改 `content.mjs` 中的内容或 `assets/style.css` 中的样式。
2. 本地运行 `node build.mjs` 和 `node check.mjs`。
3. 提交修改并推送到 `main` 分支。
4. **Deploy personal website to GitHub Pages** 工作流自动构建、检查并发布网站。
5. 在仓库的 **Actions** 页面查看结果，也可以手动运行该工作流。

GitHub Pages 使用 GitHub Actions 作为发布来源，部署目录为 `dist/`。网站无需单独管理服务器或数据库，后续可以绑定自定义域名。

## 公开内容范围

- 使用与 GitHub 资料页一致的展示名 Colin，保留一个学术邮箱和 GitHub 联系入口。
- 当前科研经历聚焦 SRT 项目中的可交互世界模型、动作条件视频生成、三维场景表示与时空一致性，区分科研训练与已完成成果。
- 过去的 LLM 应用项目作为软件作品展示，不作为当前科研方向。
- 区分独立开发与团队贡献，并注明个人测试、竞赛完成和归档等项目状态。
- 简历仅提供精选公开信息，完整申请材料单独保留；原始简历和答辩材料不上传到网站仓库。
- 不展示学号、班级、成绩排名、健康记录、导师身份或未公开的研究细节。
- 项目配图为系统示意图，不是产品截图、真实用户数据或在线演示。
- 网站不加载外部字体、访问统计或运行时依赖。

## 项目与设计参考

相关项目：

- [GitHub 个人资料页](https://github.com/brightcolin/brightcolin)
- [Smart Calendar Assistant](https://github.com/brightcolin/smart-calendar)
- [AI Finance Analyzer](https://github.com/brightcolin/ai-finance-analyzer)
- [THU Course Pilot](https://github.com/brightcolin/thu-course-pilot)
- [ThuStory](https://github.com/brightcolin/thu-story)

设计参考：[al-folio](https://github.com/alshedivat/al-folio)、[Academic Pages](https://github.com/academicpages/academicpages.github.io)、[DevPortfolio](https://github.com/ryanfitzgerald/devportfolio)。
