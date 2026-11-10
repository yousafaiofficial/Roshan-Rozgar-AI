import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.main import app
from app.ai.preprocessor import detect_language, normalize_urdu_script, normalize_roman_urdu, extract_entities
from app.ai.classifier import classifier
from app.ai.matcher import calculate_worker_match, rank_workers_for_request

client = TestClient(app)

# ============================================================================
# 1. Preprocessing, Language Detection, and Normalization Tests
# ============================================================================

def test_language_detection():
    # Urdu script
    assert detect_language("کمرے کا اے سی ٹھنڈی ہوا نہیں دے رہا") == "ur"
    assert detect_language("پانی کا موٹر پمپ بند ہو گیا ہے") == "ur"
    
    # Roman Urdu
    assert detect_language("bijli ka breaker baar baar trip ho raha hai") == "ur-Latn"
    assert detect_language("kitchen ka sink leak ho raha hai paani tapak raha hai") == "ur-Latn"
    assert detect_language("kamray ka darwaza toot gaya hai theek karwana hai") == "ur-Latn"
    
    # English
    assert detect_language("Air conditioner needs gas refill and deep service") == "en"
    assert detect_language("Water tap leaking in the kitchen") == "en"
    assert detect_language("Need electrician for short circuit repair") == "en"

def test_normalization():
    # Urdu script normalization: tashkeel removal & character harmonization
    raw_urdu = "پَانِی کَا نَلْ لِیْکْ ہَے"
    normalized = normalize_urdu_script(raw_urdu)
    assert "پانی" in normalized or "نل" in normalized
    
    # Roman Urdu normalization: repeated chars & phonetic consolidation
    assert normalize_roman_urdu("paaniiii kharab hai") == "paani kharab hai"
    assert "bijli" in normalize_roman_urdu("bijlee theek karani hai")

def test_entity_extraction():
    # City & Neighborhood & Budget & Urgency extraction
    q1 = "Short circuit in F-10 Islamabad urgently need electrician budget 2500 rs"
    e1 = extract_entities(q1)
    assert e1['city'] == "Islamabad"
    assert e1['neighborhood'] == "F-10"
    assert e1['budget'] == 2500
    assert e1['is_urgent'] is True

    # Rawalpindi & Roman Urdu
    q2 = "Satellite Town Rawalpindi mein bike ki tuning karwani hai 1500 rupay budget hai foran banda chahiye"
    e2 = extract_entities(q2)
    assert e2['city'] == "Rawalpindi"
    assert e2['neighborhood'] == "Satellite Town"
    assert e2['budget'] == 1500
    assert e2['is_urgent'] is True

    # Urdu script extraction
    q3 = "راولپنڈی میں واش روم کا نل لیک ہے فوری پلمبر بھیجیں 2000 روپے"
    e3 = extract_entities(q3)
    assert e3['city'] == "Rawalpindi"
    assert e3['is_urgent'] is True
    assert e3['budget'] == 2000

# ============================================================================
# 2. Service Category Classification Tests across English, Urdu, Roman Urdu
# ============================================================================

def test_classifier_english_scenarios():
    cases = [
        ("Circuit breaker tripping repeatedly and burning smell from panel", "Electrician"),
        ("Water pipe burst under kitchen sink water leaking everywhere", "Plumber"),
        ("Split AC cooling is weak and blowing warm air compressor off", "AC Technician"),
        ("Wooden dining chair leg is loose and wardrobe hinge broken", "Carpenter"),
        ("Living room wall paint peeling off due to damp seepage", "Painter"),
        ("Sofa and carpet deep steam washing needed after renovation", "Cleaner"),
        ("Motorcycle engine tuning, brake pads and mobile oil replacement", "Mechanic"),
    ]
    for query, expected_cat in cases:
        res = classifier.classify(query)
        assert res['is_confident'] is True, f"Failed confidence on: {query}"
        assert res['category'] == expected_cat, f"Expected {expected_cat}, got {res['category']} for: {query}"
        assert res['confidence'] >= 0.35

def test_classifier_roman_urdu_scenarios():
    cases = [
        ("Bijli ka switch board jal gaya hai aur spark ho raha hai", "Electrician"),
        ("Paani ki motor paani nahi utha rahi aur nal tapak raha hai", "Plumber"),
        ("AC thandi hawa nahi phek raha gas refill karwani hai", "AC Technician"),
        ("Lakri ki almari ka darwaza toot gaya hai qulf theek karwana hai", "Carpenter"),
        ("Kamray ki deewaron par rang roghan aur paint karwana hai", "Painter"),
        ("Ghar ki poori deep cleaning aur washroom safai karwani hai", "Cleaner"),
        ("Bike ki kick slip ho rahi hai aur clutch wire toot gayi hai", "Mechanic"),
    ]
    for query, expected_cat in cases:
        res = classifier.classify(query)
        assert res['is_confident'] is True, f"Failed confidence on: {query}"
        assert res['category'] == expected_cat, f"Expected {expected_cat}, got {res['category']} for: {query}"
        assert res['language'] == 'ur-Latn'

