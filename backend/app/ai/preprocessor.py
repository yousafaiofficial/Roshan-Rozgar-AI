import re
from typing import Optional, Dict, Any, Tuple

# Supported cities and key neighborhoods in Islamabad / Rawalpindi twin cities
CITIES = {
    'islamabad': ['islamabad', 'isb', 'اسلام آباد', 'اسلام اباد'],
    'rawalpindi': ['rawalpindi', 'rwp', 'pindi', 'راولپنڈی', 'پنڈی']
}

NEIGHBORHOODS = {
    'Islamabad': [
        'f-6', 'f-7', 'f-8', 'f-10', 'f-11', 'e-11', 'g-6', 'g-7', 'g-8', 'g-9',
        'g-10', 'g-11', 'g-13', 'g-15', 'i-8', 'i-9', 'i-10', 'blue area',
        'bahria town', 'dha', 'pwd', 'soan gardens', 'bani gala', 'chak shahzad'
    ],
    'Rawalpindi': [
        'satellite town', 'saddar', 'westridge', 'chaklala', 'scheme 3',
        'gulraiz', 'peshawar road', 'commercial market', 'murree road',
        'bahria town', 'dha', 'adiala road', 'chandni chowk', 'raja bazaar'
    ]
}

# Roman Urdu common function words and markers
ROMAN_URDU_MARKERS = {
    'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'se', 'par', 'pe', 'mein', 'men',
    'karna', 'karni', 'karne', 'karwana', 'karwani', 'karwane', 'chahiye',
    'chahye', 'chaheye', 'hota', 'hoti', 'raha', 'rahi', 'rahe', 'mera',
    'meri', 'mere', 'apka', 'apki', 'bohat', 'boht', 'bahut', 'theek', 'thik',
    'kharab', 'wala', 'wali', 'wale', 'bhi', 'kuch', 'yeh', 'woh', 'aur',
    'nahi', 'nahin', 'mat', 'jaldi', 'foran', 'kamra', 'ghar', 'bijli',
    'paani', 'pani', 'pankha', 'darwaza', 'deewar', 'dhoond'
}

# Urdu script diacritics / tashkeel range
TASHKEEL_REGEX = re.compile(r'[\u064B-\u065F\u0670]')

# Urdu script normalization map
URDU_CHAR_MAP = {
    'ي': 'ی',
    'ى': 'ی',
    'ے': 'ی',  # Normalize bari yeh to choti yeh for consistent subword matching
    'ك': 'ک',
    'ة': 'ہ',
    'ۃ': 'ہ',
    'ھ': 'ہ',  # Do-chashmi heh normalized to standard heh for stem alignment
    'آ': 'ا',
    'أ': 'ا',
    'إ': 'ا',
    'ؤ': 'و',
    'ئ': 'ی',
}

def detect_language(text: str) -> str:
    """
    Detect whether the input text is primarily Urdu script ('ur'),
    Roman Urdu in Latin script ('ur-Latn'), or English ('en').
    """
    if not text or not text.strip():
        return 'en'
    
    # Check for Urdu (Arabic script unicode block 0600-06FF)
    urdu_chars = len(re.findall(r'[\u0600-\u06FF]', text))
    total_letters = len(re.findall(r'[\w]', text))
    if total_letters > 0 and urdu_chars / total_letters > 0.3:
        return 'ur'
    
    # For Latin-script text, check Roman Urdu markers
    words = [w.lower() for w in re.findall(r'[a-zA-Z]+', text)]
    if not words:
        return 'en'
    
    marker_hits = sum(1 for w in words if w in ROMAN_URDU_MARKERS)
    if marker_hits >= 2 or (len(words) <= 5 and marker_hits >= 1):
        return 'ur-Latn'
    
    return 'en'

