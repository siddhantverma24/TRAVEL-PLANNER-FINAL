"""
Phrases Route - Simple language translation tool using Groq
"""
from flask import Blueprint, request, jsonify
import requests
import os
import json

phrases_bp = Blueprint('phrases', __name__)

GROQ_KEY = os.environ.get('GROQ_KEY')
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

@phrases_bp.route('/translate', methods=['POST'])
def translate_sentence():
    """Translate sentences to multiple languages using Groq API"""
    try:
        body = request.get_json()
        
        sentence = body.get('sentence', '')
        target_languages = body.get('languages', ['Spanish', 'French', 'German'])
        
        if not sentence or not sentence.strip():
            return jsonify({
                "error": "Please provide a sentence to translate",
                "success": False
            }), 400
        
        # Check if Groq key is available
        if not GROQ_KEY or GROQ_KEY == 'your_key_here':
            print("[WARNING] GROQ_KEY not configured, using fallback translation")
            return jsonify({
                "original": sentence,
                "languages": target_languages,
                "translations": {lang: {"translation": "Translation unavailable - API key not configured", "pronunciation": "", "tip": ""} for lang in target_languages},
                "source": "fallback"
            })
        
        # Build prompt for multi-language translation
        languages_str = ", ".join(target_languages)
        
        prompt = f"""You are a professional translator. Translate the following sentence to {languages_str}.

Original sentence: "{sentence}"

For each language:
- Provide an accurate, natural translation
- Include a pronunciation guide if helpful
- Add one brief cultural tip about how to use this phrase naturally

Return ONLY valid JSON with this exact structure (no code blocks, just raw JSON):
{{
    "original": "{sentence}",
    "translations": {{
        "language_name": {{
            "translation": "translated text",
            "pronunciation": "phonetic guide if needed",
            "tip": "Brief cultural/usage tip"
        }}
    }}
}}

Translate to: {languages_str}
Ensure all translations are natural and commonly used."""

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
            "max_tokens": 1500
        }
        
        print(f"[API] Calling Groq for translation: {sentence[:50]}... -> {target_languages}")
        response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        ai_response = result['choices'][0]['message']['content']
        data = json.loads(ai_response)
        data['source'] = 'groq'
        data['success'] = True
        
        return jsonify(data)
        
    except Exception as e:
        print(f"[ERROR] translate route: {str(e)}")
        sentence = body.get('sentence', '') if 'body' in locals() else ''
        languages = body.get('languages', ['Spanish', 'French']) if 'body' in locals() else ['Spanish', 'French']
        
        return jsonify({
            "original": sentence,
            "languages": languages,
            "translations": {lang: {"translation": f"Error: {str(e)}", "pronunciation": "", "tip": ""} for lang in languages},
            "source": "fallback",
            "success": False
        })
