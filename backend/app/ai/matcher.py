from typing import List, Dict, Any, Optional

TWIN_CITIES = {
    'islamabad': 'rawalpindi',
    'rawalpindi': 'islamabad'
}

def calculate_worker_match(
    worker: Dict[str, Any],
    category: Optional[str],
    candidate_categories: List[Dict[str, Any]],
    target_city: Optional[str],
    target_neighborhood: Optional[str],
    target_budget: Optional[int],
    is_urgent: bool = False
) -> Dict[str, Any]:
    """
    Computes an explainable multi-factor match score (0-100) for a worker
    against a customer's parsed service request.
    
    Factors:
    1. Skill & Category Relevance (35 pts)
    2. Location Proximity (25 pts)
    3. Availability & Urgency (20 pts)
    4. Pricing & Budget Fit (10 pts)
    5. Track Record & Verified Performance (10 pts)
    """
    explanations: List[str] = []
    
    # ----------------------------------------------------
    # 1. Skill & Category Match (35 pts)
    # ----------------------------------------------------
    skill_score = 0.0
    worker_skill = (worker.get('skill') or '').strip().lower()
    extra_skills = [s.strip().lower() for s in worker.get('extra_skills', [])]
    
    target_cat_lower = (category or '').strip().lower()
    
    if target_cat_lower and worker_skill == target_cat_lower:
        skill_score = 35.0
        explanations.append(f"Specialist in {worker.get('skill')} (Primary skill match)")
    elif target_cat_lower and (target_cat_lower in extra_skills or any(target_cat_lower in s for s in extra_skills)):
        skill_score = 26.0
        explanations.append(f"Offers {category} service (Auxiliary skill match)")
    elif candidate_categories:
        # If primary category is ambiguous, check candidate categories
        cand_found = False
        for cand in candidate_categories:
            c_name = cand['category'].lower()
            if worker_skill == c_name:
                weight = cand['probability']
                skill_score = round(30.0 * weight, 1)
                explanations.append(f"Matches potential category {cand['category']} ({int(weight*100)}% confidence)")
                cand_found = True
                break
        if not cand_found:
            skill_score = 5.0
            explanations.append("Different service category")
    else:
        skill_score = 0.0
        explanations.append(f"Trade mismatch (Worker: {worker.get('skill')})")

    # ----------------------------------------------------
    # 2. Location Proximity (25 pts)
    # ----------------------------------------------------
    location_score = 0.0
    worker_city = (worker.get('city') or '').strip().lower()
    worker_hood = (worker.get('neighborhood') or '').strip().lower()
    
    t_city_lower = (target_city or '').strip().lower()
    t_hood_lower = (target_neighborhood or '').strip().lower()

    if t_hood_lower and worker_hood and t_hood_lower == worker_hood:
        location_score = 25.0
        explanations.append(f"Same neighborhood ({worker.get('neighborhood')}, {worker.get('city')})")
    elif t_city_lower and worker_city == t_city_lower:
        location_score = 20.0
        if worker.get('neighborhood'):
            explanations.append(f"Located in same city ({worker.get('city')} - {worker.get('neighborhood')})")
        else:
            explanations.append(f"Located in same city ({worker.get('city')})")
    elif t_city_lower and TWIN_CITIES.get(t_city_lower) == worker_city:
        location_score = 13.0
        explanations.append(f"Twin-city coverage ({worker.get('city')} to {target_city})")
    elif not t_city_lower:
        # Customer didn't specify a city
        location_score = 16.0
        explanations.append(f"Serves {worker.get('city')}")
    else:
        location_score = 4.0
        explanations.append(f"Located in {worker.get('city')}")

    # ----------------------------------------------------
    # 3. Availability & Urgency (20 pts)
    # ----------------------------------------------------
    availability_score = 0.0
    is_available = bool(worker.get('available'))

    if is_available:
        availability_score = 20.0
        explanations.append("Immediately available for booking")
    else:
        if is_urgent:
            availability_score = 0.0
            explanations.append("Currently busy (not recommended for urgent jobs)")
        else:
            availability_score = 6.0
            explanations.append("Currently engaged on an active job")

    # ----------------------------------------------------
    # 4. Pricing & Budget Compatibility (10 pts)
    # ----------------------------------------------------
    pricing_score = 0.0
    rate = worker.get('rate', 1000)
    pricing_type = worker.get('pricing_type', 'job')

    if target_budget and target_budget > 0:
        if rate <= target_budget:
            pricing_score = 10.0
            explanations.append(f"Rate (Rs. {rate:,}/{pricing_type}) within budget (Rs. {target_budget:,})")
        elif rate <= target_budget * 1.25:
            pricing_score = 7.0
            explanations.append(f"Rate (Rs. {rate:,}/{pricing_type}) slightly above budget")
        elif rate <= target_budget * 1.6:
            pricing_score = 4.0
            explanations.append(f"Rate (Rs. {rate:,}/{pricing_type}) moderately above budget")
        else:
            pricing_score = 1.0
            explanations.append(f"Rate (Rs. {rate:,}/{pricing_type}) significantly exceeds budget")
    else:
        pricing_score = 8.0
        explanations.append(f"Standard rate: Rs. {rate:,}/{pricing_type}")

    # ----------------------------------------------------
    # 5. Track Record & Verified Reviews (10 pts)
    # ----------------------------------------------------
    history_score = 0.0
    completed_jobs = int(worker.get('completed_jobs', 0))
    rating = worker.get('rating')
    review_count = int(worker.get('review_count', 0))

    # Completed jobs contribution (up to 5 pts)
    jobs_pts = min(completed_jobs, 5) * 1.0
    
    # Rating contribution (up to 5 pts)
    if rating is not None and review_count > 0:
        rating_pts = round((float(rating) / 5.0) * 5.0, 1)
        explanations.append(f"{completed_jobs} completed jobs, {rating}★ rating ({review_count} reviews)")
    else:
        rating_pts = 2.5
        if completed_jobs > 0:
            explanations.append(f"{completed_jobs} completed jobs on platform")
        else:
            explanations.append("Newly registered worker on Roshan Rozgar")

    history_score = round(jobs_pts + rating_pts, 1)

    # ----------------------------------------------------
    # Total Score & Match Level
    # ----------------------------------------------------
    total_score = round(skill_score + location_score + availability_score + pricing_score + history_score, 1)
    total_score = min(100.0, max(0.0, total_score))

    if total_score >= 82.0:
        match_level = "excellent"
    elif total_score >= 68.0:
        match_level = "strong"
    elif total_score >= 50.0:
        match_level = "moderate"
    else:
        match_level = "low"

    return {
        'total_score': total_score,
        'match_level': match_level,
        'score_breakdown': {
            'skill_score': skill_score,
            'location_score': location_score,
            'availability_score': availability_score,
            'pricing_score': pricing_score,
            'history_score': history_score,
        },
        'explanations': explanations
    }

