from pytrends.request import TrendReq
import time

def get_trendy_keywords(raw_keywords, lang="fr-FR", country="FR", timeframe='today 3-m'):
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
    ans = []
    top_trends = {}
    rising_trends = {}
    trends_set = set()
    rising_set = set()

    pytrend = TrendReq(hl='fr-FR', tz=360)

    print("lets retrieve tendancies for our keywords")

    for word in raw_keywords:
        # So, by default, the timeframe is set from today to 3 month before
        pytrend.build_payload(kw_list=[word], geo=country, timeframe=timeframe) 
        
        try:
            related_queries = pytrend.related_queries()
            rising_queries = related_queries[word]['rising']
            top_queries = related_queries[word]['top']
            

            
            if rising_queries is not None:
                found_words = rising_queries['query'].tolist()
                rising_trends[word] = found_words
                rising_set |= set(found_words)
                found_words = top_queries['query'].tolist()
                top_trends[word] = found_words
                trends_set |= set(found_words)
                print(f"✅ Trouvé {len(found_words)} tendances pour '{word}'.")
            else:
                print(f"⚠️ Pas de nouvelles tendances majeures pour '{word}'.")
                
        except Exception as e:
            print(f"Erreur avec le mot '{word}': {e}")
            
        time.sleep(2) # Pause de sécurité pour Google

    
    ans = [rising_trends, top_trends, rising_set, trends_set]
    return ans


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
