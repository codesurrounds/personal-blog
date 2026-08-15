# 微光 · Glimmer — 个人博客

一个零构建、可离线的单页个人博客。采用 3D 空间沉浸叙事风格：持续存在的粒子星空背景、鼠标流体扰动、视差深度滚动，并完整支持 Markdown 渲染与响应式布局。

文章以独立的 `.md` 文件存放在 `posts/` 目录，网页在运行时自动读取并渲染——**新增或删除文章只需刷新页面，无需手动编译**（通过本地服务器访问时）。

---

## ✨ 功能特性

| 功能 | 说明 |
| --- | --- |
| **文章列表页** | Hero 区 + 文章卡片网格，展示标题、摘要、标签、日期 |
| **文章详情页** | 完整 Markdown 渲染、代码高亮、阅读进度条、标签/返回跳转 |
| **标签分类** | 标签云 `#/tags` + 单标签筛选 `#/tag/:tag`，含空态提示 |
| **关于页面** | 头像、简介、技能、时间线、社交链接 |
| **Markdown 渲染** | 基于 `marked` + `highlight.js`，标题/列表/引用/代码/表格均正确解析 |
| **实时搜索** | 首页搜索框，按标题/摘要/标签/正文过滤，支持 `/` 聚焦快捷键 |
| **文章归档** | `#/archive` 按 `YYYY-MM` 自动分组，显示每月篇数 |

### 视觉与交互
- **3D 空间沉浸**：带 z 深度的粒子星空背景，全程持续存在
- **鼠标流体**：指针驱动流场扰动粒子，柔和光晕跟随
- **视差深度滚动**：粒子按深度分层位移，Hero 文字随滚动视差
- **响应式**：桌面/移动端断点、移动端折叠菜单、移动端降粒子数
- **可访问性**：`prefers-reduced-motion` 退化为静态渐变、可见键盘焦点、语义化标签

---

## 📁 目录结构

```
personal-blog/
├─ index.html              # 单页 Shell（导航 + 视图容器 + 背景 canvas）
├─ serve.js                # 零依赖本地服务器（实时扫描 posts/ 目录）
├─ build-posts.js          # 离线兜底：把 posts/*.md 打包成 js/posts.js
├─ css/
│  └─ style.css            # 设计令牌、玻璃拟态、响应式、动效
├─ js/
│  ├─ config.js            # 站点/博主配置（window.SITE）
│  ├─ loader.js            # 运行时自动加载并解析 posts/*.md
│  ├─ posts.js             # 由 build-posts.js 生成的兜底数据（离线用）
│  ├─ markdown.js          # Markdown → HTML + 代码高亮
│  ├─ app.js               # Hash 路由 + 列表/详情/标签/归档/关于 五视图
│  └─ effects.js           # 3D 粒子 + 鼠标流体 + 视差滚动
├─ posts/                  # 文章目录（每篇一个独立 .md，互不干扰）
│  ├─ 2024-11-02-starfield-in-browser.md
│  ├─ 2024-10-18-rainy-mountain-trail.md
│  └─ …（更多文章）
├─ assets/                 # favicon.svg、avatar.svg
└─ vendor/                 # 本地化的 marked / highlight.js（离线可用）
   ├─ marked.min.js
   ├─ highlight.min.js
   └─ highlight.min.css
```

---

## 🚀 快速开始

### 方式 A：自动加载（推荐）
通过本地服务器访问，网页会**自动读取 `posts/*.md`**，改完文章刷新即可生效，全程零编译。

```bash
cd personal-blog
node serve.js
# 打开 http://localhost:8080
```

> 想换端口？`PORT=8090 node serve.js` 即可。

### 方式 B：离线双击（兜底）
直接双击 `index.html` 在浏览器打开。此时浏览器因 CORS 无法 `fetch` 本地 `.md`，网页会自动退回使用预编译的 `js/posts.js` 兜底。

```bash
# 若你修改过 posts/*.md，希望离线双击也能看到新内容，先重新生成兜底数据：
node build-posts.js
# 然后再双击 index.html
```

