/* ============================================================
 *  站点配置
 *  —— 想换成你自己的内容，只改这里即可（文章已移入 posts/ 独立 .md）。
 * ============================================================ */

window.SITE = {
  /* 配色主题：改这一行即可切换整套配色（背景粒子也会跟随变色）。
     可选值：aurora(默认) | midnight | sepia | forest | paper(浅色) | mono
     修改后刷新页面（node serve.js 访问时直接刷新即生效）。 */
  theme: "aurora",

  name: "微光",
  enName: "Glimmer",
  tagline: "在星空间，慢慢写一点东西。",
  intro: "技术、风景与日常的边角料。这里有代码，也有山雾；有教程，也有深夜的一碗面。",
  author: {
    name: "林川",
    handle: "@linchuan",
    avatar: "assets/avatar.svg",
    bio: "一个喜欢把复杂事物讲简单的普通人。白天写代码，夜里写随笔，周末去山里。",
    skills: ["前端开发", "Linux 运维", "摄影", "写作", "咖啡"],
    links: [
      { label: "GitHub", href: "#" },
      { label: "邮箱", href: "#" },
      { label: "RSS", href: "#" }
    ],
    timeline: [
      { year: "2024", text: "开始用 Markdown 重建个人写作流。" },
      { year: "2023", text: "第一次独自徒步穿越一条未命名的山脊。" },
      { year: "2021", text: "从后端转向前端，迷上了浏览器里的动画。" },
      { year: "2019", text: "写下第一行能跑起来的 JavaScript。" }
    ]
  }
};
