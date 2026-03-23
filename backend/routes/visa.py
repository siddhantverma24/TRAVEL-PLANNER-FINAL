"""
Visa Route - Groq AI Powered Visa Checker
Gets real detailed visa information for any passport + destination combination
"""
import os
import json
from flask import Blueprint, request, jsonify
from groq import Groq
from functools import lru_cache
from datetime import datetime, timedelta

visa_bp = Blueprint('visa', __name__)

# Initialize Groq client
groq_api_key = os.getenv('GROQ_KEY')
groq = Groq(api_key=groq_api_key) if groq_api_key else None

# Health check route
@visa_bp.route('/ping', methods=['GET'])
def ping():
    """Health check endpoint for visa API"""
    return jsonify({
        "status": "ok",
        "message": "Visa API is working",
        "groq_configured": groq is not None
    })

# Simple cache implementation with 24-hour TTL
class CachedResponse:
    def __init__(self, data, timestamp):
        self.data = data
        self.timestamp = timestamp
    
    def is_expired(self):
        return datetime.now() - self.timestamp > timedelta(hours=24)

visa_cache = {}

# Fallback visa data for 3 key routes (when API unavailable)
FALLBACK_DATA = {
    "IN->US": {
        "status": "VISA REQUIRED",
        "label": "Non-Immigrant Visa (B1/B2)",
        "duration": "Up to 10 years",
        "processing": "7-14 business days",
        "cost": "$160-260 USD",
        "requirements": [
            "Valid passport (10 years validity)",
            "Completed DS-160 form",
            "Passport photo",
            "Interview at US embassy",
            "Proof of financial means",
            "Return ticket or itinerary"
        ],
        "insider_tips": [
            "Book interview slots early as they fill up quickly",
            "Bring original documents to interview",
            "Have at least $500-1000 as proof of funds",
            "Common NON reason: insufficient ties to home country"
        ],
        "official_apply_link": "https://travel.state.gov/content/dam/visas/Visa-Reciprocity-by-Country.html"
    },
    "US->JP": {
        "status": "VISA FREE",
        "label": "Temporary Visitor",
        "duration": "90 days maximum",
        "processing": "Automatic on arrival",
        "cost": "$0 USD",
        "requirements": [
            "Valid passport (at least 6 months validity)",
            "Return ticket",
            "Proof of funds for stay"
        ],
        "insider_tips": [
            "Get the stamp at immigration on arrival",
            "Bring enough cash, not all places accept cards",
            "Register at your embassy if staying 90+ days",
            "Extend visa at immigration office before 90 days expire"
        ],
        "official_apply_link": "https://www.us.emb-japan.go.jp/en/"
    },
    "IN->IN": {
        "status": "DOMESTIC",
        "label": "No visa required",
        "duration": "N/A",
        "processing": "N/A",
        "cost": "$0",
        "requirements": ["Valid ID"],
        "insider_tips": ["Use Aadhar or Passport for identification"],
        "official_apply_link": "https://www.india.gov.in/"
    }
}

def get_visa_info_from_groq(from_country, to_country, from_name, to_name):
    """Get visa information from Groq AI"""
    try:
        prompt = f"""Provide detailed visa requirements for a {from_name} passport holder traveling to {to_name}.
        
Return JSON with this exact structure (no markdown, just JSON):
{{
  "status": "VISA FREE" or "VISA REQUIRED" or "ON ARRIVAL" or "EVISA",
  "label": "Brief visa type description",
  "duration": "How long you can stay (e.g., '30 days', '90 days in 180 days', etc.)",
  "processing": "Processing time (e.g., '24 hours', '3-5 days', 'Automatic')",
  "cost": "Cost in USD or local equivalent (e.g., '$20 USD', '€80', 'Free')",
  "requirements": ["List of actual documents needed"],
  "insider_tips": ["3-4 practical tips from experience", "What often gets people denied", "Hidden costs or gotchas", "Pro tips"],
  "official_apply_link": "URL to official government page"
}}

Be accurate and specific. Include realistic insider tips."""
        
        message = groq.messages.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000
        )
        
        response_text = message.content[0].text.strip()
        # Clean markdown if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        visa_data = json.loads(response_text)
        return visa_data
        
    except Exception as e:
        print(f"[ERROR] Groq API call failed: {str(e)}")
        return None

@visa_bp.route('/', methods=['GET'])
def check_visa():
    try:
        from_code = request.args.get('from', '').upper()
        to_code = request.args.get('to', '').upper()
        from_name = request.args.get('from_name', from_code)
        to_name = request.args.get('to_name', to_code)
        
        if not (from_code and to_code):
            return jsonify({"error": "from and to parameters required"}), 400
        
        # Check cache first
        cache_key = f"{from_code}->{to_code}"
        if cache_key in visa_cache:
            cached = visa_cache[cache_key]
            if not cached.is_expired():
                return jsonify(cached.data), 200
        
        # Try Groq API
        visa_data = None
        if groq:
            visa_data = get_visa_info_from_groq(from_code, to_code, from_name, to_name)
        
        # Fallback to hardcoded data if API fails or not available
        if not visa_data and cache_key in FALLBACK_DATA:
            visa_data = FALLBACK_DATA[cache_key]
        
        if visa_data:
            # Cache the result
            visa_cache[cache_key] = CachedResponse(visa_data, datetime.now())
            return jsonify(visa_data), 200
        
        # No data available
        return jsonify({"error": "Visa information not available for this country pair"}), 404
        
    except json.JSONDecodeError as e:
        print(f"[ERROR] Failed to parse Groq response: {str(e)}")
        return jsonify({"error": "Failed to process visa information"}), 500
    except Exception as e:
        print(f"[ERROR] visa route: {str(e)}")
        return jsonify({"error": str(e)}), 500