def test_classifier_urdu_script_scenarios():
    cases = [
        ("کمرے کا مین سوئچ بورڈ جل گیا ہے اور چنگاریاں نکل رہی ہیں", "Electrician"),
        ("باورچی خانے کے سنک کا پائپ پھٹ گیا ہے پانی بہہ رہا ہے", "Plumber"),
        ("اے سی بالکل ٹھنڈا نہیں کر رہا کولنگ ختم ہو گئی ہے گیس ڈلوانی ہے", "AC Technician"),
        ("لکڑی کی الماری کا دروازہ ٹوٹ گیا ہے ترکھان چاہیے", "Carpenter"),
        ("دیواروں پر سے رنگ اکھڑ رہا ہے پورے گھر میں پینٹ کروانا ہے", "Painter"),
        ("گھر کی مکمل ڈیپ کلیننگ اور صوفہ واش کروانا ہے", "Cleaner"),
        ("موٹر سائیکل کی ٹیوننگ اور آئل تبدیل کروانا ہے", "Mechanic"),
    ]
    for query, expected_cat in cases:
        res = classifier.classify(query)
        assert res['is_confident'] is True, f"Failed confidence on: {query}"
        assert res['category'] == expected_cat, f"Expected {expected_cat}, got {res['category']} for: {query}"
        assert res['language'] == 'ur'

def test_classifier_ambiguous_and_fallback():
    # Vague input with no trade signal
    res = classifier.classify("Hello I need urgent help please contact me asap")
    assert res['is_confident'] is False or res['status'] in ('fallback', 'confident')
    if not res['is_confident']:
        assert 'clarification_prompt' in res
        assert 'ur' in res['clarification_prompt']
        assert 'ur-Latn' in res['clarification_prompt']
        assert 'en' in res['clarification_prompt']
        assert len(res['top_categories']) > 0

    # Very short input
    short_res = classifier.classify("hi")
    assert short_res['status'] == 'fallback'
    assert short_res['is_confident'] is False

# ============================================================================
# 3. Worker Matching and Scoring Engine Tests
# ============================================================================

def test_matcher_scoring_breakdown_and_explainability():
    mock_worker = {
        'id': 101,
        'name': 'Tariq Mehmood',
        'city': 'Islamabad',
        'neighborhood': 'F-10',
        'skill': 'Electrician',
        'extra_skills': ['UPS Repair', 'Generator'],
        'rate': 1500,
        'pricing_type': 'job',
        'available': True,
        'completed_jobs': 8,
        'rating': 4.8,
        'review_count': 6
    }

    # Best-case match: same category, same neighborhood, available, budget fits, verified history
    match_result = calculate_worker_match(
        worker=mock_worker,
        category='Electrician',
        candidate_categories=[{'category': 'Electrician', 'probability': 0.95}],
        target_city='Islamabad',
        target_neighborhood='F-10',
        target_budget=2000,
        is_urgent=False
    )

    assert match_result['total_score'] >= 85.0
    assert match_result['match_level'] == 'excellent'
    
    bd = match_result['score_breakdown']
    assert bd['skill_score'] == 35.0  # Perfect skill match
    assert bd['location_score'] == 25.0  # Exact neighborhood match
    assert bd['availability_score'] == 20.0  # Available
    assert bd['pricing_score'] == 10.0  # Under budget (1500 <= 2000)
    assert bd['history_score'] > 8.0  # High completed jobs and rating

    # Explanations must be non-empty and descriptive
    exps = match_result['explanations']
    assert len(exps) >= 4
    assert any("F-10" in e for e in exps)
    assert any("available" in e.lower() for e in exps)

def test_matcher_penalizes_busy_worker_on_urgency():
    mock_worker = {
        'id': 102,
        'name': 'Busy Worker',
        'city': 'Islamabad',
        'neighborhood': 'F-10',
        'skill': 'Electrician',
        'extra_skills': [],
        'rate': 1500,
        'pricing_type': 'job',
        'available': False,  # Busy!
        'completed_jobs': 2,
        'rating': 4.0,
        'review_count': 2
    }

    urgent_match = calculate_worker_match(
        worker=mock_worker,
        category='Electrician',
        candidate_categories=[],
        target_city='Islamabad',
        target_neighborhood='F-10',
        target_budget=2000,
        is_urgent=True
    )
    # Availability score should be zero for busy worker when request is urgent
    assert urgent_match['score_breakdown']['availability_score'] == 0.0
    assert any("busy" in e.lower() for e in urgent_match['explanations'])

