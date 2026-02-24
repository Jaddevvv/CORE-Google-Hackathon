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
    return Array.isArray(parsed) ? parsed : [];
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
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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

function normalizeArticlePayload(payload) {
  if (!payload || typeof payload !== "object") return [];

  const possibleArrays = [
    payload.articles,
    payload.posts,
    payload.data,
    Array.isArray(payload) ? payload : null,
  ].filter(Boolean);

  const source = possibleArrays.find((entry) => Array.isArray(entry));
  if (!source) return [];

  const companyName = String(payload.companyName || "Unknown Company").trim();
  const companyUrl = String(payload.companyUrl || payload.url || "").trim();
  const nowIso = new Date().toISOString();

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

      return {
        id: `blog-${Date.now()}-${index + 1}`,
        title,
        keyword,
        content,
        companyName,
        companyUrl,
        createdAt: nowIso,
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
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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
    sendJson(res, 200, { articles, total: articles.length });
    return;
  }

  if (req.method === "POST" && pathname === "/api/blog/upload") {
    parseJsonBody(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
        return;
      }

      const incoming = normalizeArticlePayload(payload);
      if (incoming.length === 0) {
        sendJson(res, 400, {
          ok: false,
          error:
            "No valid articles found. Expect `articles` array with `title` and `content`.",
        });
        return;
      }

      const current = readArticles();
      const next = [...incoming, ...current];
      writeArticles(next);

      sendJson(res, 200, {
        ok: true,
        inserted: incoming.length,
        total: next.length,
        blogUrl: `http://localhost:${PORT}/blog`,
      });
    });
    return;
  }

  if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    sendFile(res, path.join(PUBLIC_DIR, "index.html"), "text/html; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname === "/blog") {
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
