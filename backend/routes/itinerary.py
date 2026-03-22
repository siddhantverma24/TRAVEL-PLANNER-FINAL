"""Itinerary Route - Groq AI Integration
"""
from flask import Blueprint, request, jsonify
import os
import json
import requests

itinerary_bp = Blueprint('itinerary', __name__)

GROQ_KEY = os.environ.get('GROQ_KEY')
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

@itinerary_bp.route('/', methods=['POST'])
def generate_itinerary():
    # LIVE API: Groq AI
    try:
        data = request.json
        destination = data.get('destination', '')
        days = int(data.get('days', data.get('duration', 5)))  # Support both 'days' and 'duration'
        interests = data.get('interests', [])
        budget = data.get('budget', 'moderate')
        
        if not destination:
            return jsonify({"error": "Destination required"}), 400
        
        groq_key = os.environ.get('GROQ_KEY')
        if not groq_key:
            return jsonify({"error": "Groq API not configured"}), 503
        
        print(f"[API] Calling Groq for itinerary: {destination}")
        
        # Build prompt
        interests_str = ", ".join(interests) if interests else "general sightseeing"
        prompt = f"""Create a {days}-day travel itinerary for {destination}.
        
User interests: {interests_str}
Budget level: {budget}

Requirements:
- Daily breakdown with specific times
- Mix of popular sites and lesser-known spots
- Include meal recommendations (breakfast, lunch, dinner)
- Practical tips (transportation, best times to visit, etc.)
- Budget-friendly alternatives
- Weather considerations for this season

Return ONLY valid JSON (no markdown, no code blocks):
{{
  "days": [
    {{
      "day": 1,
      "title": "Arrival & Exploration",
      "activities": [
        {{"time": "09:00", "activity": "Activity with time", "duration": "2 hours"}},
        {{"time": "14:00", "activity": "Activity with time", "duration": "3 hours"}}
      ],
      "meals": {{"breakfast": "venue", "lunch": "venue", "dinner": "venue"}},
      "cost": 150,
      "tips": "Practical tips for this day"
    }}
  ],
  "totalCost": 750,
  "breakdown": {{
    "accommodation": 300,
    "food": 200,
    "activities": 150,
    "transport": 100
  }},
  "weather": "Expected weather conditions",
  "packingList": ["Item 1", "Item 2"]
}}"""
        
        # Call Groq API
        response_text = _call_groq_api(prompt)
        
        # Parse JSON - remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        
        result = json.loads(response_text)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"[ERROR] itinerary route: {str(e)}")
        # Return fallback itinerary
        destination = request.json.get('destination', 'Destination')
        days = int(request.json.get('days', request.json.get('duration', 5)))
        return jsonify({
            "days": [
                {
                    "day": i+1,
                    "title": f"Day {i+1} in {destination}",
                    "activities": [
                        {"time": "09:00", "activity": "Explore local attractions", "duration": "3 hours"},
                        {"time": "14:00", "activity": "Enjoy local cuisine", "duration": "2 hours"}
                    ],
                    "meals": {"breakfast": "Local cafe", "lunch": "Restaurant", "dinner": "Fine dining"},
                    "cost": 200,
                    "tips": "Ask locals for recommendations"
                }
                for i in range(days)
            ],
            "totalCost": 200 * days,
            "breakdown": {
                "accommodation": 100 * days,
                "food": 50 * days,
                "activities": 40 * days,
                "transport": 10 * days
            }
        }), 200


def _call_groq_api(prompt):
    """Call Groq API and return response text"""
    headers = {
        "Authorization": f"Bearer {GROQ_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "mixtral-8x7b-32768",
        "temperature": 0.7,
        "max_tokens": 2000,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    response = requests.post(GROQ_URL, json=payload, headers=headers)
    response.raise_for_status()
    
    result = response.json()
    return result['choices'][0]['message']['content']
