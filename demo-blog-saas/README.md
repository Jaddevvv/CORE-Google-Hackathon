# Demo Blog SaaS

Tiny local SaaS used to test uploads from the CORE dashboard article engine.

## Run

From project root:

```bash
node demo-blog-saas/server.js
```

Server URLs:

- App home: `http://localhost:8787/`
- Blog page: `http://localhost:8787/blog`
- Upload endpoint: `http://localhost:8787/api/blog/upload`
- Articles API: `http://localhost:8787/api/blog/articles`

## Connect from CORE app

In the CORE dashboard "AI Article Engine", set:

- Blog upload endpoint: `http://localhost:8787/api/blog/upload`

Then publish generated articles. They appear automatically on `/blog` (auto-refreshes every 5 seconds).
