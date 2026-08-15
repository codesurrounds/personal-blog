/* ============================================================
 *  loader.js — 运行时自动加载 posts/*.md（无需预编译）
 *
 *  工作机制（需通过本地服务器访问，如 node serve.js）：
 *    1. fetch posts/index.json  → 取得当前 posts/ 下所有 .md 文件名
 *       （该接口由 serve.js 每次实时扫描目录生成，新增文件立即可见）
 *    2. 逐个 fetch posts/<file>.md  → 解析 YAML frontmatter + 正文
 *    3. 按日期倒序写入 window.POSTS，网页随之渲染
 *
 *  file:// 直接双击打开时 fetch 会被浏览器拦截，
 *  此时由 js/posts.js（build-posts.js 生成的兜底包）提供数据。
 * ============================================================ */
(function () {
  "use strict";

  function parseScalar(s) {
    s = String(s).trim();
    var first = s.charAt(0), last = s.charAt(s.length - 1);
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return s.slice(1, -1);
    }
    if (s === "true") return true;
    if (s === "false") return false;
    return s;
  }

  function parseFrontmatter(text) {
    var m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) return { data: null, body: text };
    var fm = m[1];
    var body = text.slice(m[0].length).replace(/^\r?\n/, "");
    var data = {};
    var key = null;
    var lines = fm.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      if (raw.trim() === "") continue;
      var li = raw.match(/^\s*-\s+(.*)$/);
      if (li && key) {
        if (!Array.isArray(data[key])) data[key] = [];
        data[key].push(parseScalar(li[1]));
        continue;
      }
      var kv = raw.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (kv) {
        key = kv[1];
        var val = kv[2];
        var arr = val.match(/^\[(.*)\]$/);
        if (arr) {
          var inner = arr[1].trim();
          data[key] = inner === "" ? [] : inner.split(",").map(function (x) { return parseScalar(x); });
          key = null;
        } else if (val.trim() === "") {
          data[key] = [];
        } else {
          data[key] = parseScalar(val);
          key = null;
        }
      }
    }
    return { data: data, body: body };
  }

  function deriveSlug(filename) {
    var base = filename.replace(/\.md$/i, "");
    var mm = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
    return mm ? mm[1] : base;
  }
  function dateFromName(filename) {
    var mm = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    return mm ? mm[1] : "";
  }
  var DEFAULT_COVER = "linear-gradient(135deg,#5EEAD4,#A78BFA)";

  function parsePost(filename, text) {
    var fm = parseFrontmatter(text);
    if (!fm.data) {
      var slug0 = deriveSlug(filename);
      return {
        id: slug0,
        title: (text.match(/^#\s+(.+)$/m) || [, slug0])[1] || slug0,
        date: dateFromName(filename),
        tags: [],
        summary: "",
        cover: DEFAULT_COVER,
        markdown: text
      };
    }
    var d = fm.data;
    return {
      id: String(d.slug || deriveSlug(filename)),
      title: d.title || deriveSlug(filename),
      date: d.date || dateFromName(filename),
      tags: Array.isArray(d.tags) ? d.tags : [],
      summary: d.summary || "",
      cover: d.cover || DEFAULT_COVER,
      markdown: fm.body
    };
  }

  window.parsePost = parsePost;

  window.loadPosts = function () {
    return fetch("posts/index.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("posts/index.json not found");
        return r.json();
      })
      .then(function (meta) {
        var files = (meta.files || []).filter(function (f) {
          return String(f).toLowerCase().indexOf(".md") !== -1;
        });
        return Promise.all(files.map(function (f) {
          return fetch("posts/" + encodeURI(f), { cache: "no-store" })
            .then(function (r) { return r.text(); })
            .then(function (txt) { return parsePost(f, txt); });
        }));
      })
      .then(function (posts) {
        posts.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
        window.POSTS = posts;
        return posts;
      });
  };
})();
