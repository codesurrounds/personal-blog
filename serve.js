#!/usr/bin/env node
/* ============================================================
 *  serve.js — 零依赖本地静态服务器
 *
 *  用法：  node serve.js
 *  然后打开：http://localhost:8080
 *
 *  关键点：每次请求 /posts/index.json 都会实时扫描 posts/ 目录，
 *         因此新增 / 删除 .md 后，只需刷新浏览器即可自动加载，
 *         全程无需编译、无需重新生成任何文件。
 *
 *  说明：浏览器在 file:// 协议下会因 CORS 拒绝 fetch 本地 .md，
 *        所以「网页自动读取 posts/*.md」必须通过本地服务器访问。
 * ============================================================ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;
const POSTS_DIR = path.join(ROOT, "posts");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

const server = http.createServer(function (req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  // 动态端点：实时返回 posts/ 下的 .md 文件列表
  if (urlPath === "/posts/index.json") {
    fs.readdir(POSTS_DIR, function (err, list) {
      if (err) return send(res, 500, JSON.stringify({ files: [] }), "application/json");
      const files = (list || [])
        .filter((f) => f.toLowerCase().endsWith(".md"))
        .sort();
      send(res, 200, JSON.stringify({ files: files }), "application/json");
    });
    return;
  }

  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (filePath.indexOf(ROOT) !== 0) return send(res, 403, "Forbidden");

  fs.readFile(filePath, function (err, data) {
    if (err) return send(res, 404, "Not Found");
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, MIME[ext] || "application/octet-stream");
  });
});

server.listen(PORT, function () {
  console.log("✓ 博客运行中：http://localhost:" + PORT);
  console.log("  编辑 posts/*.md 后，刷新页面即可自动加载，无需编译。");
  console.log("  按 Ctrl+C 停止。");
});
