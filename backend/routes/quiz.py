"""
Quiz Route - AI-powered destination recommendation using Groq
"""
from flask import Blueprint, request, jsonify
import requests
import os
import json

quiz_bp = Blueprint('quiz', __name__)

GROQ_KEY = os.environ.get('GROQ_KEY')
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def generate_fallback_recommendation():
    """Generate fallback destination recommendation when Groq API is unavailable"""
    return {
        "destination": "Miami, Florida",
        "tagline": "Where tropical meets cosmopolitan",
        "matchScore": 85,
        "whyPerfect": "Miami offers beautiful beaches perfect for relaxation, vibrant nightlife, diverse dining, cultural attractions, and year-round warm weather. It's ideal for both adventure and unwinding.",
        "highlights": [
            {
                "icon": "🏖️",
                "title": "World-Class Beaches",
                "description": "South Beach, Miami Beach, Key Biscayne"
            },
            {
                "icon": "🌃",
                "title": "Vibrant Nightlife",
                "description": "Clubs, bars, and rooftop lounges"
            },
            {
                "icon": "🍽️",
                "title": "Diverse Cuisine",
                "description": "Cuban, Caribbean, and international dining"
            }
        ],
        "bestTime": "November to April for perfect weather",
        "budget": {
            "flights": 250,
            "accommodation": 900,
            "activities": 400,
            "food": 450,
            "total": 2000
        },
        "alternativeDestinations": [
            {
                "name": "Key West, Florida",
                "reason": "Tropical island vibes with laid-back atmosphere",
                "matchScore": 82
            },
            {
                "name": "San Diego, California",
                "reason": "Beach paradise with perfect year-round weather",
                "matchScore": 80
            }
        ],
        "topActivities": [
            "Relax on South Beach",
            "Explore Art Deco architecture",
            "Visit Cuba's Little Havana",
            "Snorkel at nearby reefs",
            "Enjoy vibrant nightlife"
        ],
        "travelTip": "Book hotels in advance during peak season (Dec-Mar) for better rates",
        "source": "fallback"
    }


@quiz_bp.route('/', methods=['POST'])
def destination_quiz():
    """Generate AI-powered destination recommendation using Groq API"""
    try:
        body = request.get_json()
        
        answers = body.get('answers', {})
        budget = body.get('budget', 2000)
        travel_month = body.get('travelMonth', 'June')
        
        scenery = answers.get('scenery', 'beaches')
        activities = answers.get('activities', 'relaxing')
        duration = answers.get('duration', '1 week')
        priority = answers.get('priority', 'value')
        style = answers.get('style', 'flexible')
        
        # Check if Groq key is available
        if not GROQ_KEY or GROQ_KEY == 'your_key_here':
            print("[WARNING] GROQ_KEY not configured, using fallback recommendation")
            return jsonify(generate_fallback_recommendation())
        
        # Build Groq prompt
        prompt = f"""You are an expert travel advisor.
Based on these travel preferences, recommend the perfect US destination:
- Preferred scenery: {scenery}
- Favorite activities: {activities}
- Trip duration: {duration}
- Travel priority: {priority}
- Travel style: {style}
- Budget: ${budget}
- Travel month: {travel_month}

Return ONLY valid JSON:
{{
    "destination": "City, State",
    "tagline": "Short catchy description",
    "matchScore": 95,
    "whyPerfect": "Three specific reasons why this matches their preferences",
    "highlights": [
        {{"icon": "emoji", "title": "Highlight", "description": "Details"}},
        {{"icon": "emoji", "title": "Highlight", "description": "Details"}},
        {{"icon": "emoji", "title": "Highlight", "description": "Details"}}
    ],
    "bestTime": "Best time to visit with weather info",
    "budget": {{"flights": 0, "accommodation": 0, "activities": 0, "food": 0, "total": 0}},
    "alternativeDestinations": [
        {{"name": "City", "reason": "Why consider this", "matchScore": 88}},
        {{"name": "City", "reason": "Why consider this", "matchScore": 85}}
    ],
    "topActivities": ["Activity 1", "Activity 2", "Activity 3", "Activity 4", "Activity 5"],
    "travelTip": "Practical travel advice"
}}

Make the recommendation specific and personal to their answers.
Highlights array must have exactly 3 items.
Alternative destinations must have exactly 2 items.
Budget breakdown should total the provided budget amount."""

        # Call Groq API
        print(f"[API] Calling Groq for destination quiz recommendation")
        
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
            "temperature": 0.8,
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
        print(f"[ERROR] quiz route: {str(e)}")
        return jsonify(generate_fallback_recommendation())
