import os
import json
import requests
from flask import Blueprint, jsonify, request

quiz_bp = Blueprint('quiz', __name__)

GROQ_URL = (
    "https://api.groq.com/openai/v1/"
    "chat/completions"
)

# Diverse fallback pool — used only if Groq completely fails
FALLBACK_POOL = [
    {
        "destination": "New York City",
        "state": "New York",
        "emoji": "🗽",
        "match": 92,
        "tagline": "The city that never sleeps",
        "why": (
            "Perfect for culture lovers and city explorers who want world-class food, "
            "art and entertainment."
        ),
        "highlights": [
            "Times Square & Broadway shows",
            "Central Park walks",
            "World-class museums",
            "Diverse food scene"
        ],
        "budget": "$150-300/day",
        "best_time": "April-June, Sept-Nov",
        "vibe": "Urban · Cultural · Exciting",
        "alternatives": ["Boston", "Philadelphia"]
    },
    {
        "destination": "Grand Canyon",
        "state": "Arizona",
        "emoji": "🏜️",
        "match": 89,
        "tagline": "Nature's greatest masterpiece",
        "why": (
            "Ideal for adventure seekers and nature lovers who want breathtaking "
            "landscapes and outdoor activities."
        ),
        "highlights": [
            "South Rim viewpoints",
            "Hiking trails",
            "Helicopter tours",
            "Stargazing at night"
        ],
        "budget": "$80-150/day",
        "best_time": "March-May, Sept-Nov",
        "vibe": "Adventure · Nature · Scenic",
        "alternatives": ["Yellowstone", "Zion"]
    },
    {
        "destination": "Miami",
        "state": "Florida",
        "emoji": "🌴",
        "match": 88,
        "tagline": "Sun, sea and vibrant culture",
        "why": (
            "Great for beach lovers and nightlife enthusiasts who want warm weather "
            "and a buzzing social scene."
        ),
        "highlights": [
            "South Beach",
            "Art Deco architecture",
            "Little Havana food tour",
            "Everglades day trip"
        ],
        "budget": "$120-250/day",
        "best_time": "Nov-April",
        "vibe": "Beach · Nightlife · Vibrant",
        "alternatives": ["Key West", "Tampa"]
    },
    {
        "destination": "San Francisco",
        "state": "California",
        "emoji": "🌉",
        "match": 87,
        "tagline": "Where innovation meets beauty",
        "why": (
            "Perfect for curious explorers who love iconic landmarks, great food "
            "and stunning bay views."
        ),
        "highlights": [
            "Golden Gate Bridge",
            "Alcatraz Island tour",
            "Fisherman's Wharf",
            "Napa Valley day trip"
        ],
        "budget": "$130-280/day",
        "best_time": "Sept-Nov",
        "vibe": "Iconic · Foodie · Scenic",
        "alternatives": ["Los Angeles", "Seattle"]
    },
    {
        "destination": "Hawaii",
        "state": "Hawaii",
        "emoji": "🌺",
        "match": 91,
        "tagline": "Paradise found",
        "why": (
            "Perfect for relaxation seekers who want pristine beaches, tropical "
            "nature and island culture."
        ),
        "highlights": [
            "Waikiki Beach",
            "Volcanoes National Park",
            "Snorkelling & surfing",
            "Luau experience"
        ],
        "budget": "$200-400/day",
        "best_time": "April-June, Sept-Nov",
        "vibe": "Relaxation · Beach · Tropical",
        "alternatives": ["Maui", "Kauai"]
    },
    {
        "destination": "Las Vegas",
        "state": "Nevada",
        "emoji": "🎰",
        "match": 85,
        "tagline": "Entertainment capital of the world",
        "why": (
            "Ideal for those who love excitement, world-class shows and unforgettable "
            "nightlife experiences."
        ),
        "highlights": [
            "The Strip at night",
            "World-class shows",
            "Fine dining restaurants",
            "Grand Canyon day trip"
        ],
        "budget": "$150-350/day",
        "best_time": "March-May, Sept-Nov",
        "vibe": "Entertainment · Luxury · Exciting",
        "alternatives": ["Reno", "Atlantic City"]
    },
    {
        "destination": "Yellowstone",
        "state": "Wyoming",
        "emoji": "🌋",
        "match": 86,
        "tagline": "Geysers, wildlife and wonders",
        "why": (
            "Perfect for nature photographers and wildlife enthusiasts who want "
            "untamed natural beauty and outdoor adventure."
        ),
        "highlights": [
            "Old Faithful geyser",
            "Wildlife viewing",
            "Geothermal pools",
            "Scenic drives"
        ],
        "budget": "$90-160/day",
        "best_time": "May-Sept",
        "vibe": "Wild · Natural · Untamed",
        "alternatives": ["Glacier", "Redwood"]
    },
    {
        "destination": "New Orleans",
        "state": "Louisiana",
        "emoji": "🎷",
        "match": 84,
        "tagline": "Live music and French charm",
        "why": (
            "Ideal for foodies and culture seekers who want unique cuisine, live music "
            "and vibrant history on every corner."
        ),
        "highlights": [
            "French Quarter",
            "Live jazz music",
            "Cajun cuisine",
            "Mississippi River cruises"
        ],
        "budget": "$100-200/day",
        "best_time": "Feb-May, Sept-Nov",
        "vibe": "Cultural · Musical · Festive",
        "alternatives": ["Nashville", "Memphis"]
    }
]

