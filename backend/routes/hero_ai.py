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
    
    Returns array of destination suggestions:
    [
      {
        "name": "Destination Name",
        "emoji": "📍",
        "tagline": "One-line description",
        "description": "Two-sentence description"
      },
      ...
    ]
    """
    try:
        data = request.get_json() or {}
        user_prompt = data.get('prompt', 'Find the best US destinations')
        
        client = get_groq_client()
        if not client:
            return jsonify({'error': 'Groq API key not configured'}), 500
        
        # Call Groq API
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a USA travel expert. Given a traveler's interest, "
                        "recommend 3-4 specific US destinations. For each, give: name, "
                        "one-line tagline, and 2-sentence description. Respond ONLY in "
                        "JSON array format: "
                        '[{"name":"...","tagline":"...","description":"...","emoji":"..."}] '
                        "No markdown, no code blocks, raw JSON array only."
                    )
                },
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        
        raw = completion.choices[0].message.content.strip()
        
        # Parse JSON response
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
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
                    "name": "Yellowstone",
                    "emoji": "🦌",
                    "tagline": "Geysers, wildlife, and adventure",
                    "description": "Explore America's first national park with dramatic canyons, colorful hot springs, and abundant wildlife. Perfect for nature lovers and photographers."
                }
            ])
        
        # Call Groq API with system prompt
        system_prompt = """You are a USA travel expert. Given a traveler's interest, recommend 3-4 specific US destinations or experiences. 

For each recommendation, provide in JSON format ONLY (no markdown, no explanation):
[
  {
    "name": "Destination Name",
    "emoji": "appropriate emoji",
    "tagline": "one-line tagline",
    "description": "two-sentence description highlighting key attractions"
  }
]

Return ONLY valid JSON array, nothing else."""

        message = user_prompt

        completion = client.messages.create(
            model="llama-3.1-8b-instant",
            max_tokens=1024,
            system=system_prompt,
            messages=[
                {"role": "user", "content": message}
            ]
        )
        
        # Extract response text
        response_text = completion.content[0].text.strip()
        
        # Try to parse JSON from response
        try:
            # Try direct JSON parse first
            results = json.loads(response_text)
            if isinstance(results, list):
                return jsonify(results)
        except json.JSONDecodeError:
            # Try to extract JSON from response if it has markdown wrapping
            import re
            json_match = re.search(r'\[[\s\S]*\]', response_text)
            if json_match:
                try:
                    results = json.loads(json_match.group())
                    if isinstance(results, list):
                        return jsonify(results)
                except json.JSONDecodeError:
                    pass
        
        # If parsing fails, return structured fallback
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
                "name": "Yellowstone",
                "emoji": "🦌",
                "tagline": "Geysers, wildlife, and adventure",
                "description": "Explore America's first national park with dramatic canyons, colorful hot springs, and abundant wildlife. Perfect for nature lovers and photographers."
            }
        ])
        
    except Exception as e:
        print(f"Hero AI Route Error: {str(e)}")
        # Return fallback recommendations on error
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
