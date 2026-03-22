"""
Translate Route - LibreTranslate API Integration + AI Travel Phrases using Groq
"""
from flask import Blueprint, request, jsonify
import requests
import os
import json

translate_bp = Blueprint('translate', __name__)
translate_cache = {}  # Simple dict cache for translations

GROQ_KEY = os.environ.get('GROQ_KEY')
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Supported languages in LibreTranslate
LANGUAGES = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German",
    "it": "Italian", "pt": "Portuguese", "nl": "Dutch", "ru": "Russian",
    "ja": "Japanese", "ko": "Korean", "zh": "Chinese Simplified",
    "ar": "Arabic", "hi": "Hindi", "tr": "Turkish", "th": "Thai"
}

@translate_bp.route('/', methods=['POST'])
def translate_text():
    # LIVE API: LibreTranslate (free API, no key needed)
    try:
        data = request.json
        text = data.get('text', '').strip()
        target = data.get('target', 'es').lower()
        source = data.get('source', 'en').lower()
        
        if not text:
            return jsonify({"error": "Text required"}), 400
        
        # Check cache
        cache_key = f"{source}-{target}:{text}"
        if cache_key in translate_cache:
            return jsonify(translate_cache[cache_key])
        
        print(f"[API] Calling LibreTranslate for {source} -> {target}")
        
        url = "https://api.libretranslate.de/translate"
        payload = {
            "q": text,
            "source_language": source,
            "target_language": target
        }
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        result = {
            "text": text,
            "translation": data.get('translatedText', text),
            "source": source,
            "target": target,
            "sourceLanguage": LANGUAGES.get(source, source),
            "targetLanguage": LANGUAGES.get(target, target)
        }
        
        # Cache result
        translate_cache[cache_key] = result
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] translate route: {str(e)}")
        return jsonify({"error": "Translation service unavailable"}), 503
    except Exception as e:
        print(f"[ERROR] translate route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@translate_bp.route('/api/languages', methods=['GET'])
def get_languages():
    # List all supported languages
    return jsonify({
        "languages": LANGUAGES,
        "count": len(LANGUAGES)
    })


def generate_fallback_phrases(language, destination, category):
    """Generate fallback travel phrases when Groq API is unavailable"""
    return {
        "language": language,
        "destination": destination,
        "category": category,
        "phrases": [
            {
                "english": "Hello",
                "translation": f"Greeting in {language}",
                "pronunciation": "Standard pronunciation",
                "romanized": "romanized version",
                "toneNote": "Polite and always appropriate",
                "culturalTip": "Common greeting in this destination"
            },
            {
                "english": "Thank you",
                "translation": f"Thanks in {language}",
                "pronunciation": "Thank you pronunciation",
                "romanized": "romanized version",
                "toneNote": "Expressing gratitude",
                "culturalTip": "Always appreciated"
            }
        ],
        "culturalNotes": [
            "Learn basic respect phrases for the destination",
            "Body language and gestures matter",
            "Always try to speak the local language"
        ],
        "emergencyPhrases": [
            {
                "english": "Help!",
                "translation": f"Help in {language}",
                "pronunciation": "Help pronunciation"
            },
            {
                "english": "Call the police",
                "translation": f"Police in {language}",
                "pronunciation": "Police pronunciation"
            }
        ],
        "source": "fallback"
    }


@translate_bp.route('/phrases', methods=['POST'])
def generate_travel_phrases():
    """Generate AI-powered travel phrase guide using Groq API"""
    try:
        body = request.get_json()
        
        language = body.get('language', 'Spanish')
        language_code = body.get('languageCode', 'es')
        category = body.get('category', 'essentials')
        destination = body.get('destination', 'general')
        situation = body.get('situation', 'general travel')
        
        # Check if Groq key is available
        if not GROQ_KEY or GROQ_KEY == 'your_key_here':
            print(f"[WARNING] GROQ_KEY not configured, using fallback phrases for {language}")
            return jsonify(generate_fallback_phrases(language, destination, category))
        
        # Build Groq prompt
        prompt = f"""You are a language expert and travel guide.
Generate a travel phrase guide for {language} specifically for someone visiting {destination}.
Context: {situation}

Return ONLY valid JSON:
{{
    "language": "{language}",
    "destination": "{destination}",
    "category": "{category}",
    "phrases": [
        {{
            "english": "English phrase",
            "translation": "Translation in {language}",
            "pronunciation": "How to pronounce",
            "romanized": "Romanized version if needed",
            "toneNote": "Tone and level of formality",
            "culturalTip": "Cultural context or usage tip"
        }}
    ],
    "culturalNotes": [
        "Important cultural note 1",
        "Important cultural note 2",
        "Important cultural note 3"
    ],
    "emergencyPhrases": [
        {{
            "english": "Emergency phrase",
            "translation": "Translation in {language}",
            "pronunciation": "Pronunciation"
        }}
    ]
}}

Generate exactly 8 practical phrases for the {category} category.
Make them specific to {destination} not just generic.
Include cultural context that helps avoid mistakes.
Include 3 cultural notes and 3 emergency phrases."""

        # Call Groq API
        print(f"[API] Calling Groq for {language} phrases in {destination}")
        
        headers = {
            "Authorization": f"Bearer {GROQ_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        ai_response = result['choices'][0]['message']['content']
        data = json.loads(ai_response)
        data['source'] = 'groq'
        
        return jsonify(data)
        
    except Exception as e:
        print(f"[ERROR] phrases route: {str(e)}")
        language = body.get('language', 'Spanish') if 'body' in locals() else 'Spanish'
        destination = body.get('destination', 'general') if 'body' in locals() else 'general'
        category = body.get('category', 'essentials') if 'body' in locals() else 'essentials'
        
        return jsonify(generate_fallback_phrases(language, destination, category))