def test_matcher_twin_city_proximity():
    # Worker in Rawalpindi serving Islamabad customer
    pindi_worker = {
        'id': 103,
        'name': 'Pindi Plumber',
        'city': 'Rawalpindi',
        'neighborhood': 'Satellite Town',
        'skill': 'Plumber',
        'extra_skills': [],
        'rate': 1200,
        'pricing_type': 'job',
        'available': True,
        'completed_jobs': 5,
        'rating': 4.5,
        'review_count': 3
    }

    match_isb = calculate_worker_match(
        worker=pindi_worker,
        category='Plumber',
        candidate_categories=[],
        target_city='Islamabad',
        target_neighborhood=None,
        target_budget=1500
    )
    # Twin city gets partial location score (13 pts), not 0
    assert match_isb['score_breakdown']['location_score'] == 13.0
    assert any("Twin-city" in e for e in match_isb['explanations'])

# ============================================================================
# 4. Backend AI API Integration Tests
# ============================================================================

def test_api_ai_categories():
    r = client.get('/api/ai/categories')
    assert r.status_code == 200
    cats = r.json()
    assert len(cats) >= 7
    names = [c['name'] for c in cats]
    for required in ['Electrician', 'Plumber', 'AC Technician', 'Carpenter', 'Painter', 'Cleaner', 'Mechanic']:
        assert required in names
    # Verify multilingual descriptors exist
    assert any('الیکٹریشن' in c['ur'] for c in cats if c['name'] == 'Electrician')

def test_api_ai_classify_endpoint():
    # English request
    r_en = client.post('/api/ai/classify', json={'query': 'Kitchen sink water pipe leaking'})
    assert r_en.status_code == 200
    d_en = r_en.json()
    assert d_en['category'] == 'Plumber'
    assert d_en['confidence'] > 0.4
    assert d_en['is_confident'] is True

    # Roman Urdu request
    r_ur_latn = client.post('/api/ai/classify', json={'query': 'Kamray ka pankha aur bijli ka switch board theek karna hai'})
    assert r_ur_latn.status_code == 200
    d_ur_latn = r_ur_latn.json()
    assert d_ur_latn['category'] == 'Electrician'
    assert d_ur_latn['language'] == 'ur-Latn'

    # Urdu script request
    r_ur = client.post('/api/ai/classify', json={'query': 'اے سی کی گیس چارج کروانی ہے اور کولنگ بڑھانی ہے'})
    assert r_ur.status_code == 200
    d_ur = r_ur.json()
    assert d_ur['category'] == 'AC Technician'
    assert d_ur['language'] == 'ur'

def test_api_ai_match_endpoint():
    # Natural language query with location and budget
    req_body = {
        'query': 'Need an electrician in Islamabad F-10 urgently to fix breaker budget 2000 rs',
        'limit': 5
    }
    r = client.post('/api/ai/match', json=req_body)
    assert r.status_code == 200
    data = r.json()
    
    assert data['target_category'] == 'Electrician'
    assert data['target_city'] == 'Islamabad'
    assert data['target_neighborhood'] == 'F-10'
    assert data['target_budget'] == 2000
    assert data['is_urgent'] is True
    assert data['match_count'] > 0

    top_worker = data['workers'][0]
    # In seeded data, Ahmed Raza is the electrician in F-10 Islamabad
    assert top_worker['skill'] == 'Electrician'
    assert top_worker['match_score'] > 75.0
    assert 'score_breakdown' in top_worker
    assert 'explanations' in top_worker
    assert len(top_worker['explanations']) >= 3

def test_api_ai_match_fallback_and_clarification():
    # Ambiguous query
    req_body = {
        'query': 'I need someone to help me right now',
        'limit': 5
    }
    r = client.post('/api/ai/match', json=req_body)
    assert r.status_code == 200
    data = r.json()
    # When query is ambiguous, status is fallback and clarification prompts are provided
    assert data['status'] == 'fallback' or data['is_confident'] is False
    assert data['clarification_prompt'] is not None
    assert 'ur' in data['clarification_prompt']
    assert 'ur-Latn' in data['clarification_prompt']
    # Still returns ranked workers gracefully so the customer is not stranded
    assert len(data['workers']) > 0
