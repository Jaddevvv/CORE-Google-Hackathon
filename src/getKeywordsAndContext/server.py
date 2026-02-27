import json
import os
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from dotenv import load_dotenv

from get_context import analyser_entreprise_via_url
from get_trendy_keywords import get_trendy_keywords


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
load_dotenv()

_CACHE_TTL_SECONDS = 900
_response_cache = {}
_cache_lock = threading.Lock()


def _json_response(handler, status_code, payload):
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status_code)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _read_json(handler):
    content_length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(content_length) if content_length > 0 else b"{}"
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return None


def _normalize_raw_keywords(payload):
    raw_keywords = payload.get("rawKeywords")
    if isinstance(raw_keywords, list):
        cleaned = [str(item).strip() for item in raw_keywords if str(item).strip()]
    else:
        cleaned = []

    company_name = str(payload.get("companyName", "")).strip()
    if company_name and company_name not in cleaned:
        cleaned.insert(0, company_name)

    # Keep order, remove duplicates case-insensitively
    deduped = []
    seen = set()
    for word in cleaned:
        key = word.lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(word)
    return deduped


def _cache_get(key):
    now = time.time()
    with _cache_lock:
        cached_entry = _response_cache.get(key)
        if not cached_entry:
            return None
        if now - cached_entry["stored_at"] > _CACHE_TTL_SECONDS:
            _response_cache.pop(key, None)
            return None
        payload = dict(cached_entry["payload"])
        meta = dict(payload.get("meta") or {})
        meta["cached"] = True
        payload["meta"] = meta
        return payload


def _cache_set(key, payload):
    with _cache_lock:
        _response_cache[key] = {
            "stored_at": time.time(),
            "payload": payload,
        }


def _dedupe_keywords(values, limit=20):
    deduped = []
    seen = set()
    for value in values:
        keyword = str(value or "").strip()
        if not keyword:
            continue
        lowered = keyword.lower()
        if lowered in seen:
            continue
        seen.add(lowered)
        deduped.append(keyword)
        if len(deduped) >= limit:
            break
    return deduped


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            _json_response(self, 200, {"ok": True, "service": "keywords-context-python"})
            return
        _json_response(self, 404, {"ok": False, "error": "Route not found."})

    def do_POST(self):
        path = urlparse(self.path).path
        payload = _read_json(self)
        if payload is None:
            _json_response(self, 400, {"ok": False, "error": "Invalid JSON payload."})
            return

        if path == "/get_context":
            self._handle_get_context(payload)
            return
        if path == "/get_trendy_keywords":
            self._handle_get_trendy_keywords(payload)
            return

        _json_response(self, 404, {"ok": False, "error": "Route not found."})

    def _handle_get_context(self, payload):
        url = str(payload.get("url", "")).strip()
        if not url:
            _json_response(self, 400, {"ok": False, "error": "Missing `url`."})
            return

        language = str(payload.get("language", "en-US")).strip() or "en-US"

        openai_api_key = (
            os.getenv("OPENAI_API_KEY")
            or os.getenv("VITE_GPT_API_KEY")
            or os.getenv("VITE_GPT4O_API_KEY")
            or ""
        ).strip()
        if not openai_api_key:
            _json_response(
                self,
                500,
                {
                    "ok": False,
                    "error": "Missing OPENAI_API_KEY or VITE_GPT_API_KEY in environment.",
                },
            )
            return

        cache_key = ("context", url, language)
        cached_payload = _cache_get(cache_key)
        if cached_payload is not None:
            _json_response(self, 200, cached_payload)
            return

        try:
            started_at = time.time()
            context_result = analyser_entreprise_via_url(
                url,
                openai_api_key,
                summary_language_code=language,
                keyword_language="English",
            )
            if not isinstance(context_result, dict):
                raise RuntimeError("Context generation returned an invalid payload.")
            if context_result.get("error"):
                raise RuntimeError(str(context_result["error"]))

            context = str(context_result.get("summary", "")).strip()
            focus_keywords = context_result.get("focusKeywords") or []
            if not isinstance(focus_keywords, list):
                focus_keywords = []
            focus_keywords = _dedupe_keywords(focus_keywords, limit=6)

            if not context:
                raise RuntimeError("Context generation returned empty content.")
            response_payload = {
                "ok": True,
                "context": context,
                "focusKeywords": focus_keywords,
                "meta": {
                    "cached": False,
                    "durationMs": round((time.time() - started_at) * 1000),
                },
            }
            _cache_set(cache_key, response_payload)
            _json_response(self, 200, response_payload)
        except Exception as error:
            _json_response(
                self,
                500,
                {"ok": False, "error": f"get_context failed: {error}"},
            )

    def _handle_get_trendy_keywords(self, payload):
        raw_keywords = _normalize_raw_keywords(payload)
        if not raw_keywords:
            _json_response(
                self,
                400,
                {"ok": False, "error": "Missing `rawKeywords` and `companyName`."},
            )
            return

        language = str(payload.get("language", "en-US")).strip() or "en-US"
        country = str(payload.get("country", "US")).strip() or "US"

        cache_key = ("trends", tuple(raw_keywords), language, country)
        cached_payload = _cache_get(cache_key)
        if cached_payload is not None:
            _json_response(self, 200, cached_payload)
            return

        try:
            started_at = time.time()
            trending = get_trendy_keywords(raw_keywords, lang=language, country=country)
            rising_by_seed = trending[0] if len(trending) > 0 and isinstance(trending[0], dict) else {}
            top_by_seed = trending[1] if len(trending) > 1 and isinstance(trending[1], dict) else {}
            rising_set = trending[2] if len(trending) > 2 else set()
            top_set = trending[3] if len(trending) > 3 else set()

            combined = []
            for bucket in (top_by_seed, rising_by_seed):
                if isinstance(bucket, dict):
                    for values in bucket.values():
                        if isinstance(values, (list, tuple, set)):
                            combined.extend(
                                [str(item).strip() for item in values if str(item).strip()]
                            )
            for bucket in (top_set, rising_set):
                if isinstance(bucket, (set, list, tuple)):
                    combined.extend([str(item).strip() for item in bucket if str(item).strip()])

            deduped = _dedupe_keywords(combined, limit=20)

            response_payload = {
                "ok": True,
                "keywords": deduped,
                "risingBySeed": rising_by_seed,
                "topBySeed": top_by_seed,
                "risingKeywords": _dedupe_keywords(list(rising_set), limit=20)
                if isinstance(rising_set, set)
                else [],
                "topKeywords": _dedupe_keywords(list(top_set), limit=20)
                if isinstance(top_set, set)
                else [],
                "meta": {
                    "cached": False,
                    "durationMs": round((time.time() - started_at) * 1000),
                    "seedCount": len(raw_keywords),
                },
            }
            _cache_set(cache_key, response_payload)
            _json_response(self, 200, response_payload)
        except Exception as error:
            _json_response(
                self,
                500,
                {"ok": False, "error": f"get_trendy_keywords failed: {error}"},
            )

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    port = int(os.getenv("PY_CONTEXT_PORT", "8000"))
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Python keywords/context API running at http://127.0.0.1:{port}")
    print("POST /get_context")
    print("POST /get_trendy_keywords")
    server.serve_forever()
