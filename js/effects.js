/* ============================================================
 *  微光 · Glimmer — 背景特效
 *  3D 深度粒子星空 + 鼠标流体扰动 + 视差滚动
 *  性能/可访问性：DPR 限制、可见性暂停、移动端降级、reduced-motion
 * ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 配色跟随主题：从 CSS 变量读取（切换 data-theme 即自动变色） */
  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    v = (v || "").trim();
    return v || fallback;
  }
  var COL = {};
  function readColors() {
    COL.canvasBg = cssVar("--canvas-bg", "10,12,22");
    COL.near = cssVar("--particle-near", "#dff7ff");
    COL.far = cssVar("--particle-far", "#9fb4d8");
    COL.auroraA = cssVar("--aurora-a", "94,234,212");
    COL.auroraB = cssVar("--aurora-b", "167,139,250");
    COL.glow = cssVar("--glow", "94,234,212");
  }
  readColors();

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var particles = [];
  var auroras = [];
  var mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, active: false };
  var scrollY = 0;
  var running = true;
  var rafId = null;

  function isMobile() { return W < 768; }

  function newParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random(),                       // 深度 0(远)~1(近)
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      tw: Math.random() * Math.PI * 2,        // 闪烁相位
      tws: 0.6 + Math.random() * 1.2          // 闪烁速度
    };
  }

  function initScene() {
    var count = isMobile() ? 60 : 150;
    particles = [];
    for (var i = 0; i < count; i++) particles.push(newParticle());
    var big = Math.max(W, H);
    auroras = [
      { bx: 0.25, by: 0.30, r: big * 0.55, c: COL.auroraA, ph: 0.0, sp: 0.00030, amp: 0.06 },
      { bx: 0.78, by: 0.22, r: big * 0.60, c: COL.auroraB, ph: 2.1, sp: 0.00040, amp: 0.05 },
      { bx: 0.55, by: 0.72, r: big * 0.48, c: COL.auroraA, ph: 4.2, sp: 0.00025, amp: 0.07 }
    ];
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readColors();
    initScene();
  }

  /* 一帧渲染。t 为时间(ms)。静态模式也复用此方法。 */
  function frame(t) {
    // 轻微拖尾，营造流体感（底色随主题变化）
    ctx.fillStyle = "rgba(" + COL.canvasBg + ",0.28)";
    ctx.fillRect(0, 0, W, H);

    // ---- 极光团（中层，视差缓漂）----
    ctx.globalCompositeOperation = "lighter";
    for (var a = 0; a < auroras.length; a++) {
      var o = auroras[a];
      var cx = (o.bx + Math.sin(t * o.sp + o.ph) * o.amp) * W;
      var cy = (o.by + Math.cos(t * o.sp * 0.8 + o.ph) * o.amp) * H - scrollY * 0.04;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
      g.addColorStop(0, "rgba(" + o.c + ",0.16)");
      g.addColorStop(0.5, "rgba(" + o.c + ",0.05)");
      g.addColorStop(1, "rgba(" + o.c + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 粒子星空（带 z 深度 + 鼠标流体 + 视差）----
    mouse.sx += (mouse.x - mouse.sx) * 0.12;
    mouse.sy += (mouse.y - mouse.sy) * 0.12;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      // 鼠标流场扰动：近处(z大)更敏感
      if (mouse.active) {
        var dx = mouse.sx - p.x;
        var dy = mouse.sy - p.y;
        var d2 = dx * dx + dy * dy;
        var d = Math.sqrt(d2) + 0.001;
        if (d < 260) {
          var force = (1 - p.z) * 26 / d;       // 越近力越强
          p.vx += (dx / d) * force * 0.02;
          p.vy += (dy / d) * force * 0.02;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;                            // 阻尼
      p.vy *= 0.96;
      p.tw += 0.02 * p.tws;

      // 边界回绕
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;

      // 视差投影：深度越大，随滚动位移越多
      var drawY = p.y - scrollY * (0.03 + p.z * 0.12);
      drawY = ((drawY % H) + H) % H;           // 包裹
      var r = 0.5 + p.z * 2.2;
      var alpha = (0.18 + p.z * 0.7) * (0.7 + 0.3 * Math.sin(p.tw));

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.z > 0.6 ? COL.near : COL.far;
      ctx.beginPath();
      ctx.arc(p.x, drawY, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 鼠标光晕 ----
    if (mouse.active) {
      var gg = ctx.createRadialGradient(mouse.sx, mouse.sy, 0, mouse.sx, mouse.sy, 130);
      gg.addColorStop(0, "rgba(" + COL.glow + ",0.16)");
      gg.addColorStop(1, "rgba(" + COL.glow + ",0)");
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(mouse.sx, mouse.sy, 130, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /* 静态（reduced-motion）：画一次即停 */
  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (var a = 0; a < auroras.length; a++) {
      var o = auroras[a];
      var cx = o.bx * W, cy = o.by * H;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
      g.addColorStop(0, "rgba(" + o.c + ",0.12)");
      g.addColorStop(1, "rgba(" + o.c + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var r = 0.5 + p.z * 2.0;
      ctx.globalAlpha = 0.18 + p.z * 0.6;
      ctx.fillStyle = p.z > 0.6 ? COL.near : COL.far;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (!running) return;
    frame(t);
    rafId = requestAnimationFrame(loop);
  }

  /* ---------- 事件 ---------- */
  function onMove(x, y) {
    mouse.x = x; mouse.y = y;
    if (!mouse.active) { mouse.sx = x; mouse.sy = y; }
    mouse.active = true;
  }
  window.addEventListener("mousemove", function (e) { onMove(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener("mouseleave", function () { mouse.active = false; });
  window.addEventListener("touchmove", function (e) {
    if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener("touchend", function () { mouse.active = false; }, { passive: true });

  window.addEventListener("scroll", function () {
    scrollY = window.scrollY || 0;
  }, { passive: true });

  window.addEventListener("resize", function () {
    resize();
    if (reduceMotion) drawStatic();
  });

  // 主题切换（如未来做实时切换 UI）时刷新粒子配色
  window.addEventListener("glimmer:themechange", function () {
    readColors();
    if (reduceMotion) drawStatic();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    } else if (!reduceMotion) {
      running = true;
      rafId = requestAnimationFrame(loop);
    }
  });

  /* ---------- 启动 ---------- */
  resize();
  if (reduceMotion) {
    drawStatic();
  } else {
    rafId = requestAnimationFrame(loop);
  }
})();
