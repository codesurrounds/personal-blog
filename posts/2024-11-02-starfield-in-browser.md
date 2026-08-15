---
title: 在浏览器里造一片星空
slug: starfield-in-browser
date: 2024-11-02
tags: [技术, 前端, 教程]
summary: 不靠任何框架，用一块 Canvas 和几百颗带 z 深度的粒子，就能铺出一片会随鼠标流动的星空。
cover: linear-gradient(135deg,#5EEAD4,#A78BFA)
---

# 在浏览器里造一片星空

有时候你想要的氛围，只是一片会呼吸的背景。不引入 Three.js，不装 WebGL 封装，一块 `<canvas>` 足够。

## 给每颗星一个深度

真正的"空间感"来自**深度**。我们给粒子一个 `z` 值（0~1），越靠近观察者越大越亮：

```js
function makeParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random(),          // 深度
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
  };
}
```

投影时，用 `z` 决定半径和透明度：

```js
const radius = 0.6 + p.z * 2.2;
const alpha  = 0.25 + p.z * 0.6;
ctx.globalAlpha = alpha;
ctx.beginPath();
ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
ctx.fill();
```

## 让鼠标"搅动"它

把指针位置当成一个引力源，离得越近、深度越浅的粒子被推得越狠——流体感就来了：

> 关键不是力有多大，而是**缓动**。给速度加一点阻尼，星空才会像被风拂过，而不是被弹开。

```js
const dx = mx - p.x, dy = my - p.y;
const dist = Math.hypot(dx, dy) + 0.001;
const force = (1 - p.z) * 40 / dist;   // 越浅越敏感
p.vx += (dx / dist) * force * 0.02;
p.vy += (dy / dist) * force * 0.02;
p.vx *= 0.96; p.vy *= 0.96;            // 阻尼
```

## 收尾

| 要素 | 作用 |
| --- | --- |
| z 深度 | 营造层次与远近 |
| 缓动阻尼 | 让运动"有重量" |
| 视差滚动 | 滚动时背景分层位移 |

跑起来后，记得给 `prefers-reduced-motion` 留一条退路——晕动症用户不该被迫看星星转圈。
