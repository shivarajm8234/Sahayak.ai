import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import json
import os
import io
import re
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import urllib3

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- OPTIONAL IMPORTS ---
try:
    from pypdf import PdfReader
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    from PIL import Image
    import pytesseract
    IMAGE_SUPPORT = True
except ImportError:
    IMAGE_SUPPORT = False

# --- CONFIGURATION ---
TARGET_BANKS = {
    "public": ["State Bank of India", "SBI", "Punjab National Bank", "PNB", "Bank of Baroda", "BoB", "Canara", "Union Bank", "Bank of India"],
    "private": ["HDFC", "ICICI", "Axis", "Kotak", "IDFC"],
    "cooperative": ["Maharashtra State Cooperative", "Saraswat"]
}

CATEGORIES = {
    "home": {
        "construction": ["construction", "plot", "land", "builder"],
        "renovation": ["renovation", "improvement", "repair", "decor", "extension", "furnish"],
        "regular": ["regular", "housing loan", "home loan", "privilege", "salary"]
    },
    "agriculture": {
        "crops": ["crop", "kisan", "kcc", "cultivation", "harvest", "short term", "production"],
        "machines": ["tractor", "machinery", "equipment", "harvester", "combine", "implement"],
        "livestock": ["dairy", "poultry", "livestock", "animal", "fishery", "sheep", "goat"],
        "land": ["land purchase", "farm land", "estate"]
    },
    "education": {
        "medical": ["medical", "mbbs", "doctor", "health", "nursing", "dental"],
        "undergrad": ["undergraduate", "bachelor", "ug", "college", "university"],
        "postgrad": ["postgraduate", "master", "mba", "pg", "higher education", "abroad", "foreign", "overseas"]
    }
}

def get_bank_type(bank_name):
    for b_type, names in TARGET_BANKS.items():
        if any(name.lower() in bank_name.lower() for name in names):
            return b_type
    return "other"

def classify_sub_category(text, loan_type):
    text = text.lower()
    specific_cats = CATEGORIES.get(loan_type, {})
    for sub_cat, keywords in specific_cats.items():
        if any(k in text for k in keywords):
            return sub_cat
    return "general"

def read_urls_from_file(filename, category_filters=None):
    url_list = []
    current_category = "general"
    if not os.path.exists(filename):
        return []
    
    with open(filename, 'r') as f:
        for line in f:
            line = line.strip()
            if not line: continue
            if line.endswith(":"):
                current_category = line[:-1].lower()
                continue
            
            # Filter by category if specified
            if category_filters and current_category not in category_filters:
                continue

            if "," in line:
                try:
                    cat, url = line.split(",", 1)
                    url_list.append({"type": cat.strip(), "url": url.strip()})
                    continue
                except ValueError: pass
            if line.startswith("http"):
                url_list.append({"type": current_category, "url": line})
    return url_list

# --- SCRAPING FUNCTIONS ---
def get_session():
    session = requests.Session()
    retry = Retry(connect=3, backoff_factor=0.5)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def scrape_pdf_content(response, url_obj):
    if not PDF_SUPPORT: return []
    try:
        f = io.BytesIO(response.content)
        reader = PdfReader(f)
        text_content = ""
        for page in reader.pages:
            text_content += page.extract_text() + "\n"
        rate_matches = re.findall(r"\d+\.\d+\s?%", text_content)
        bank_name = "Unknown Bank (PDF)"
        for b_type, names in TARGET_BANKS.items():
            for name in names:
                if name.lower() in text_content.lower():
                    bank_name = name; break
        if rate_matches:
            unique_rates = list(set(rate_matches))[:3]
            return [{
                "Bank": bank_name,
                "Bank Type": get_bank_type(bank_name),
                "Loan Category": url_obj['type'].capitalize(),
                "Sub-Category": classify_sub_category(text_content[:1000], url_obj['type']),
                "Interest Rate": ", ".join(unique_rates),
                "Details": "Extracted from PDF",
                "Source": url_obj['url']
            }]
    except: return []
    return []

def scrape_image_content(response, url_obj):
    if not IMAGE_SUPPORT: return []
    try:
        image = Image.open(io.BytesIO(response.content))
        text_content = pytesseract.image_to_string(image)
        rate_matches = re.findall(r"\d+\.\d+\s?%", text_content)
        bank_name = "Unknown Bank (Img)"
        for b_type, names in TARGET_BANKS.items():
            for name in names:
                if name.lower() in text_content.lower():
                    bank_name = name; break
        if rate_matches:
            unique_rates = list(set(rate_matches))[:3]
            return [{
                "Bank": bank_name,
                "Bank Type": get_bank_type(bank_name),
                "Loan Category": url_obj['type'].capitalize(),
                "Sub-Category": classify_sub_category(text_content[:1000], url_obj['type']),
                "Interest Rate": ", ".join(unique_rates),
                "Details": "Extracted from Image",
                "Source": url_obj['url']
            }]
    except: return []
    return []

