/* ============================================================
 *  Markdown 渲染封装
 *  依赖：vendor/marked.min.js  (window.marked)
 *        vendor/highlight.min.js (window.hljs)
 *  暴露：window.renderMarkdown(md) -> HTML 字符串
 *        window.highlightWithin(root) -> 对 root 内 <pre><code> 高亮
 * ============================================================ */
(function () {
  "use strict";

  var marked = window.marked;
  var hljs = window.hljs;

  if (marked && marked.setOptions) {
    marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // 渲染 Markdown -> HTML 字符串
  function renderMarkdown(md) {
    if (!marked) return "<p>" + escapeHtml(md || "") + "</p>";
    try {
      return marked.parse(md || "");
    } catch (e) {
      return "<p>" + escapeHtml(md || "") + "</p>";
    }
  }

  // 在插入 DOM 后调用，对代码块做语法高亮
  function highlightWithin(root) {
    if (!hljs || !root) return;
    var blocks = root.querySelectorAll("pre code");
    for (var i = 0; i < blocks.length; i++) {
      try {
        hljs.highlightElement(blocks[i]);
      } catch (e) {
        /* 个别语言未注册时忽略 */
      }
    }
  }

  window.renderMarkdown = renderMarkdown;
  window.highlightWithin = highlightWithin;
})();
