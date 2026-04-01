"""
AI Tools Routes - Structured AI helpers for the homepage tools section.
"""

import json
import os

from flask import Blueprint, jsonify, request
from groq import Groq

ai_tools_bp = Blueprint('ai_tools', __name__)


def get_groq_client():
    api_key = os.environ.get('GROQ_KEY')
    if not api_key:
        return None
    return Groq(api_key=api_key)


@ai_tools_bp.route('/adventure', methods=['POST'])
def adventure():
    data = request.get_json() or {}
    destination = data.get('destination', '')
    duration = data.get('duration', '5')
    budget = data.get('budget', 'moderate')
    family_type = data.get('family_type', 'mixed ages')

    client = get_groq_client()
    if not client:
        return jsonify({'error': 'Groq API key not configured'}), 500

    user_message = (
        f"Plan family destination recommendations for USA travel. "
        f"Interest/destination preference: {destination}. "
        f"Trip duration: {duration} days. "
        f"Budget level: {budget}. "
        f"Family type: {family_type}."
    )

    completion = client.chat.completions.create(
        model='llama-3.1-8b-instant',
        messages=[
            {
                'role': 'system',
                'content': (
                    'You are a USA family travel expert. Return ONLY a raw JSON array of '
                    'exactly 3 objects. No markdown. No explanation. Each object must have: '
                    'name (string), reason (string, 1 sentence why it suits this family), '
                    'top_activity (string), daily_cost (string, e.g. "$150-$200/day"), '
                    'best_season (string), emoji (string)'
                )
            },
            {'role': 'user', 'content': user_message}
        ],
        temperature=0.7,
        max_tokens=1000,
    )

    try:
        raw = completion.choices[0].message.content.strip()
        raw = raw.replace('```json', '').replace('```', '').strip()
        return jsonify(json.loads(raw))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_tools_bp.route('/roadtrip', methods=['POST'])
def roadtrip():
    data = request.get_json() or {}
    start = data.get('start', '')
    end = data.get('end', '')
    days = data.get('days', '5')
    style = data.get('style', 'scenic')

    client = get_groq_client()
    if not client:
        return jsonify({'error': 'Groq API key not configured'}), 500

    user_message = (
        f"Build a USA road trip from {start} to {end}. "
        f"Duration: {days} days. "
        f"Travel style: {style}."
    )

    completion = client.chat.completions.create(
        model='llama-3.1-8b-instant',
        messages=[
            {
                'role': 'system',
                'content': (
                    'You are a USA road trip expert. Return ONLY a raw JSON object with: '
                    'route_name (string), total_miles (string), days (array of objects). '
                    'Each day object must have: day (number), stop (string), '
                    'highlight (string), drive_time (string, e.g. "2.5 hrs from last stop"), '
                    'eat (string, one food recommendation), do (string, one activity). '
                    'No markdown. Raw JSON only.'
                )
            },
            {'role': 'user', 'content': user_message}
        ],
        temperature=0.7,
        max_tokens=1200,
    )

    try:
        raw = completion.choices[0].message.content.strip()
        raw = raw.replace('```json', '').replace('```', '').strip()
        return jsonify(json.loads(raw))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_tools_bp.route('/views', methods=['POST'])
def views():
    data = request.get_json() or {}
    region = data.get('region', 'West')
    view_type = data.get('type', 'mountains')
    season = data.get('season', 'summer')

    client = get_groq_client()
    if not client:
        return jsonify({'error': 'Groq API key not configured'}), 500

    user_message = (
        f"Find scenic USA locations for region: {region}. "
        f"View type: {view_type}. "
        f"Season: {season}."
    )

    completion = client.chat.completions.create(
        model='llama-3.1-8b-instant',
        messages=[
            {
                'role': 'system',
                'content': (
                    'You are a USA scenic travel expert. Return ONLY a raw JSON array of '
                    'exactly 4 objects. No markdown. Each object must have: '
                    'name (string), description (string, 2 sentences), '
                    'photo_spot (string, specific location to stand for best photo), '
                    'nearby_town (string), accessibility (string: Easy/Moderate/Difficult), '
                    'emoji (string)'
                )
            },
            {'role': 'user', 'content': user_message}
        ],
        temperature=0.7,
        max_tokens=1000,
    )

    try:
        raw = completion.choices[0].message.content.strip()
        raw = raw.replace('```json', '').replace('```', '').strip()
        return jsonify(json.loads(raw))
    except Exception as e:
        return jsonify({'error': str(e)}), 500
