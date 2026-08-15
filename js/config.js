/* ============================================================
 *  站点配置
 *  —— 想换成你自己的内容，只改这里即可（文章已移入 posts/ 独立 .md）。
 * ============================================================ */

window.SITE = {
  /* ============================================================
   *  配色主题（背景粒子会自动跟随变色）
   *  两套机制，由 autoTheme 选择其一：
   *    autoTheme: "fixed" → 使用下面的 theme 固定主题
   *    autoTheme: "time"  → 按当前时段自动切换（见 themeSchedule）
   *  两套配色，对应白天 / 夜晚：
   *    aurora        白天 · 深墨 + 青紫（恢复博客最初配色）
   *    neptune-night  夜晚 · 海王星夜 · 深靛幽蓝（深色护眼）
   *  白天/夜晚时段见 themeSchedule（默认 08–20 白天 aurora，其余夜晚）。
   * ============================================================ */
  theme: "aurora",            // autoTheme="fixed" 时使用的固定主题（默认取最初 aurora）

  autoTheme: "time",          // "time" 按时段自动切换（推荐）| "fixed" 固定 theme

  // 按时段自动切换的映射（24 小时制，左闭右开；getHours 返回 0–23，故直接铺满 0–24）。
  // 白天 08–20 用 aurora（深墨青紫，博客最初配色），其余时间用海王星夜（深靛护眼）。
  // 想调整：改 from/to 划分时段，或改 theme 指定该时段的配色即可。
  themeSchedule: [
    { from: 0,  to: 8,  theme: "neptune-night" }, // 00–08 凌晨至清晨：海王星夜
    { from: 8,  to: 20, theme: "aurora"        }, // 08–20 白天：aurora（最初配色）
    { from: 20, to: 24, theme: "neptune-night" }  // 20–24 入夜至深夜：海王星夜
  ],

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
