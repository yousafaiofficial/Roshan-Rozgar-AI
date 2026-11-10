import json
import sqlite3
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from .classifier import classifier, CATEGORIES_META
from .matcher import rank_workers_for_request

ai_router = APIRouter(prefix="/api/ai", tags=["AI Matching"])

class ClassifyRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000, description="Customer problem description in English, Urdu or Roman Urdu")

class CandidateCategory(BaseModel):
    category: str
    probability: float
    meta: Dict[str, Any]

class ClassifyResponse(BaseModel):
    status: str
    query: str
    language: str
    cleaned_text: str
    category: Optional[str] = None
    confidence: float
    is_confident: bool
    top_categories: List[CandidateCategory]
    entities: Dict[str, Any]
    meta: Optional[Dict[str, Any]] = None
    fallback_reason: Optional[str] = None
    clarification_prompt: Optional[Dict[str, str]] = None

class MatchRequest(BaseModel):
    query: str = Field(default="", max_length=2000, description="Customer natural language request")
    category: Optional[str] = Field(default=None, description="Explicit service category override")
    city: Optional[str] = Field(default=None, description="Explicit city filter")
    neighborhood: Optional[str] = Field(default=None, description="Explicit neighborhood filter")
    budget: Optional[int] = Field(default=None, ge=0, description="Customer budget in PKR")
    only_available: bool = Field(default=False, description="Filter for currently available workers only")
    limit: int = Field(default=20, ge=1, le=100)

class ScoreBreakdown(BaseModel):
    skill_score: float
    location_score: float
    availability_score: float
    pricing_score: float
    history_score: float

class MatchedWorker(BaseModel):
    id: int
    name: str
    city: str
    skill: str
    extra_skills: List[str]
    bio: str
    rate: int
    available: bool
    verified: bool
    photo: Optional[str] = None
    rating: Optional[float] = None
    review_count: int
    neighborhood: str
    experience_years: int
    pricing_type: str
    completed_jobs: int
    match_score: float
    match_level: str
    score_breakdown: ScoreBreakdown
    explanations: List[str]

class MatchResponse(BaseModel):
    status: str
    query: str
    language: str
    target_category: Optional[str] = None
    target_city: Optional[str] = None
    target_neighborhood: Optional[str] = None
    target_budget: Optional[int] = None
    is_urgent: bool
    is_confident: bool
    classification: Dict[str, Any]
    match_count: int
    workers: List[MatchedWorker]
    clarification_prompt: Optional[Dict[str, str]] = None