**为什么存在两种模式？** 浏览器在 `file://` 协议下会拦截对本地文件的 `fetch`（安全策略，无法绕过）。`serve.js` 正是为「网页自动读取 md」而写，它不依赖任何 npm 包；`js/posts.js` 则是为了保留「双击即开」的便利性。

---

## ✍️ 写文章（posts/*.md）

每篇文章一个独立 `.md` 文件，顶部用 YAML frontmatter 声明元信息，正文写 Markdown。**文件之间互不干扰**。

### 文件命名
建议 `YYYY-MM-DD-slug.md`（如 `2024-11-02-starfield-in-browser.md`）。日期用于排序；`slug` 是详情页 URL（缺省自动从文件名去掉日期前缀得到）。

### Frontmatter 字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 文章标题 |
| `slug` | ⬜ | URL 用的 id，缺省取文件名（去掉日期前缀） |
| `date` | ✅ | 发布日期 `YYYY-MM-DD`，决定列表排序（新→旧） |
| `tags` | ⬜ | 标签，支持 `[标签1, 标签2]` 或下方 `- 标签` 块列表 |
| `summary` | ✅ | 列表页摘要 |
| `cover` | ⬜ | CSS 背景值，如 `linear-gradient(135deg,#5EEAD4,#A78BFA)` |
| `draft` | ⬜ | `true` 则跳过该篇（草稿不发布） |

### 示例

```markdown
---
title: 在浏览器里造一片星空
slug: starfield-in-browser
date: 2024-11-02
tags: [技术, 前端, 教程]
summary: 不靠任何框架，用一块 Canvas 和几百颗带 z 深度的粒子，就能铺出一片会随鼠标流动的星空。
cover: linear-gradient(135deg,#5EEAD4,#A78BFA)
---

# 在浏览器里造一片星空

有时候你想要的氛围，只是一片会呼吸的背景。不引入 Three.js，一块 `<canvas>` 足够。

## 核心思路

1. 用粒子数组保存每个点的 x / y / z
2. 按 z 计算透视缩放与透明度
3. 监听鼠标，用一个简易流场推动粒子

\`\`\`js
const p = particles[i];
p.x += Math.sin(p.z + t) * 0.3;
\`\`\`

> 正文里的 Markdown、代码块、表格、引用都能正常渲染，无需转义。
```

> 💡 正文中的 Markdown **不需要转义反引号**（与早期「内嵌在 JS 字符串里」的方案不同）——这是独立 `.md` 文件方案的最大便利。

---

## ⚙️ 配置与换肤

### 改站点信息
编辑 `js/config.js` 的 `window.SITE`：站点名 `name`、英文名 `enName`、标语 `tagline`、博主 `author`（姓名/头像/简介/技能/链接/时间线）。

### 切换整套配色（主题）
内置 6 套配色主题，**改一个字段即可整站切换，背景粒子也会自动跟随变色**：

| `SITE.theme` | 风格 | 说明 |
| --- | --- | --- |
| `aurora` | 深墨 + 青紫（**默认**） | 已专门提升文字对比度，卡片有更实的衬底 |
| `midnight` | 深蓝 + 天蓝/靛 | 更柔和，长时间阅读不刺眼 |
| `sepia` | 暖棕 + 琥珀/珊瑚 | 夜间最护眼 |
| `forest` | 深绿 + 翠绿 | 自然、安静 |
| `paper` | **浅色**白底深字 | 可读性最强，适合明亮环境 |
| `mono` | 灰度极简 | 去掉一切色彩干扰 |

切换方法有两种：

**① 固定主题**：编辑 `js/config.js`，把 `autoTheme` 设为 `"fixed"`，再把 `theme` 改成上表任一值。

```js
window.SITE = {
  autoTheme: "fixed",
  theme: "aurora",   // ← 改成 midnight / sepia / forest / paper / mono
  // ...
};
```

**② 随一天时段自动切换（默认开启）**：`autoTheme: "time"` 时，主题按当前小时在 `themeSchedule` 里自动选择，并每分钟检查一次、跨时段时平滑过渡：