def normalize_urdu_script(text: str) -> str:
    """Normalize Urdu script characters, strip tashkeel, harmonize variant forms."""
    text = TASHKEEL_REGEX.sub('', text)
    for src, target in URDU_CHAR_MAP.items():
        text = text.replace(src, target)
    text = re.sub(r'[\u200c\u200d\u200e\u200f]', '', text)  # ZWJ/ZWNJ/LTR/RTL marks
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def normalize_roman_urdu(text: str) -> str:
    """Normalize common spelling variations and phonetics in Roman Urdu."""
    text = text.lower()
    # Normalize repeated letters (e.g., 'paaniiii' -> 'paani', 'booohat' -> 'bohat')
    text = re.sub(r'([a-z])\1{2,}', r'\1', text)
    # Common variant replacements
    replacements = [
        (r'\bee\b', 'i'),
        (r'ee', 'i'),
        (r'oo', 'u'),
        (r'\bthik\b', 'theek'),
        (r'\bchahye\b', 'chahiye'),
        (r'\bchaheye\b', 'chahiye'),
        (r'\bpani\b', 'paani'),
        (r'\bbijlee\b', 'bijli'),
        (r'\bkamray\b', 'kamra'),
        (r'\bghar\b', 'ghar'),
    ]
    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text)
    text = re.sub(r'[^\w\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def preprocess_text(text: str) -> Tuple[str, str]:
    """
    Returns (cleaned_text, detected_language).
    """
    lang = detect_language(text)
    if lang == 'ur':
        cleaned = normalize_urdu_script(text)
    elif lang == 'ur-Latn':
        cleaned = normalize_roman_urdu(text)
    else:
        cleaned = re.sub(r'[^\w\s]', ' ', text.lower())
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned, lang

def extract_entities(raw_text: str) -> Dict[str, Any]:
    """
    Extract operational constraints and entities:
    - City (Islamabad / Rawalpindi)
    - Neighborhood (e.g., F-10, Satellite Town)
    - Budget (in PKR)
    - Urgency flag
    """
    text_lower = raw_text.lower()
    entities: Dict[str, Any] = {
        'city': None,
        'neighborhood': None,
        'budget': None,
        'is_urgent': False
    }

    # 1. City extraction
    for canonical_city, aliases in CITIES.items():
        for alias in aliases:
            if re.search(r'\b' + re.escape(alias) + r'\b', text_lower) or alias in raw_text:
                entities['city'] = canonical_city.capitalize()
                break
        if entities['city']:
            break

    # 2. Neighborhood extraction
    for city_name, hoods in NEIGHBORHOODS.items():
        for hood in hoods:
            pattern = r'(?:\b|^)' + re.escape(hood) + r'(?:\b|$)'
            if re.search(pattern, text_lower):
                entities['neighborhood'] = hood.upper() if len(hood) <= 4 and '-' in hood else hood.title()
                if not entities['city']:
                    entities['city'] = city_name
                break
        if entities['neighborhood']:
            break

    # 3. Budget extraction (handles "budget 2000", "2000 rs", "rs. 1500", "pkr 2500", "2k", "2000 روپے")
    budget_patterns = [
        (r'(?:budget|cost|price|rate|fees?|charges?)\s*(?:is|of|around|max|upto)?\s*(?:rs\.?|pkr)?\s*(\d{3,6})\b', False),
        (r'(?:rs\.?|pkr)\s*(\d{3,6})\b', False),
        (r'\b(\d{3,6})\s*(?:rs|pkr|rupay|rupees|rupeye|روپے)\b', False),
        (r'(?:budget|max|upto)\s*(\d+)\s*k\b', True),
        (r'\b(\d+)\s*k\s*(?:budget|rs|pkr|rupay)\b', True),
        (r'(\d{3,6})\s*روپے', False)
    ]
    for pat, is_in_thousands in budget_patterns:
        match = re.search(pat, text_lower)
        if match:
            val_str = match.group(1)
            val = int(val_str)
            if is_in_thousands:
                val *= 1000
            if 100 <= val <= 500000:
                entities['budget'] = val
                break

    # 4. Urgency extraction
    urgency_terms = [
        'urgent', 'urgently', 'emergency', 'asap', 'immediately',
        'foran', 'fauran', 'jaldi', 'abhi', 'aaj hi', 'turant',
        'فوری', 'ایمرجنسی', 'جلدی', 'ابھی', 'آج ہی'
    ]
    for term in urgency_terms:
        if term in text_lower or term in raw_text:
            entities['is_urgent'] = True
            break

    return entities
