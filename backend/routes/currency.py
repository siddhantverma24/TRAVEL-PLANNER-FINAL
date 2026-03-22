import os
import requests
from flask import Blueprint, jsonify, request
from datetime import datetime

currency_bp = Blueprint('currency', __name__)

# Simple in-memory cache
_cache = {"data": None, "timestamp": None}
CACHE_SECONDS = 3600  # 1 hour

SUPPORTED = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "INR", "CHF"]

@currency_bp.route('/', methods=['GET'])
def get_currency():
    base = request.args.get('base', 'USD').upper()
    key = os.environ.get('EXCHANGE_KEY', '').strip().strip('"').strip("'")

    if not key:
        return jsonify({
            "base": base,
            "rates": _fallback(base),
            "cached": True,
            "warning": "API not configured"
        })

    # Return cached data if fresh
    now = datetime.utcnow()
    if _cache["data"] and _cache["timestamp"]:
        diff = (now - _cache["timestamp"]).total_seconds()
        if diff < CACHE_SECONDS:
            print(f"[CURRENCY] Returning cached rates (age: {int(diff)}s)")
            return jsonify(_cache["data"])

    try:
        print(f"[CURRENCY] Key length: {len(key)}")
        print(f"[CURRENCY] Key preview: {key[:6]}...{key[-4:]}")
        url = f"https://v6.exchangerate-api.com/v6/{key}/latest/{base}"
        print(f"[CURRENCY] Full URL: {url}")
        
        res = requests.get(url, timeout=10)
        print(f"[CURRENCY] Status: {res.status_code}")
        print(f"[CURRENCY] Full response: {res.text}")
        
        if res.status_code != 200:
            raise Exception(f"API returned {res.status_code}: {res.text}")

        data = res.json()
        print(f"[CURRENCY] Result: {data.get('result')}")

        if data.get("result") != "success":
            raise Exception(f"API error: {data.get('error-type', 'unknown')}")

        # API returns rates in "conversion_rates" key
        all_rates = data["conversion_rates"]

        # Filter to only the 8 currencies the frontend uses
        filtered = {k: all_rates[k] for k in SUPPORTED if k in all_rates}

        response = {
            "base": base,
            "rates": filtered,
            "lastUpdated": datetime.utcnow().isoformat(),
            "cached": False
        }

        # Save to cache
        _cache["data"] = response
        _cache["timestamp"] = now

        return jsonify(response)

    except Exception as e:
        print(f"[CURRENCY] Error: {str(e)} — using fallback rates")
        return jsonify({
            "base": base,
            "rates": _fallback(base),
            "cached": True,
            "warning": f"Using fallback rates: {str(e)}"
        })

def _fallback(base):
    rates = {
        "USD": 1.0,
        "EUR": 0.924,
        "GBP": 0.793,
        "JPY": 149.82,
        "AUD": 1.531,
        "CAD": 1.362,
        "INR": 83.18,
        "CHF": 0.883
    }
    if base == "USD":
        return rates
    # Convert to requested base
    base_rate = rates.get(base, 1)
    return {k: round(v / base_rate, 4) for k, v in rates.items()}