def scrape_html_content(response, url_obj):
    soup = BeautifulSoup(response.content, 'html.parser')
    tables = soup.find_all('table')
    print(f"Scraping {url_obj['url']} - Status: {response.status_code}, Length: {len(response.content)}, Tables: {len(tables)}")
    extracted_data = []

    for table in tables:
        rows = table.find_all('tr')
        if not rows: continue
        
        headers = [th.get_text(strip=True).lower() for th in rows[0].find_all(['th', 'td'])]
        print(f"Headers: {headers}")
        rate_col = next((i for i, h in enumerate(headers) if ("interest" in h or "rate" in h) and "rating" not in h), 1)
        if rate_col >= len(headers): rate_col = 1

        for row in rows[1:]:
            cols = row.find_all(['td', 'th'])
            txt = [ele.get_text(strip=True) for ele in cols]
            if not txt: continue
            
            bank_name = txt[0]
            full_row = " ".join(txt)
            bank_type = get_bank_type(bank_name)
            
            if bank_type == "other":
                page_title = soup.title.string if soup.title else ""
                if get_bank_type(page_title) != "other" and "Bank" not in bank_name:
                    bank_name = f"{page_title.split()[0]} - {bank_name}"
                    bank_type = get_bank_type(bank_name)

            if bank_type != "other":
                rate = txt[rate_col] if len(txt) > rate_col else "N/A"
                if len(rate) > 50: rate = rate[:50] + "..."
                
                sub_cat = classify_sub_category(full_row + " " + url_obj['url'], url_obj['type'])
                
                extracted_data.append({
                    "Bank": bank_name,
                    "Bank Type": bank_type,
                    "Loan Category": url_obj['type'].capitalize(),
                    "Sub-Category": sub_cat.capitalize(),
                    "Interest Rate": rate,
                    "Details": full_row,
                    "Source": url_obj['url']
                })
    print(f"Extracted {len(extracted_data)} items from {url_obj['url']}")
    
    # Fallback: If no table data, try regex on whole text
    if not extracted_data:
        print("No table data found, trying regex fallback...")
        text_content = soup.get_text()
        rate_matches = re.findall(r"\d+\.\d+\s?%", text_content)
        if rate_matches:
            unique_rates = list(set(rate_matches))[:3]
            extracted_data.append({
                "Bank": "SBI (Regex)", # Assuming SBI for now based on URLs
                "Bank Type": "public",
                "Loan Category": url_obj['type'].capitalize(),
                "Sub-Category": "General",
                "Interest Rate": ", ".join(unique_rates),
                "Details": "Extracted via Regex",
                "Source": url_obj['url']
            })
            print(f"Extracted {len(extracted_data)} items via regex")

    return extracted_data

def scrape_site(url_obj):
    url = url_obj['url']
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    session = get_session()
    
    try:
        print(f"Requesting {url}...")
        response = session.get(url, headers=headers, timeout=15, verify=False)
        ctype = response.headers.get('Content-Type', '').lower()
        
        if url.endswith('.pdf') or 'pdf' in ctype:
            return scrape_pdf_content(response, url_obj)
        if any(x in ctype for x in ['image', 'jpg', 'png']):
            return scrape_image_content(response, url_obj)
        return scrape_html_content(response, url_obj)
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return []

# --- CALLABLE FUNCTION FOR SERVER ---
def run_scraper(search_query=None):
    # 1. Parse Query for Categories
    category_filters = []
    search_terms = []
    
    if search_query:
        query_words = search_query.lower().split()
        for word in query_words:
            if word in CATEGORIES:
                category_filters.append(word)
            else:
                search_terms.append(word)
    
    # 2. Read URLs (filtered by category if applicable)
    url_list = read_urls_from_file("urls.txt", category_filters if category_filters else None)
    print(f"Found {len(url_list)} URLs to scrape")
    all_results = []
    
    # 3. Scrape
    for url_obj in url_list:
        data = scrape_site(url_obj)
        if data: all_results.extend(data)
    
    # 4. Filter Results by remaining search terms
    if search_terms:
        filtered_results = []
        for item in all_results:
            item_text = " ".join([str(v) for v in item.values()]).lower()
            if all(term in item_text for term in search_terms):
                filtered_results.append(item)
        all_results = filtered_results

    df = pd.DataFrame(all_results)
    if not df.empty:
        df = df.sort_values(by=["Loan Category", "Sub-Category", "Bank"])
        # If run from CLI with query, print JSON to stdout
        if search_query:
            print(df.to_json(orient='records'))
        else:
            df.to_json("rates.json", orient='records', indent=4)
        return df.to_dict(orient='records')
    
    if search_query:
        print("[]")
    return []

if __name__ == "__main__":
    import sys
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else None
    run_scraper(query)