def get_groq_key():
    return os.environ.get('GROQ_KEY', '').strip()

@quiz_bp.route('/', methods=['POST'])
def get_quiz_result():
    data = request.get_json() or {}
    
    # Get quiz answers from request
    answers = data.get('answers', {})
    budget  = data.get('budget', 'moderate')
    style   = data.get('style', 'mixed')
    group   = data.get('group', 'couple')
    climate = data.get('climate', 'warm')
    activity = data.get('activity', 'sightseeing')

    print(f"[QUIZ] Answers received: {answers}")
    print(f"[QUIZ] Budget: {budget}, Style: {style}"
          f", Climate: {climate}, Activity: {activity}")

    groq_key = get_groq_key()

    if not groq_key:
        print("[QUIZ] No Groq key — using fallback")
        import random
        fallback = random.choice(FALLBACK_POOL)
        fallback["source"] = "fallback"
        return jsonify(fallback)

    # Build answer summary for the prompt
    answer_summary = []
    for q, a in answers.items():
        answer_summary.append(f"- {q}: {a}")
    answers_text = "\n".join(answer_summary) \
        if answer_summary else (
            f"Budget: {budget}, "
            f"Travel style: {style}, "
            f"Group type: {group}, "
            f"Climate preference: {climate}, "
            f"Favourite activity: {activity}"
        )

    prompt = f"""You are an expert USA travel advisor. 
Based on a traveler's quiz answers, recommend the SINGLE BEST US destination.

TRAVELER'S QUIZ ANSWERS:
{answers_text}

Budget level: {budget}
Travel style: {style}
Group type: {group}
Climate preference: {climate}
Favourite activity: {activity}

CRITICAL RULES:
- Pick the MOST SUITABLE destination based on THEIR SPECIFIC ANSWERS
- Do NOT always pick Hawaii or the same destination repeatedly
- Consider diverse destinations: cities, national parks, beaches, mountains, deserts
- Match their exact preferences, not a generic recommendation
- Available destinations: New York City, Los Angeles, Miami, Las Vegas, San Francisco, Hawaii, Grand Canyon, Yellowstone, New Orleans, Nashville, Chicago, Seattle, Yosemite, Sedona, Savannah, Austin, Boston, Washington DC, Napa Valley, Zion, Glacier, Acadia

Respond ONLY with valid JSON. No markdown, no code blocks, just raw JSON.

{{
  "destination": "exact destination name",
  "state": "US state name",
  "emoji": "single relevant emoji",
  "match": number between 85 and 98,
  "tagline": "short catchy tagline under 8 words",
  "why": "2 sentences explaining why this matches their specific answers",
  "highlights": ["4 specific highlights"],
  "budget": "estimated daily budget e.g. $100-200/day",
  "best_time": "best months to visit",
  "vibe": "3 adjectives separated by dots",
  "alternatives": ["2 alternative destinations they might also like"]
}}"""

    try:
        response = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a USA travel expert advisor. "
                            "Always respond with ONLY valid JSON. "
                            "Give genuinely different recommendations based on "
                            "each traveler's actual preferences. "
                            "Never recommend the same destination repeatedly. "
                            "Match their answers precisely."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 700,
                "temperature": 0.9
            },
            timeout=15
        )

        print(f"[QUIZ] Groq status: {response.status_code}")

        if response.status_code != 200:
            raise Exception(f"Groq error: {response.status_code}")

        content = (
            response.json()
            ["choices"][0]
            ["message"]
            ["content"]
            .strip()
        )

        print(f"[QUIZ] Groq raw response: {content[:200]}")

        # Strip any accidental markdown
        if "```" in content:
            parts = content.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("{"):
                    content = part
                    break

        content = content.strip()
        if not content.startswith("{"):
            idx = content.find("{")
            if idx != -1:
                content = content[idx:]

        result = json.loads(content)
        result["source"] = "groq"

        print(f"[QUIZ] Groq recommended: {result.get('destination')}")

        return jsonify(result)

    except json.JSONDecodeError as e:
        print(f"[QUIZ] JSON parse error: {e}")
        print(f"[QUIZ] Raw content was: {content}")
        import random
        fallback = random.choice(FALLBACK_POOL)
        fallback["source"] = "fallback"
        return jsonify(fallback)

    except Exception as e:
        print(f"[QUIZ] Error: {e}")
        import random
        fallback = random.choice(FALLBACK_POOL)
        fallback["source"] = "fallback"
        return jsonify(fallback)
