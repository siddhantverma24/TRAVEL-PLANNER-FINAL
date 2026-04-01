"""
Hero AI Route - Provides AI-powered travel destination suggestions
Calls Groq LLaMA API to generate personalized travel recommendations
"""

from flask import Blueprint, request, jsonify
import os
import json
from groq import Groq

hero_ai_bp = Blueprint('hero_ai', __name__)

# Initialize Groq client
def get_groq_client():
    api_key = os.environ.get('GROQ_KEY')
    if not api_key:
        return None
    return Groq(api_key=api_key)


@hero_ai_bp.route('/', methods=['POST'])
def hero_ai():
    """
    POST /api/hero-ai
    
    Request body:
    {
      "prompt": "Find my family adventure"
    }
    
    Returns JSON parsed from model output.
    The response may be an object or an array depending on the user's prompt.
    """
    try:
        data = request.get_json() or {}
        user_prompt = data.get('prompt', 'Find the best US destinations')

        client = get_groq_client()
        if not client:
            return jsonify({'error': 'Groq API key not configured'}), 500

        # Let caller define exact output schema; force valid JSON only.
        system_prompt = (
            "You are a USA travel expert. Return ONLY valid JSON with no markdown, no code fences, "
            "and no extra text. Follow the exact JSON structure requested by the user prompt. "
            "If the prompt asks for an array, return an array. If it asks for an object, return an object."
        )

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        raw = (completion.choices[0].message.content or '').strip()

        # Handle accidental markdown code fences.
        if raw.startswith('```'):
            raw = raw.strip('`')
            if raw.lower().startswith('json'):
                raw = raw[4:]
            raw = raw.strip()

        try:
            result = json.loads(raw)
            return jsonify(result)
        except json.JSONDecodeError:
            return jsonify({'error': 'Model returned invalid JSON'}), 502

    except Exception as e:
        print(f"Hero AI Route Error: {str(e)}")
        # Keep backward-compatible fallback shape for existing UI when upstream fails.
        return jsonify([
            {
                "name": "New York City",
                "emoji": "🗽",
                "tagline": "The city that never sleeps",
                "description": "Experience iconic landmarks, world-class museums, and diverse neighborhoods. From Times Square to Central Park, NYC offers unforgettable urban adventures."
            },
            {
                "name": "Grand Canyon",
                "emoji": "🏜️",
                "tagline": "Nature's greatest masterpiece",
                "description": "Witness one of the world's most spectacular natural wonders. Hike stunning trails, raft the Colorado River, or simply marvel at the breathtaking vistas."
            },
            {
                "name": "Miami Beach",
                "emoji": "🏖️",
                "tagline": "Tropical paradise with style",
                "description": "Enjoy pristine beaches, vibrant nightlife, and Art Deco architecture. Miami Beach offers the perfect blend of relaxation and entertainment for all travelers."
            }
        ]), 500
