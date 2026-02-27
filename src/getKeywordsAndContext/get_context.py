import os
import re
import json
from html import unescape
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from openai import OpenAI
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)


def _language_name_from_code(language_code: str) -> str:
    normalized = (language_code or "").strip().lower()
    if normalized.startswith("fr"):
        return "French"
    if normalized.startswith("es"):
        return "Spanish"
    if normalized.startswith("de"):
        return "German"
    if normalized.startswith("it"):
        return "Italian"
    if normalized.startswith("pt"):
        return "Portuguese"
    return "English"


def _normalize_text(text: str) -> str:
    normalized = re.sub(r"\s+", " ", text or "")
    return normalized.strip()


def _extract_fast_page_text(url: str, timeout: int, scrap_limit: int) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": DEFAULT_USER_AGENT,
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            content_type = (response.headers.get("Content-Type") or "").lower()
            if "html" not in content_type and "xml" not in content_type:
                return ""
            raw_html = response.read(250_000).decode("utf-8", errors="ignore")
    except (HTTPError, URLError, TimeoutError, ValueError):
        return ""

    title_match = re.search(r"<title[^>]*>(.*?)</title>", raw_html, re.IGNORECASE | re.DOTALL)
    meta_matches = re.findall(
        r"<meta[^>]+(?:name|property)=[\"'](?:description|og:description)[\"'][^>]+content=[\"'](.*?)[\"']",
        raw_html,
        re.IGNORECASE | re.DOTALL,
    )

    cleaned_html = re.sub(
        r"(?is)<(script|style|noscript|svg|iframe).*?>.*?</\1>",
        " ",
        raw_html,
    )
    text = re.sub(r"(?is)<[^>]+>", " ", cleaned_html)

    parts = []
    if title_match:
        parts.append(title_match.group(1))
    parts.extend(meta_matches[:2])
    parts.append(text)

    joined = unescape(" ".join(parts))
    return _normalize_text(joined)[:scrap_limit]


def _extract_with_selenium(url: str, wait_seconds: int, scrap_limit: int) -> str:
    options = Options()
    options.page_load_strategy = "eager"
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(f"user-agent={DEFAULT_USER_AGENT}")

    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(wait_seconds + 3)
    try:
        driver.get(url)
        WebDriverWait(driver, wait_seconds).until(
            lambda active_driver: active_driver.find_element(By.TAG_NAME, "body")
        )
        texte_page = driver.execute_script(
            "return document.body ? document.body.innerText : '';"
        )
        return _normalize_text(texte_page)[:scrap_limit]
    finally:
        driver.quit()


def analyser_entreprise_via_url(
    url: str,
    openai_api_key: str,
    request_timeout: int = 6,
    browser_wait: int = 3,
    scrap_limit: int = 6000,
    summary_language_code: str = "en-US",
    keyword_language: str = "English",
) -> dict:
    """
    Scrape une URL et utilise GPT-4o-mini pour résumer l'activité de l'entreprise.
    """
    print(f"Scraping {url}...")

    texte_page = _extract_fast_page_text(url, request_timeout, scrap_limit)
    if len(texte_page) < 300:
        try:
            texte_page = _extract_with_selenium(url, browser_wait, scrap_limit)
        except Exception as error:
            if not texte_page:
                return {"error": f"Error from Selenium : {error}"}

    if not texte_page.strip():
        return {"error": "Error, page seems empty or locked up for us :::!!!!"}

    client = OpenAI(api_key=openai_api_key)

    try:
        summary_language = _language_name_from_code(summary_language_code)
        prompt_systeme = (
            "Tu es un analyste d'entreprise expert. "
            "Retourne uniquement un JSON valide avec deux clés: "
            "`summary` et `focusKeywords`. "
            f"`summary` doit être un court résumé structuré en {summary_language}, concret et fidèle. "
            "`focusKeywords` doit contenir 4 à 6 expressions de recherche très spécifiques "
            f"en {keyword_language} qui décrivent vraiment l'activité, les produits, le marché ou l'intention client. "
            "N'ajoute pas de termes trop génériques comme enterprise, finance, technology, business. "
            "Les `focusKeywords` doivent être exploitables tels quels comme requêtes Google Trends."
        )

        prompt_utilisateur = f"Voici le texte extrait du site web ({url}) :\n\n{texte_page}"

        reponse_gpt = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt_systeme},
                {"role": "user", "content": prompt_utilisateur},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=320,
        )
        raw_content = (reponse_gpt.choices[0].message.content or "").strip()
        parsed_content = json.loads(raw_content)

        summary = str(parsed_content.get("summary", "")).strip()
        focus_keywords = parsed_content.get("focusKeywords") or []
        if not isinstance(focus_keywords, list):
            focus_keywords = []
        cleaned_focus_keywords = []
        seen = set()
        for value in focus_keywords:
            keyword = _normalize_text(str(value or ""))
            if not keyword:
                continue
            lowered = keyword.lower()
            if lowered in seen:
                continue
            seen.add(lowered)
            cleaned_focus_keywords.append(keyword)

        if not summary:
            raise ValueError("OpenAI returned an empty summary.")

        return {
            "summary": summary,
            "focusKeywords": cleaned_focus_keywords[:6],
        }

    except Exception as error:
        return {"error": f"Error from openai call : {error}"}


# ==========================================
# EXEMPLE D'UTILISATION JADDDDDDDDDDD
# ==========================================
if __name__ == "__main__":
    load_dotenv()
    OPENAI_KEY = os.environ["OPENAI_API_KEY"] # Remplace par ta vraie clé
    URL = "https://www.quant-cube.com/"
    
    print(f"Analyse de {URL} en cours...\n")
    resultat = analyser_entreprise_via_url(URL, OPENAI_KEY)
    print(resultat)
