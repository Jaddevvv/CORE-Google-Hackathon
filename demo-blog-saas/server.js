const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "articles.json");
const PUBLIC_DIR = path.join(__dirname, "public");

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  }
}

function readArticles() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const normalized = normalizeStoredArticles(Array.isArray(parsed) ? parsed : []);
    if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
      writeArticles(normalized);
    }
    return normalized;
  } catch (error) {
    return [];
  }
}

function writeArticles(articles) {
  ensureStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), "utf8");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
}

function slugify(value) {
  const base = String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "article";
}

function makeUniqueSlug(baseSlug, usedSlugs) {
  let candidate = baseSlug || "article";
  let suffix = 2;
  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  usedSlugs.add(candidate);
  return candidate;
}

function normalizeStoredArticles(articles) {
  const usedSlugs = new Set();

  return articles
    .filter((article) => article && typeof article === "object")
    .map((article, index) => {
      const title = String(article.title || "").trim();
      const content = String(
        article.content || article.body || article.text || ""
      ).trim();
      if (!title || !content) {
        return null;
      }

      const createdAt = new Date(article.createdAt);
      const safeCreatedAt = Number.isNaN(createdAt.getTime())
        ? new Date().toISOString()
        : createdAt.toISOString();

      const id = String(article.id || `blog-existing-${index + 1}`).trim();
      const companyName = String(article.companyName || "Unknown Company").trim();
      const companyUrl = String(article.companyUrl || "").trim();
      const keyword = String(article.keyword || "").trim();
      const slugSeed = String(article.slug || title).trim();
      const slug = makeUniqueSlug(slugify(slugSeed), usedSlugs);

      return {
        id: id || `blog-existing-${index + 1}`,
        title,
        slug,
        keyword,
        content,
        companyName: companyName || "Unknown Company",
        companyUrl,
        createdAt: safeCreatedAt,
      };
    })
    .filter(Boolean);
}

function normalizeArticlePayload(payload, existingArticles = []) {
  if (!payload || typeof payload !== "object") return [];

  const possibleArrays = [
    payload.articles,
    payload.posts,
    payload.data,
    Array.isArray(payload) ? payload : null,
  ].filter(Boolean);

  const source = possibleArrays.find((entry) => Array.isArray(entry));
  if (!source) return [];

  const usedSlugs = new Set(
    existingArticles
      .map((article) => String(article?.slug || "").trim())
      .filter(Boolean)
  );
  const companyName = String(payload.companyName || "Unknown Company").trim();
  const companyUrl = String(payload.companyUrl || payload.url || "").trim();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  return source
    .map((article, index) => {
      const title = String(article?.title || "").trim();
      const keyword = String(article?.keyword || "").trim();
      const content = String(
        article?.content || article?.body || article?.text || ""
      ).trim();

      if (!title || !content) {
        return null;
      }

      const id = String(article?.id || `blog-${nowMs}-${index + 1}`).trim();
      const slugSeed = String(article?.slug || title).trim();
      const slug = makeUniqueSlug(slugify(slugSeed), usedSlugs);
      const articleCompanyName = String(
        article?.companyName || companyName || "Unknown Company"
      ).trim();
      const articleCompanyUrl = String(
        article?.companyUrl || companyUrl || ""
      ).trim();
      const createdAt = new Date(article?.createdAt || nowIso);
      const safeCreatedAt = Number.isNaN(createdAt.getTime())
        ? nowIso
        : createdAt.toISOString();

      return {
        id: id || `blog-${nowMs}-${index + 1}`,
        title,
        slug,
        keyword,
        content,
        companyName: articleCompanyName || "Unknown Company",
        companyUrl: articleCompanyUrl,
        createdAt: safeCreatedAt,
      };
    })
    .filter(Boolean);
}

function parseJsonBody(req, callback) {
  let raw = "";

  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 5 * 1024 * 1024) {
      req.destroy();
    }
  });

  req.on("end", () => {
    if (!raw) {
      callback(null, {});
      return;
    }
    try {
      callback(null, JSON.parse(raw));
    } catch (error) {
      callback(error);
    }
  });

  req.on("error", (error) => {
    callback(error);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "demo-blog-saas" });
    return;
  }

  if (req.method === "GET" && pathname === "/api/blog/articles") {
    const articles = readArticles()
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const requestedSlug = String(parsedUrl.searchParams.get("slug") || "").trim();
    if (requestedSlug) {
      const article = articles.find((entry) => entry.slug === requestedSlug);
      if (!article) {
        sendJson(res, 404, { ok: false, error: "Article not found." });
        return;
      }
      sendJson(res, 200, { ok: true, article });
      return;
    }
    sendJson(res, 200, { articles, total: articles.length });
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/api/blog/articles/")) {
    const encodedSlug = pathname.slice("/api/blog/articles/".length);
    const requestedSlug = decodeURIComponent(encodedSlug || "").trim();

    if (!requestedSlug) {
      sendJson(res, 400, { ok: false, error: "Missing article slug." });
      return;
    }

    const articles = readArticles()
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const article = articles.find((entry) => entry.slug === requestedSlug);

    if (!article) {
      sendJson(res, 404, { ok: false, error: "Article not found." });
      return;
    }

    sendJson(res, 200, { ok: true, article });
    return;
  }

  if (req.method === "POST" && pathname === "/api/blog/upload") {
    parseJsonBody(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
        return;
      }

      const current = readArticles();
      const incoming = normalizeArticlePayload(payload, current);
      if (incoming.length === 0) {
        sendJson(res, 400, {
          ok: false,
          error:
            "No valid articles found. Expect `articles` array with `title` and `content`.",
        });
        return;
      }

      const next = [...incoming, ...current];
      writeArticles(next);

      sendJson(res, 200, {
        ok: true,
        inserted: incoming.length,
        total: next.length,
        blogUrl: `http://localhost:${PORT}/blog`,
        articleUrls: incoming.map(
          (article) =>
            `http://localhost:${PORT}/blog/${encodeURIComponent(article.slug)}`
        ),
      });
    });
    return;
  }

  if (req.method === "DELETE" && pathname === "/api/blog/articles") {
    const current = readArticles();
    writeArticles([]);
    sendJson(res, 200, {
      ok: true,
      cleared: current.length,
      total: 0,
      message: "All articles removed.",
    });
    return;
  }

  if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    sendFile(res, path.join(PUBLIC_DIR, "index.html"), "text/html; charset=utf-8");
    return;
  }

  if (
    req.method === "GET" &&
    (pathname === "/blog" || pathname.startsWith("/blog/"))
  ) {
    sendFile(res, path.join(PUBLIC_DIR, "blog.html"), "text/html; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname === "/styles.css") {
    sendFile(res, path.join(PUBLIC_DIR, "styles.css"), "text/css; charset=utf-8");
    return;
  }

  sendJson(res, 404, { ok: false, error: "Route not found." });
});

ensureStorage();

server.listen(PORT, () => {
  console.log(`Demo Blog SaaS running on http://localhost:${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/blog/upload`);
  console.log(`Blog page: http://localhost:${PORT}/blog`);
});
