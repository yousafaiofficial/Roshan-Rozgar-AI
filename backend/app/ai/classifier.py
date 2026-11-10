from typing import Dict, Any, List, Optional
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from .preprocessor import preprocess_text, extract_entities
from .training_data import TRAINING_DATA

CATEGORIES_META = {
    'Electrician': {
        'ur': 'الیکٹریشن',
        'ur-Latn': 'Electrician (Bijli)',
        'description': 'Wiring, switches, breakers, UPS, generators, and electrical appliances'
    },
    'Plumber': {
        'ur': 'پلمبر',
        'ur-Latn': 'Plumber (Nal aur Pipe)',
        'description': 'Pipes, leaks, water pump motors, geysers, flush tanks, and drainage'
    },
    'AC Technician': {
        'ur': 'اے سی ٹیکنیشن',
        'ur-Latn': 'AC Technician (Cooling)',
        'description': 'Air conditioner servicing, cooling repair, gas refills, and installations'
    },
    'Carpenter': {
        'ur': 'بڑھئی / ترکھان',
        'ur-Latn': 'Carpenter (Lakri ka kaam)',
        'description': 'Wooden furniture, wardrobes, doors, locks, hinges, and custom woodwork'
    },
    'Painter': {
        'ur': 'پینٹر',
        'ur-Latn': 'Painter (Rang Roghan)',
        'description': 'Wall painting, distemper, whitewash, wood varnish, and water-proofing'
    },
    'Cleaner': {
        'ur': 'صفائی کا عملہ',
        'ur-Latn': 'Cleaner (Deep Cleaning)',
        'description': 'Deep home cleaning, kitchen scrubbing, sofa washing, and water tank cleaning'
    },
    'Mechanic': {
        'ur': 'مکینک',
        'ur-Latn': 'Mechanic (Auto & Bike)',
        'description': 'Motorcycle tuning, oil change, brakes, engine diagnostics, and roadside repair'
    }
}

CONFIDENCE_THRESHOLD = 0.32

class ServiceClassifier:
    """
    Multilingual service category classifier using subword char n-grams + word n-grams
    with calibrated logistic regression. Runs locally with zero remote dependencies.
    """
    def __init__(self):
        self.pipeline: Optional[Pipeline] = None
        self.classes: List[str] = []
        self._train_model()

    def _train_model(self):
        X = []
        y = []
        for text, category in TRAINING_DATA:
            cleaned, _ = preprocess_text(text)
            X.append(cleaned)
            y.append(category)

        # Feature Union: character n-grams (subword stems) + word n-grams
        union = FeatureUnion([
            ('char_wb', TfidfVectorizer(
                analyzer='char_wb',
                ngram_range=(2, 5),
                min_df=1,
                sublinear_tf=True
            )),
            ('word', TfidfVectorizer(
                analyzer='word',
                ngram_range=(1, 2),
                min_df=1,
                sublinear_tf=True
            ))
        ])

        clf = LogisticRegression(
            C=2.5,
            max_iter=1000,
            class_weight='balanced',
            random_state=42
        )

        self.pipeline = Pipeline([
            ('features', union),
            ('classifier', clf)
        ])
        self.pipeline.fit(X, y)
        self.classes = list(clf.classes_)

    def classify(self, text: str) -> Dict[str, Any]:
        """
        Classifies the customer query into a service category with probability distribution,
        detected language, extracted entities, and fallback guidance when ambiguous.
        """
        if not text or len(text.strip()) < 3:
            return self._build_fallback(
                raw_text=text,
                language='en',
                cleaned_text='',
                entities=extract_entities(text or ''),
                reason='Input text is too short or empty'
            )

        cleaned, lang = preprocess_text(text)
        entities = extract_entities(text)

        # Predict probabilities
        assert self.pipeline is not None
        probs = self.pipeline.predict_proba([cleaned])[0]
        prob_pairs = sorted(zip(self.classes, probs), key=lambda x: x[1], reverse=True)

        top_category, top_prob = prob_pairs[0]
        second_category, second_prob = prob_pairs[1] if len(prob_pairs) > 1 else (None, 0.0)

        # Format top 3 candidates
        top_candidates = [
            {
                'category': cat,
                'probability': round(float(prob), 4),
                'meta': CATEGORIES_META.get(cat, {})
            }
            for cat, prob in prob_pairs[:3]
        ]

        # Determine if classification is confident
        # If top probability is below threshold, or top 2 classes are virtually indistinguishable
        # on non-specific queries, mark as ambiguous fallback
        is_confident = (top_prob >= CONFIDENCE_THRESHOLD)

        # Specific guard for extremely generic text (e.g., "Help urgently please call me")
        # that has no actual trade indicators
        word_count = len(cleaned.split())
        if is_confident and top_prob < 0.45 and word_count <= 4:
            # Check if any strong domain keywords exist in top category
            is_confident = (top_prob >= 0.40)

        if not is_confident:
            return self._build_fallback(
                raw_text=text,
                language=lang,
                cleaned_text=cleaned,
                entities=entities,
                top_candidates=top_candidates,
                reason='Query does not have high enough confidence for a single service category'
            )

        return {
            'status': 'confident',
            'category': top_category,
            'confidence': round(float(top_prob), 4),
            'is_confident': True,
            'language': lang,
            'cleaned_text': cleaned,
            'top_categories': top_candidates,
            'entities': entities,
            'meta': CATEGORIES_META.get(top_category, {})
        }

    def _build_fallback(
        self,
        raw_text: str,
        language: str,
        cleaned_text: str,
        entities: Dict[str, Any],
        top_candidates: Optional[List[Dict[str, Any]]] = None,
        reason: str = ''
    ) -> Dict[str, Any]:
        """Provides graceful fallback information and guidance across 3 languages."""
        return {
            'status': 'fallback',
            'category': top_candidates[0]['category'] if top_candidates and top_candidates[0]['probability'] > 0.20 else None,
            'confidence': top_candidates[0]['probability'] if top_candidates else 0.0,
            'is_confident': False,
            'language': language,
            'cleaned_text': cleaned_text,
            'top_categories': top_candidates or [],
            'entities': entities,
            'fallback_reason': reason,
            'clarification_prompt': {
                'en': 'We could not pinpoint the exact service you need. Please choose a category from the suggestions or provide more details.',
                'ur': 'ہم آپ کی مطلوبہ سروس کا درست تعین نہیں کر سکے۔ برائے مہربانی دی گئی فہرست میں سے انتخاب کریں یا مزید تفصیل لکھیں۔',
                'ur-Latn': 'Aapki darkhwast wazeh nahi thi. Barah-e-karam deeda shobay mein se intekhab karein ya wazahat karein.'
            }
        }

# Global singleton classifier instance
classifier = ServiceClassifier()