| 时段 | 主题 | 意图 |
| --- | --- | --- |
| 05:00–11:00 | `paper`（浅色） | 清晨迎晨光，亮色不刺眼 |
| 11:00–17:00 | `aurora`（深墨青紫） | 上午到午后默认深色 |
| 17:00–21:00 | `sepia`（暖棕） | 傍晚暖色护眼 |
| 21:00–次日05:00 | `midnight`（深蓝） | 深夜静谧 |

```js
window.SITE = {
  autoTheme: "time",          // "time" 按时段自动切换 | "fixed" 固定 theme
  themeSchedule: [            // 24 小时制，左闭右开；to>24 表示跨午夜
    { from: 5,  to: 11, theme: "paper"   },
    { from: 11, to: 17, theme: "aurora"  },
    { from: 17, to: 21, theme: "sepia"   },
    { from: 21, to: 29, theme: "midnight" }
  ],
  // ...
};
```

> 想自定义时段或配色：直接改 `themeSchedule` 里的 `from`/`to` 划分时段，或改每项的 `theme`。
> 首屏主题由 `index.html` 的 `<head>` 内联脚本根据当前时段提前应用，避免刷新时配色闪烁（FOUC）。

### 自定义配色
所有颜色都是 `css/style.css` 顶部的设计令牌。想微调某套主题，直接改对应 `[data-theme="..."]` 块里的令牌即可；想加新主题，复制一个 `[data-theme="yourname"]` 块、填上令牌，再把 `js/config.js` 的 `theme` 指向它：

```css
:root {
  --accent1: #5EEAD4;  /* 主强调色（青） */
  --accent2: #A78BFA;  /* 次强调色（紫） */
  --text: #ECEEF6;     /* 正文（已提亮保证可读） */
  --muted: #9AA1B8;    /* 次要文字 */
  --surface: rgba(255,255,255,0.08); /* 卡片衬底（已提实，文字更清晰） */
  /* 还有背景、边框、玻璃拟态等各项令牌 */
}
```


### 调整背景特效
`js/effects.js` 顶部提供可调参数（粒子数量、流场强度、视差系数等）。`prefers-reduced-motion` 用户会自动退化为静态渐变背景。

---

## 🧭 路由一览

| 路由 | 视图 |
| --- | --- |
| `#/` | 首页（文章列表 + 搜索框） |
| `#/post/:slug` | 文章详情 |
| `#/tag/:tag` | 单标签筛选 |
| `#/tags` | 标签云 |
| `#/archive` | 按月份归档 |
| `#/about` | 关于博主 |

---

## 🛠 技术栈

- **纯原生 HTML / CSS / JS**，零构建步骤，单文件夹即可运行
- **`marked`** — Markdown 解析（已本地化至 `vendor/`）
- **`highlight.js`** — 代码高亮（已本地化至 `vendor/`，主题 `atom-one-dark`）
- **Canvas 2D** — 自研粒子系统、鼠标流体、视差滚动（无 Three.js / WebGL 依赖）
- **Hash 路由** — 单页应用，无需服务端路由

---

## 🌐 部署建议

由于数据通过 `fetch` 加载，任何**静态文件服务器**都可直接部署（无需 Node）：

- 把整个 `personal-blog/` 目录上传到任意静态托管（GitHub Pages、Vercel、Nginx、对象存储等）
- 确保 `posts/` 目录与 `js/`、`css/`、`vendor/` 同级可访问
- 访问根路径即可，无需服务端渲染

> 若托管环境不方便保留 `serve.js`，可在本地先 `node build-posts.js` 生成 `js/posts.js`，再部署——这样即便环境拦截 `fetch`，也能用兜底数据正常显示。

---

## ♿ 可访问性

- 尊重系统「减少动态效果」设置（`prefers-reduced-motion`），自动关闭粒子动画
- 所有可交互元素有可见键盘焦点样式
- 语义化标签（`nav` / `main` / `article` / `section`），支持屏幕阅读器
- 移动端提供折叠菜单与触摸友好的点击区域

---

_由前端设计（frontend-design）技能驱动构建。_
