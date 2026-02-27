from pytrends.request import TrendReq

GENERIC_SEED_TERMS = {
    "banking",
    "finance",
    "financial",
    "enterprise",
    "technology",
    "technologies",
    "business",
    "services",
    "solutions",
    "platform",
    "global",
    "digital",
    "company",
    "management",
}


def _normalize_keyword(value):
    keyword = str(value or "").strip()
    return " ".join(keyword.split())


def _seed_tokens(value):
    return [token for token in _normalize_keyword(value).lower().replace("&", " ").split() if token]


def _allow_suggestions_for_seed(seed):
    meaningful_tokens = [
        token
        for token in _seed_tokens(seed)
        if len(token) > 3 and token not in GENERIC_SEED_TERMS
    ]
    return len(meaningful_tokens) >= 2


def _filter_suggestions_for_seed(seed, values):
    meaningful_tokens = {
        token
        for token in _seed_tokens(seed)
        if len(token) > 3 and token not in GENERIC_SEED_TERMS
    }
    if not meaningful_tokens:
        return []

    filtered_values = []
    for value in values:
        candidate_tokens = set(_seed_tokens(value))
        if candidate_tokens & meaningful_tokens:
            filtered_values.append(value)
    return filtered_values


def _append_keywords(destination, values, existing_values, seed):
    added = []
    for raw_value in values:
        keyword = _normalize_keyword(raw_value)
        if not keyword:
            continue
        lowered = keyword.lower()
        if lowered == seed.lower() or lowered in existing_values:
            continue
        existing_values.add(lowered)
        destination.add(keyword)
        added.append(keyword)
    return added


def get_trendy_keywords(raw_keywords, lang="fr-FR", country="FR", timeframe="today 3-m"):
    """return trendy keywords from raw keywords throught `[rising_trends_dict, top_trends_dict, rising_trends_set, top_trends_set]`

    Args:
        raw_keywords (_type_): an array of keywords
        lang (str, optional): the language for research. Defaults to "fr-FR".
        country (str, optional): the country of research. Defaults to "FR".
        timeframe (str, optional): the timeframe of research. Defaults to 'today 3-m' which means from today to 3 month ago

    Returns:
        list: [rising_trends_dict, top_trends_dict, rising_trends_set, top_trends_set]
        `rising_trends_dict` and `top_trends_dict` are dictionaries having as key a word from the `raw_keywords` arg and as value its trendy words associate
        The difference between rising and top is on the format of the keywords obtained.
        `rising_trends_set` and `top_trends_set` are sets containing respectively the risings and tops keywords found into 2 sets
        ``
    """
    top_trends = {}
    rising_trends = {}
    top_set = set()
    rising_set = set()
    seen_keywords = set()

    pytrend = TrendReq(hl=lang, tz=360)

    print("lets retrieve tendancies for our keywords")

    for word in raw_keywords:
        normalized_word = _normalize_keyword(word)
        if not normalized_word:
            continue

        # So, by default, the timeframe is set from today to 3 month before
        try:
            pytrend.build_payload(kw_list=[normalized_word], geo=country, timeframe=timeframe)
            related_queries = pytrend.related_queries() or {}
            query_entry = related_queries.get(normalized_word) or {}
            rising_queries = query_entry.get("rising")
            top_queries = query_entry.get("top")

            rising_values = []
            if rising_queries is not None and "query" in rising_queries:
                rising_values = rising_queries["query"].dropna().tolist()

            top_values = []
            if top_queries is not None and "query" in top_queries:
                top_values = top_queries["query"].dropna().tolist()

            suggestion_values = []
            if _allow_suggestions_for_seed(normalized_word):
                try:
                    suggestions = pytrend.suggestions(normalized_word) or []
                    suggestion_values = [
                        suggestion.get("title", "")
                        for suggestion in suggestions
                        if isinstance(suggestion, dict)
                    ]
                    suggestion_values = _filter_suggestions_for_seed(
                        normalized_word,
                        suggestion_values,
                    )
                except Exception:
                    suggestion_values = []

            found_rising = _append_keywords(rising_set, rising_values, seen_keywords, normalized_word)
            found_top = _append_keywords(
                top_set,
                top_values + suggestion_values,
                seen_keywords,
                normalized_word,
            )

            if found_rising:
                rising_trends[normalized_word] = found_rising
            if found_top:
                top_trends[normalized_word] = found_top

            found_count = len(found_rising) + len(found_top)
            if found_count:
                print(f"✅ Trouvé {found_count} tendances pour '{normalized_word}'.")
            else:
                print(f"⚠️ Pas de tendances exploitables pour '{normalized_word}'.")

        except Exception as error:
            print(f"Erreur avec le mot '{normalized_word}': {error}")

    ans = [rising_trends, top_trends, rising_set, top_set]
    return ans


if __name__ == "__main__":
    raw_keywords = ["ski", "neige", "hiver"]
    trendy_keywords = get_trendy_keywords(raw_keywords)

    print(raw_keywords)
    print("------ rising dict----------", '\n')
    for word in trendy_keywords[0]:
        print(word,'\n')
        print(trendy_keywords[0][word])
        print("\n")
    print('\n')
    print("------top dict-------", '\n')
    for word in trendy_keywords[1]:
        print(word,'\n')
        print(trendy_keywords[1][word])
        print("\n")

    print('\n')
    print("rising set",trendy_keywords[2], '\n')
    print("top set",trendy_keywords[3], '\n')