def _fetch_all_workers(db_conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """Helper to query all workers with review metrics from SQLite."""
    q = '''SELECT u.id,u.name,u.city,w.skill,w.extra_skills,w.bio,w.rate,w.available,w.verified,w.photo,w.neighborhood,w.experience_years,w.pricing_type,
    (SELECT ROUND(AVG((safety+quality+punctuality+professionalism+communication)/5.0),1) FROM reviews WHERE worker_id=u.id) rating,
    (SELECT COUNT(*) FROM reviews WHERE worker_id=u.id) review_count,
    (SELECT COUNT(*) FROM jobs WHERE worker_id=u.id AND status='completed') completed_jobs,
    (SELECT ROUND(AVG(safety),1) FROM reviews WHERE worker_id=u.id) safety_rating,
    (SELECT ROUND(AVG(quality),1) FROM reviews WHERE worker_id=u.id) quality_rating,
    (SELECT ROUND(AVG(punctuality),1) FROM reviews WHERE worker_id=u.id) punctuality_rating,
    (SELECT ROUND(AVG(professionalism),1) FROM reviews WHERE worker_id=u.id) professionalism_rating,
    (SELECT ROUND(AVG(communication),1) FROM reviews WHERE worker_id=u.id) communication_rating
    FROM users u JOIN workers w ON u.id=w.user_id'''
    
    rows = db_conn.execute(q).fetchall()
    result = []
    for r in rows:
        d = dict(r)
        try:
            d['extra_skills'] = json.loads(d['extra_skills']) if isinstance(d['extra_skills'], str) else d['extra_skills']
        except Exception:
            d['extra_skills'] = []
        d['available'] = bool(d['available'])
        d['verified'] = bool(d['verified'])
        result.append(d)
    return result

@ai_router.post("/classify", response_model=ClassifyResponse)
def classify_service_request(payload: ClassifyRequest):
    """
    Classify a customer's natural-language service request into a verified trade.
    Supports English, Urdu (Arabic script), and Roman Urdu.
    """
    result = classifier.classify(payload.query)
    return {
        'status': result['status'],
        'query': payload.query,
        'language': result['language'],
        'cleaned_text': result['cleaned_text'],
        'category': result.get('category'),
        'confidence': result.get('confidence', 0.0),
        'is_confident': result.get('is_confident', False),
        'top_categories': result.get('top_categories', []),
        'entities': result.get('entities', {}),
        'meta': result.get('meta'),
        'fallback_reason': result.get('fallback_reason'),
        'clarification_prompt': result.get('clarification_prompt')
    }

@ai_router.post("/match", response_model=MatchResponse)
def match_workers_for_request(payload: MatchRequest):
    """
    AI-assisted matching engine:
    1. Parses natural-language request in English, Urdu or Roman Urdu.
    2. Classifies service category and extracts location, budget and urgency.
    3. Respects explicit user overrides if provided.
    4. Computes explainable multi-factor match score for workers from database.
    5. Returns ranked workers with transparent score breakdowns and reasons.
    """
    # Import db from main app dynamically to avoid circular import issues
    from ..main import db

    # 1. Parse natural language request if provided
    classification: Dict[str, Any] = {}
    if payload.query and payload.query.strip():
        classification = classifier.classify(payload.query)
    else:
        classification = {
            'status': 'explicit',
            'category': payload.category,
            'confidence': 1.0 if payload.category else 0.0,
            'is_confident': bool(payload.category),
            'language': 'en',
            'top_categories': [],
            'entities': {}
        }

    extracted_entities = classification.get('entities', {})
    
    # 2. Determine target category (Explicit payload takes priority, then AI classification)
    target_category = payload.category or classification.get('category')
    candidate_categories = classification.get('top_categories', [])
    
    # 3. Determine location, budget, urgency
    target_city = payload.city or extracted_entities.get('city')
    target_neighborhood = payload.neighborhood or extracted_entities.get('neighborhood')
    target_budget = payload.budget if payload.budget is not None else extracted_entities.get('budget')
    is_urgent = extracted_entities.get('is_urgent', False)
    is_confident = classification.get('is_confident', True if payload.category else False)

    # 4. Fetch workers from SQLite
    with db() as conn:
        all_workers = _fetch_all_workers(conn)

    # 5. Score and rank workers
    ranked = rank_workers_for_request(
        workers=all_workers,
        category=target_category,
        candidate_categories=candidate_categories,
        target_city=target_city,
        target_neighborhood=target_neighborhood,
        target_budget=target_budget,
        is_urgent=is_urgent,
        only_available=payload.only_available,
        limit=payload.limit
    )

    return {
        'status': 'success' if is_confident else 'fallback',
        'query': payload.query,
        'language': classification.get('language', 'en'),
        'target_category': target_category,
        'target_city': target_city,
        'target_neighborhood': target_neighborhood,
        'target_budget': target_budget,
        'is_urgent': is_urgent,
        'is_confident': is_confident,
        'classification': classification,
        'match_count': len(ranked),
        'workers': ranked,
        'clarification_prompt': classification.get('clarification_prompt')
    }

@ai_router.get("/categories")
def get_service_categories():
    """Returns metadata for all supported service categories."""
    return [
        {
            'name': name,
            'ur': info['ur'],
            'ur_latn': info['ur-Latn'],
            'description': info['description']
        }
        for name, info in CATEGORIES_META.items()
    ]
