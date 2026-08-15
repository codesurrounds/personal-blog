/* ============================================================
 *  微光 · Glimmer — 路由 + 视图
 *  依赖：config.js(window.SITE), loader.js(window.loadPosts), posts.js(window.POSTS 兜底)
 *        markdown.js(window.renderMarkdown, window.highlightWithin)
 *        effects.js(window.startEffects)  [可选]
 * ============================================================ */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var POSTS = window.POSTS || [];
  var app = document.getElementById("app");
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var progress = document.getElementById("progress");
  var progressBar = document.getElementById("progressBar");

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function byId(id) {
    for (var i = 0; i < POSTS.length; i++) if (POSTS[i].id === id) return POSTS[i];
    return null;
  }
  function readingTime(md) {
    var n = (md || "").replace(/\s+/g, "").length;
    return Math.max(1, Math.round(n / 350));
  }
  function tagLink(t) {
    return '<a class="chip" href="#/tag/' + encodeURIComponent(t) + '">' + esc(t) + "</a>";
  }
  function allTags() {
    var m = {};
    POSTS.forEach(function (p) {
      (p.tags || []).forEach(function (t) {
        m[t] = (m[t] || 0) + 1;
      });
    });
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; });
  }

  /* ---------- 工具：文章卡片 ---------- */
  function cardHTML(p) {
    var chips = (p.tags || []).map(function (t) {
      return '<span class="chip">' + esc(t) + "</span>";
    }).join("");
    return (
      '<a class="card reveal" href="#/post/' + p.id + '">' +
        '<div class="card__cover" style="background:' + p.cover + '"></div>' +
        '<div class="card__body">' +
          '<h3 class="card__title">' + esc(p.title) + "</h3>" +
          '<p class="card__summary">' + esc(p.summary) + "</p>" +
          '<div class="card__meta">' +
            '<span class="card__date">' + esc(p.date) + "</span>" +
            '<span class="chips">' + chips + "</span>" +
          "</div>" +
        "</div>" +
      "</a>"
    );
  }

  /* ---------- 视图：列表/首页 ---------- */
  function viewHome() {
    var cards = POSTS.map(cardHTML).join("");

    // 热门标签条
    var topTags = allTags().slice(0, 10).map(function (t) {
      return '<a class="chip" href="#/tag/' + encodeURIComponent(t) + '">' + esc(t) + "</a>";
    }).join("");

    var searchIcon =
      '<svg class="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

    return (
      '<section class="hero">' +
        '<div class="hero__eyebrow">' + esc(SITE.enName || "GLIMMER") + "</div>" +
        '<h1 class="hero__title">欢迎来到 <span class="grad">' + esc(SITE.name || "微光") + "</span></h1>" +
        '<p class="hero__tagline">' + esc(SITE.tagline || "") + "</p>" +
        '<div class="hero__cta">' +
          '<a class="btn btn--primary" href="#/archive">浏览归档</a>' +
          '<a class="btn" href="#/about">关于博主</a>' +
        "</div>" +
        '<div class="scroll-cue">向下滚动</div>' +
      "</section>" +

      '<section class="section wrap">' +
        '<div class="section-head reveal">' +
          "<div><h2>最新文章</h2></div>" +
          '<a class="btn" href="#/tags">全部标签 →</a>' +
        "</div>" +
        '<div class="search reveal" role="search">' +
          searchIcon +
          '<input id="searchInput" type="search" placeholder="搜索标题、标签或正文…" ' +
            'aria-label="搜索文章" autocomplete="off" />' +
          '<span id="searchCount" class="search__count"></span>' +
        "</div>" +
        '<div class="chips reveal" style="margin-bottom:26px">' + topTags + "</div>" +
        '<div class="grid" id="postGrid">' + cards + "</div>" +
      "</section>"
    );
  }

  /* ---------- 视图：文章详情 ---------- */
  function viewPost(id) {
    var p = byId(id);
    if (!p) return viewNotFound();
    var tags = (p.tags || []).map(tagLink).join("");
    var html = window.renderMarkdown(p.markdown);
    document.title = p.title + " · " + (SITE.name || "微光");
    return (
      '<article class="post reveal">' +
        '<a class="post__back" href="#/">← 返回列表</a>' +
        '<div class="post__surface">' +
          '<h1 class="post__title">' + esc(p.title) + "</h1>" +
          '<div class="post__meta">' +
            "<span>" + esc(p.date) + "</span>" +
            '<span class="dot"></span>' +
            "<span>" + readingTime(p.markdown) + " 分钟阅读</span>" +
            '<span class="dot"></span>' +
            '<span class="chips">' + tags + "</span>" +
          "</div>" +
          '<div class="markdown">' + html + "</div>" +
          '<div class="post__footer">' +
            '<div class="label">标签</div>' +
            '<div class="chips">' + tags + "</div>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  /* ---------- 视图：标签筛选 ---------- */
  function viewTag(tag) {
    var decoded = decodeURIComponent(tag);
    var list = POSTS.filter(function (p) {
      return (p.tags || []).indexOf(decoded) !== -1;
    });
    var body;
    if (list.length === 0) {
      body =
        '<div class="empty"><h2>这个标签下还没有文章</h2>' +
        "<p>换个标签看看，或回到 <a href=\"#/\" style=\"color:var(--accent1)\">首页</a>。</p></div>";
    } else {
      var cards = list.map(function (p) {
        return (
          '<a class="card reveal" href="#/post/' + p.id + '">' +
            '<div class="card__cover" style="background:' + p.cover + '"></div>' +
            '<div class="card__body">' +
              '<h3 class="card__title">' + esc(p.title) + "</h3>" +
              '<p class="card__summary">' + esc(p.summary) + "</p>" +
              '<div class="card__meta"><span class="card__date">' + esc(p.date) + "</span></div>" +
            "</div>" +
          "</a>"
        );
      }).join("");
      body = '<div class="grid">' + cards + "</div>";
    }
    return (
      '<section class="section wrap">' +
        '<div class="section-head reveal">' +
          "<div><h2># " + esc(decoded) + "</h2></div>" +
          '<a class="btn" href="#/tags">全部标签 →</a>' +
        "</div>" +
        body +
      "</section>"
    );
  }

  /* ---------- 视图：标签云 ---------- */
  function viewTags() {
    var tags = allTags();
    var chips = tags.map(function (t) {
      var c = POSTS.filter(function (p) {
        return (p.tags || []).indexOf(t) !== -1;
      }).length;
      return (
        '<a class="chip chip--lg" href="#/tag/' + encodeURIComponent(t) + '">' +
        esc(t) + '<span class="count">' + c + "</span></a>"
      );
    }).join("");
    return (
      '<section class="section wrap">' +
        '<div class="section-head reveal"><div><h2>全部标签</h2></div>' +
        "<p>共 " + tags.length + " 个标签</p></div>" +
        '<div class="tagcloud reveal">' + chips + "</div>" +
      "</section>"
    );
  }

  /* ---------- 视图：归档（按月份） ---------- */
  function viewArchive() {
    var groups = {};
    POSTS.forEach(function (p) {
      var ym = String(p.date || "").slice(0, 7); // YYYY-MM
      if (!ym) ym = "未标注";
      (groups[ym] = groups[ym] || []).push(p);
    });
    var months = Object.keys(groups).sort().reverse();
    var blocks = months.map(function (ym) {
      var list = groups[ym];
      var items = list.map(function (p) {
        return (
          '<li><a href="#/post/' + p.id + '">' +
            '<span class="archive__title">' + esc(p.title) + "</span>" +
            '<span class="archive__date">' + esc(p.date) + "</span>" +
          "</a></li>"
        );
      }).join("");
      return (
        '<div class="archive__group reveal">' +
          '<div class="archive__month"><span class="archive__dot"></span>' +
            esc(ym) + ' <span class="archive__cnt">' + list.length + " 篇</span></div>" +
          '<ul class="archive__list">' + items + "</ul>" +
        "</div>"
      );
    }).join("");

    return (
      '<section class="section wrap">' +
        '<div class="section-head reveal"><div><h2>文章归档</h2></div>' +
          "<p>共 " + POSTS.length + " 篇 · " + months.length + " 个月份</p></div>" +
        '<div class="archive">' + blocks + "</div>" +
      "</section>"
    );
  }

  /* ---------- 视图：关于 ---------- */
  function viewAbout() {
    var a = SITE.author || {};
    var skills = (a.skills || []).map(function (s) {
      return '<span class="chip">' + esc(s) + "</span>";
    }).join("");
    var timeline = (a.timeline || []).map(function (t) {
      return (
        '<li><div class="yr">' + esc(t.year) + "</div>" +
        '<div class="tx">' + esc(t.text) + "</div></li>"
      );
    }).join("");
    var links = (a.links || []).map(function (l) {
      return '<a class="btn" href="' + esc(l.href) + '">' + esc(l.label) + "</a>";
    }).join("");
    return (
      '<div class="about">' +
        '<div class="about__hero reveal">' +
          '<img class="about__avatar" src="' + esc(a.avatar || "assets/avatar.svg") +
            '" alt="' + esc(a.name || "博主") + ' 的头像" />' +
          "<div>" +
            '<h1 class="about__name">' + esc(a.name || "") + "</h1>" +
            '<div class="about__handle">' + esc(a.handle || "") + "</div>" +
            '<p class="about__bio">' + esc(a.bio || "") + "</p>" +
          "</div>" +
        "</div>" +
        '<div class="about__grid">' +
          '<div class="panel reveal"><h3>我会的</h3><div class="chips">' + skills + "</div>" +
            '<div class="about__links">' + links + "</div></div>" +
          '<div class="panel reveal"><h3>时间线</h3><ul class="timeline">' + timeline + "</ul></div>" +
        "</div>" +
        '<div class="panel reveal" style="margin-top:22px"><h3>关于这里</h3>' +
          "<p style=\"color:var(--muted);margin:0\">" + esc(SITE.intro || "") + "</p></div>" +
      "</div>"
    );
  }

  function viewNotFound() {
    return (
      '<section class="section wrap"><div class="empty">' +
        "<h2>没有找到这一页</h2>" +
        "<p>回到 <a href=\"#/\" style=\"color:var(--accent1)\">首页</a> 继续浏览。</p>" +
      "</div></section>"
    );
  }

  /* ---------- 路由 ---------- */
  function parseHash() {
    var h = (location.hash || "#/").replace(/^#/, "");
    var parts = h.split("/").filter(Boolean); // ["post","id"]
    if (parts.length === 0) return { name: "home" };
    if (parts[0] === "post") return { name: "post", param: parts[1] };
    if (parts[0] === "tag") return { name: "tag", param: parts.slice(1).join("/") };
    if (parts[0] === "tags") return { name: "tags" };
    if (parts[0] === "about") return { name: "about" };
    if (parts[0] === "archive") return { name: "archive" };
    return { name: "home" };
  }

  var revealObserver = null;
  function observeReveals() {
    var nodes = app.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    }
    nodes.forEach(function (n) { revealObserver.observe(n); });
  }

  function setActiveNav(route) {
    var links = nav.querySelectorAll(".nav__links a");
    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var active = false;
      if (route.name === "home" && href === "#/") active = true;
      if ((route.name === "tags" || route.name === "tag") && href === "#/tags") active = true;
      if (route.name === "about" && href === "#/about") active = true;
      if (route.name === "archive" && href === "#/archive") active = true;
      a.classList.toggle("active", active);
    });
  }

  function render() {
    var route = parseHash();
    var html;
    switch (route.name) {
      case "post": html = viewPost(route.param); break;
      case "tag": html = viewTag(route.param); break;
      case "tags": html = viewTags(); break;
      case "archive": html = viewArchive(); break;
      case "about": html = viewAbout(); break;
      default: html = viewHome();
    }
    app.innerHTML = html;
    setActiveNav(route);
    document.title = (SITE.name || "微光") + " · " +
      ({ home: "首页", post: "文章", tag: "标签", tags: "标签", archive: "归档", about: "关于" }[route.name] || "");

    // 详情页：高亮代码 + 进度条
    var md = app.querySelector(".markdown");
    if (md) window.highlightWithin(md);
    progress.classList.toggle("show", route.name === "post");
    if (route.name === "post") updateProgress();

    window.scrollTo(0, 0);
    onScroll();
    observeReveals();
    if (route.name === "home") bindSearch();

    // 关闭移动端菜单
    nav.classList.remove("nav--open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  /* ---------- 首页搜索（实时过滤，不触发整页重渲染） ---------- */
  function bindSearch() {
    var input = document.getElementById("searchInput");
    if (!input) return;
    var grid = document.getElementById("postGrid");
    var count = document.getElementById("searchCount");
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var list = q
        ? POSTS.filter(function (p) {
            var hay = [p.title, p.summary, (p.tags || []).join(" "), p.markdown || ""]
              .join(" ").toLowerCase();
            return hay.indexOf(q) !== -1;
          })
        : POSTS;
      grid.innerHTML = list.length
        ? list.map(cardHTML).join("")
        : '<div class="empty" style="grid-column:1/-1;padding:48px 20px">' +
          "<h2>没有匹配的文章</h2><p>换个关键词，或回到 " +
          '<a href="#/" style="color:var(--accent1)">首页</a>。</p></div>';
      if (count) count.textContent = q ? list.length + " 条结果" : "";
      observeReveals();
    });
  }

  /* ---------- 滚动处理 ---------- */
  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop || window.scrollY) / max * 100 : 0;
    progressBar.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }
  function onScroll() {
    var y = window.scrollY || 0;
    nav.classList.toggle("scrolled", y > 10);
    document.documentElement.style.setProperty("--sy", y);
    if (progress.classList.contains("show")) updateProgress();
  }

  /* ---------- 事件绑定 ---------- */
  window.addEventListener("hashchange", render);
  window.addEventListener("scroll", onScroll, { passive: true });

  // 快捷键 "/" 聚焦首页搜索框（不在输入框内时）
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || "")) {
      var inp = document.getElementById("searchInput");
      if (inp) { e.preventDefault(); inp.focus(); }
    }
  });

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("nav--open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 启动 ---------- */
  if (!location.hash) location.replace("#/");

  function start() { render(); }

  if (window.loadPosts && /^(http|https):/.test(location.protocol)) {
    // 通过本地服务器访问：运行时直接读取 posts/*.md，自动识别，无需编译
    window.loadPosts()
      .then(function () { POSTS = window.POSTS || POSTS; })
      .catch(function () { POSTS = window.POSTS || POSTS; })
      .then(start);
  } else {
    // file:// 直接双击打开：使用预编译的 js/posts.js 兜底
    POSTS = window.POSTS || [];
    start();
  }
})();
