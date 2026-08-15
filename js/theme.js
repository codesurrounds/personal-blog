/* ============================================================
 *  微光 · Glimmer — 主题管理
 *  支持固定主题(fixed) 或按一天时段自动切换(time)。
 *  切换时设置 <html data-theme> 并派发 glimmer:themechange，
 *  背景特效(effects.js)据此重新读取配色。
 * ============================================================ */
(function () {
  "use strict";

  var THEMES = ["aurora", "neptune-night"];

  function safeTheme(name) {
    return THEMES.indexOf(name) >= 0 ? name : "aurora";
  }

  // 按当前小时 + 时段表解析应使用的主题
  function resolveByTime() {
    var sch = (window.SITE && window.SITE.themeSchedule) || [];
    var h = new Date().getHours();
    for (var i = 0; i < sch.length; i++) {
      var s = sch[i];
      if (h >= s.from && h < s.to) return safeTheme(s.theme);
    }
    // 兜底：无命中时使用固定 theme
    return safeTheme((window.SITE && window.SITE.theme) || "aurora");
  }

  // 解析当前应使用的主题（对外）
  function resolveTheme() {
    var mode = (window.SITE && window.SITE.autoTheme) || "fixed";
    return mode === "time"
      ? resolveByTime()
      : safeTheme((window.SITE && window.SITE.theme) || "aurora");
  }

  function applyTheme(name) {
    name = safeTheme(name);
    var root = document.documentElement;
    if (root.getAttribute("data-theme") === name) return; // 无变化不重复派发
    root.setAttribute("data-theme", name);
    // 通知背景特效刷新配色（effects.js 监听此事件）
    try {
      window.dispatchEvent(
        new CustomEvent("glimmer:themechange", { detail: { theme: name } })
      );
    } catch (e) {
      // 极老环境无 CustomEvent 时的退化方案
      window.dispatchEvent(new Event("glimmer:themechange"));
    }
  }

  // 自动模式：每分钟检查一次，跨时段边界时平滑切换（背景 + CSS 过渡配合）
  function initAutoTheme() {
    if ((window.SITE && window.SITE.autoTheme) !== "time") return;
    applyTheme(resolveTheme()); // 先与当前时段对齐
    setInterval(function () {
      applyTheme(resolveTheme());
    }, 60 * 1000);
  }

  window.GlimmerTheme = {
    THEMES: THEMES,
    resolveTheme: resolveTheme,
    applyTheme: applyTheme,
    initAutoTheme: initAutoTheme
  };

  // 自动接管后续定时切换（head 已提前设置过初始主题，避免 FOUC）
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutoTheme, { once: true });
  } else {
    initAutoTheme();
  }
})();
