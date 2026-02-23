#import requests
#from bs4 import BeautifulSoup
from openai import OpenAI
import os
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

def analyser_entreprise_via_url(url: str, openai_api_key: str, sleep_time:int=4, scrap_limit:int=6000) -> str:
    """
    Scrape une URL et utilise GPT-4o-mini pour résumer l'activité de l'entreprise.
    """
    # We configure options for our chromedriver
    options = Options()
    options.add_argument('--headless=new') # background option. No window will be opened
    options.add_argument('--disable-gpu') # grab this from a forum lol
    options.add_argument('--window-size=1920,1080') # for the loading box. Even if we are headless it can matter
    # Basic User Agent
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')

    print(f"LEts scrappppp {url}...")
    driver = webdriver.Chrome(options=options)
    client = OpenAI(api_key=openai_api_key)

    # so lets get the content of the url page
    try:
        driver.get(url)
        

        # a sleep time
        time.sleep(sleep_time) 
        
        # body extraction
        body = driver.find_element(By.TAG_NAME, "body")
        texte_page = body.text
        
        texte_page = texte_page[:scrap_limit] # we limit the size for gpt
        
        if not texte_page.strip():
            return "Error, page seems empty or locked up for us :::!!!!"
    except Exception as e:
        return f"Error from Selenium : {e}"
    finally:
        driver.quit() # On n'oublie pas de fermer le navigateur !



    # 4. Appel à l'API OpenAI (GPT-4o-mini)
    try:
        prompt_systeme = (
            "Tu es un analyste d'entreprise expert. Ton rôle est de lire le contenu "
            "d'une page web d'accueil et d'expliquer de manière claire et concise : "
            "1. Le contexte / le secteur d'activité de l'entreprise. "
            "2. Ce que l'entreprise fait concrètement (ses produits, services, cible)."
        )
        
        prompt_utilisateur = f"Voici le texte extrait du site web ({url}) :\n\n{texte_page}"

        reponse_gpt = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt_systeme},
                {"role": "user", "content": prompt_utilisateur}
            ],
            temperature=0.3, #  hehe low temp so we have factual answers
            max_tokens=300
        )
        
        return reponse_gpt.choices[0].message.content

    except Exception as e:
        return f"Error from openai call : {e}"


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