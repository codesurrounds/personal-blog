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
   *  可选主题：aurora | midnight | sepia | forest | paper(浅色) | mono
   *    aurora   深墨 + 青紫（默认） 已专门提升文字对比度
   *    midnight 深蓝 + 天蓝/靛 更柔和、久读不刺眼
   *    sepia    暖棕 + 琥珀/珊瑚 夜间最护眼
   *    forest   深绿 + 翠绿 自然安静
   *    paper    浅色白底深字 可读性最强，明亮环境首选
   *    mono     灰度极简 去掉色彩干扰
   * ============================================================ */
  theme: "midnight",          // autoTheme="fixed" 时使用的固定主题

  autoTheme: "time",          // "time" 按时段自动切换（推荐）| "fixed" 固定 theme

  // 按时段自动切换的映射（24 小时制，左闭右开；to 可大于 24 表示跨午夜）。
  // 按当前小时落入的区间匹配；全部未命中时回退到上面的 theme。
  // 想调整：改 from/to 划分时段，或改 theme 指定该时段的配色即可。
  themeSchedule: [
    { from: 5,  to: 11, theme: "paper"   }, // 清晨 05–11：浅色亮眼，迎晨光
    { from: 11, to: 17, theme: "aurora"  }, // 上午–午后 11–17：默认深色
    { from: 17, to: 21, theme: "sepia"   }, // 傍晚 17–21：暖色护眼
    { from: 21, to: 29, theme: "midnight" } // 深夜 21–次日5：深蓝静谧
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