def rank_workers_for_request(
    workers: List[Dict[str, Any]],
    category: Optional[str],
    candidate_categories: List[Dict[str, Any]],
    target_city: Optional[str] = None,
    target_neighborhood: Optional[str] = None,
    target_budget: Optional[int] = None,
    is_urgent: bool = False,
    only_available: bool = False,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    Ranks workers deterministically by transparent match score.
    Returns ranked worker objects with their score breakdown and explanations attached.
    """
    scored_workers = []
    
    for w in workers:
        if only_available and not w.get('available'):
            continue
            
        scoring = calculate_worker_match(
            worker=w,
            category=category,
            candidate_categories=candidate_categories,
            target_city=target_city,
            target_neighborhood=target_neighborhood,
            target_budget=target_budget,
            is_urgent=is_urgent
        )
        
        matched_worker = dict(w)
        matched_worker['match_score'] = scoring['total_score']
        matched_worker['match_level'] = scoring['match_level']
        matched_worker['score_breakdown'] = scoring['score_breakdown']
        matched_worker['explanations'] = scoring['explanations']
        scored_workers.append(matched_worker)

    # Deterministic sorting: match_score DESC, then available DESC, then rating DESC, then id ASC
    scored_workers.sort(
        key=lambda item: (
            item['match_score'],
            1 if item.get('available') else 0,
            item.get('rating') or 0.0,
            -item.get('id', 0)
        ),
        reverse=True
    )

    return scored_workers[:limit]
