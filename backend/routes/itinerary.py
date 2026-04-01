"""Itinerary Route - Groq AI Integration (Real Itinerary Generation)
"""
from flask import Blueprint, request, jsonify
import os
import json
import requests
from datetime import datetime, timedelta

itinerary_bp = Blueprint('itinerary', __name__)

GROQ_API_KEY = os.environ.get('GROQ_API_KEY') or os.environ.get('GROQ_KEY')
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

@itinerary_bp.route('/', methods=['POST'])
def generate_itinerary():
    """Generate a real day-by-day itinerary using Groq AI"""
    try:
        data = request.json
        destination = data.get('destination', '').strip()
        days = int(data.get('days', data.get('duration', 5)))
        travel_date = data.get('travel_date', data.get('date', ''))
        budget_level = data.get('budget', 'midrange')
        interests = data.get('interests', [])
        traveler_type = data.get('traveler_type', data.get('travelerType', 'solo'))
        
        # Validate required fields
        if not destination:
            return jsonify({"error": "Destination required"}), 400
        
        if days < 1 or days > 30:
            return jsonify({"error": "Days must be between 1 and 30"}), 400
        
        if not GROQ_API_KEY:
            print("[ERROR] GROQ_KEY not configured in environment")
            return jsonify({"error": "AI service not configured"}), 503
        
        print(f"[ITINERARY] Generating {days}-day itinerary for {destination}")
        print(f"[ITINERARY] Budget: {budget_level}, Traveler: {traveler_type}, Interests: {interests}")
        
        # Build a detailed prompt for Groq
        interests_str = ", ".join(interests) if interests else "general sightseeing, culture, local cuisine"
        
        prompt = f"""You are a professional travel planner. Create a detailed {days}-day travel itinerary for {destination}.

TRAVELER PROFILE:
- Destination: {destination}
- Duration: {days} days
- Budget Level: {budget_level} (budget=$20-50/day, midrange=$50-150/day, luxury=$150+/day)
- Traveler Type: {traveler_type}
- Interests: {interests_str}

REQUIREMENTS:
1. Create a day-by-day itinerary with specific activities, times, and costs
2. Include 3-4 main activities per day with times (e.g., 09:00-11:00)
3. Recommend breakfast, lunch, and dinner venues (actual suggested restaurants or types)
4. Each day should have a title and summary
5. Include practical tips for each day (transportation, best times, tickets, etc.)
6. Format times as HH:MM
7. Include estimated daily cost
8. Keep activities realistic and accessible for the {traveler_type} traveler
9. Mix popular attractions with local hidden gems
10. Consider weather and local events seasonally

RESPONSE FORMAT - Return ONLY valid JSON, no markdown code blocks:
{{
  "destination": "{destination}",
  "days": {days},
  "budget_level": "{budget_level}",
  "days_schedule": [
    {{
      "day": 1,
      "date": "Day 1 of {days}",
      "title": "Arrival & First Impressions",
      "summary": "Arrive and get oriented with the city",
      "activities": [
        {{
          "time": "09:00",
          "activity": "Arrival at airport/station",
          "duration": "1-2 hours",
          "cost": 0,
          "tips": "Take metro/taxi to hotel, settle in"
        }},
        {{
          "time": "12:00",
          "activity": "Lunch at local restaurant",
          "duration": "1 hour",
          "cost": 15,
          "tips": "Ask hotel staff for recommendations"
        }}
      ],
      "meals": {{
        "breakfast": "Hotel or local cafe",
        "lunch": "Local restaurant downtown",
        "dinner": "Popular restaurant in city center"
      }},
      "daily_cost": 60,
      "tips": "Start with relaxation after travel, explore neighborhood walking"
    }}
  ],
  "total_estimated_cost": 600,
  "cost_breakdown": {{
    "accommodation": 300,
    "food_and_dining": 180,
    "activities_and_attractions": 100,
    "transportation": 20
  }},
  "packing_suggestions": [
    "Comfortable walking shoes",
    "Light jacket"
  ],
  "general_tips": "Use public transportation when possible to save money. Always carry a copy of your passport."
}}"""
        
        # Call Groq API with real model
        response_text = _call_groq_api(prompt, GROQ_API_KEY)
        
        # Clean up response if it has markdown code blocks
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        
        response_text = response_text.strip().rstrip('`')
        
        # Parse JSON response
        result = json.loads(response_text)
        
        print(f"[ITINERARY] Successfully generated itinerary for {destination}")
        return jsonify(result), 200
        
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON parsing failed: {str(e)}")
        print(f"[ERROR] Response text: {response_text[:500]}")
        return jsonify({"error": "Invalid response format from AI service", "details": str(e)}), 500
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Groq API request failed: {str(e)}")
        return jsonify({"error": "AI service request failed", "details": str(e)}), 503
        
    except Exception as e:
        print(f"[ERROR] Itinerary generation failed: {str(e)}")
        return jsonify({"error": "Failed to generate itinerary", "details": str(e)}), 500


def _call_groq_api(prompt, api_key):
    """Call Groq API with llama3-8b model and return response text"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "temperature": 0.7,
        "max_tokens": 3000,
        "messages": [
            {"role": "system", "content": "You are a helpful travel planning assistant. Always respond with valid JSON format."},
            {"role": "user", "content": prompt}
        ]
    }
    
    print(f"[GROQ] Calling API with model llama3-8b-8192")
    
    response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    
    result = response.json()
    return result['choices'][0]['message']['content']
