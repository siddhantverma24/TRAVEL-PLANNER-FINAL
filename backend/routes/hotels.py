import os
import requests
from flask import Blueprint, jsonify, request
from cachetools import TTLCache
from datetime import datetime, date

hotels_bp = Blueprint('hotels', __name__)

# Cache hotel searches for 30 minutes
_cache = TTLCache(maxsize=50, ttl=1800)

RAPIDAPI_HOST = "hotels-com-provider.p.rapidapi.com"
RAPIDAPI_BASE = "https://hotels-com-provider.p.rapidapi.com/v2"

# Groq API for city correction
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

# Fallback hotels if API unavailable
FALLBACK_HOTELS = [
    {
        "name": "The Grand Hyatt",
        "stars": 5,
        "rating": 9.2,
        "reviews": 1847,
        "pricePerNight": 380,
        "totalPrice": 1520,
        "image": "https://placehold.co/400x200/44355b/ffffff?text=Grand+Hyatt",
        "location": "City Center",
        "amenities": "Free WiFi · Pool · Spa · Restaurant",
        "source": "fallback"
    },
    {
        "name": "Marriott Downtown",
        "stars": 4,
        "rating": 8.7,
        "reviews": 2341,
        "pricePerNight": 220,
        "totalPrice": 880,
        "image": "https://placehold.co/400x200/44355b/ffffff?text=Marriott",
        "location": "Downtown District",
        "amenities": "Free WiFi · Gym · Business Center",
        "source": "fallback"
    },
    {
        "name": "Boutique & Co",
        "stars": 4,
        "rating": 8.9,
        "reviews": 956,
        "pricePerNight": 195,
        "totalPrice": 780,
        "image": "https://placehold.co/400x200/44355b/ffffff?text=Boutique+Hotel",
        "location": "Arts District",
        "amenities": "Free WiFi · Rooftop Bar · Concierge",
        "source": "fallback"
    },
    {
        "name": "The Westin Premier",
        "stars": 5,
        "rating": 9.4,
        "reviews": 3102,
        "pricePerNight": 450,
        "totalPrice": 1800,
        "image": "https://placehold.co/400x200/44355b/ffffff?text=Westin",
        "location": "Waterfront",
        "amenities": "Free WiFi · Pool · Spa · Fine Dining",
        "source": "fallback"
    },
    {
        "name": "Holiday Inn Express",
        "stars": 3,
        "rating": 7.8,
        "reviews": 4521,
        "pricePerNight": 110,
        "totalPrice": 440,
        "image": "https://placehold.co/400x200/44355b/ffffff?text=Holiday+Inn",
        "location": "Near Airport",
        "amenities": "Free WiFi · Free Breakfast · Parking",
        "source": "fallback"
    }
]

def get_headers():
    key = os.environ.get('RAPIDAPI_KEY', '').strip()
    return {
        "X-RapidAPI-Key":  key,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "Content-Type":    "application/json"
    }

def get_key():
    return os.environ.get('RAPIDAPI_KEY', '').strip()

def get_groq_key():
    return os.environ.get('GROQ_KEY', '').strip()

def correct_city_name(city):
    """Use Groq to correct or validate city name"""
    groq_key = get_groq_key()
    if not groq_key:
        print(f"[HOTELS] No Groq key — using '{city}' as-is")
        return city
    
    try:
        payload = {
            "model": "mixtral-8x7b-32768",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a city name expert. Given a city name (possibly misspelled or informal), return ONLY the correct official city name. If it's already correct, return it unchanged. Reply with ONLY the city name, nothing else."
                },
                {
                    "role": "user",
                    "content": f"Correct this city name: {city}"
                }
            ],
            "temperature": 0.3,
            "max_tokens": 50
        }
        
        res = requests.post(
            GROQ_ENDPOINT,
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=5
        )
        
        if res.status_code == 200:
            data = res.json()
            corrected = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("content", city)
                .strip()
            )
            print(f"[HOTELS] City correction: '{city}' → '{corrected}'")
            return corrected
        else:
            print(f"[HOTELS] Groq error {res.status_code} — using '{city}'")
            return city
            
    except Exception as e:
        print(f"[HOTELS] Groq exception: {str(e)} — using '{city}'")
        return city

@hotels_bp.route('/', methods=['GET'])
def search_hotels():
    city     = request.args.get('city', 'New York').strip()
    checkin  = request.args.get('checkin', '')
    checkout = request.args.get('checkout', '')
    guests   = request.args.get('guests', '2')
    stars    = request.args.get('stars', 'any')

    print(f"[HOTELS] Raw input: '{city}'")
    
    # Correct city name using Groq
    city = correct_city_name(city)

    print(f"[HOTELS] Searching: {city} | "
          f"{checkin} to {checkout} | "
          f"{guests} guests")

    key = get_key()
    if not key:
        print("[HOTELS] No API key — using fallback")
        return jsonify({
            "hotels":  _apply_star_filter(
                FALLBACK_HOTELS, stars),
            "nights":  _calc_nights(checkin, checkout),
            "city":    city,
            "source":  "fallback",
            "warning": "Add RAPIDAPI_KEY to .env"
        })

    # Check cache
    cache_key = f"{city}_{checkin}_{checkout}_{guests}"
    if cache_key in _cache:
        print(f"[HOTELS] Returning cached results for {city}")
        cached = _cache[cache_key].copy()
        cached["cached"] = True
        return jsonify(cached)

    try:
        # Step 1: Get region/destination ID
        region_id = get_region_id(city, key)
        
        if not region_id:
            print(f"[HOTELS] Could not find region for {city}")
            return jsonify({
                "hotels":  _apply_star_filter(
                    FALLBACK_HOTELS, stars),
                "nights":  _calc_nights(checkin, checkout),
                "city":    city,
                "source":  "fallback",
                "warning": f"Region not found for {city}"
            })

        print(f"[HOTELS] Region ID for {city}: {region_id}")

        # Step 2: Search hotels
        nights = _calc_nights(checkin, checkout)
        
        params = {
            "region_id":      region_id,
            "locale":         "en_US",
            "checkin_date":   checkin  or str(date.today()),
            "checkout_date":  checkout or str(date.today()),
            "adults_number":  guests,
            "sort_order":     "REVIEW",
            "page_number":    "1",
            "currency":       "USD",
            "available_filter": "SHOW_AVAILABLE_ONLY"
        }

        print(f"[HOTELS] Calling Hotels API with params: {params}")

        res = requests.get(
            f"{RAPIDAPI_BASE}/hotels/search",
            headers=get_headers(),
            params=params,
            timeout=15
        )

        print(f"[HOTELS] Status: {res.status_code}")

        if res.status_code == 401:
            return jsonify({
                "hotels":  _apply_star_filter(
                    FALLBACK_HOTELS, stars),
                "nights":  nights,
                "city":    city,
                "source":  "fallback",
                "warning": "Invalid RapidAPI key"
            })

        if res.status_code == 429:
            print("[HOTELS] Rate limit hit")
            return jsonify({
                "hotels":  _apply_star_filter(
                    FALLBACK_HOTELS, stars),
                "nights":  nights,
                "city":    city,
                "source":  "fallback",
                "warning": "Rate limit reached"
            })

        if res.status_code != 200:
            raise Exception(
                f"API returned {res.status_code}"
            )

        data = res.json()
        properties = data.get(
            "properties", []
        ) or data.get("results", [])

        print(f"[HOTELS] Found {len(properties)} properties")

        if not properties:
            return jsonify({
                "hotels":  _apply_star_filter(
                    FALLBACK_HOTELS, stars),
                "nights":  nights,
                "city":    city,
                "source":  "fallback",
                "warning": "No hotels found for dates"
            })

        # Map response to our shape
        hotels = []
        for p in properties[:10]:
            try:
                # Get price
                price_info = (
                    p.get("ratePlan", {})
                    .get("price", {})
                )
                per_night = (
                    price_info.get("lead", {})
                    .get("amount", 0)
                )
                if not per_night:
                    per_night = (
                        price_info.get(
                            "exactCurrent", 0
                        )
                    )

                # Get star rating
                star_rating = int(
                    p.get("star", 0) or 
                    p.get("starRating", 0) or 
                    3
                )

                # Get guest rating
                guest_rating = (
                    p.get("guestReviews", {})
                    .get("unformattedRating", 0)
                )
                review_count = (
                    p.get("guestReviews", {})
                    .get("total", "")
                )

                # Get image
                image_url = (
                    p.get("optimizedThumbUrls", {})
                    .get("srpDesktop", "")
                )
                if not image_url:
                    image_url = (
                        p.get("thumbnailUrl", "") or
                        f"https://placehold.co/400x200/"
                        f"44355b/ffffff?text="
                        f"{p.get('name', 'Hotel').replace(' ', '+')}"
                    )

                # Get amenities
                amenities_list = p.get(
                    "amenities", []
                ) or []
                if isinstance(amenities_list, list):
                    amenities_str = " · ".join(
                        amenities_list[:3]
                    ) if amenities_list else (
                        "Free WiFi · Air conditioning"
                    )
                else:
                    amenities_str = "Free WiFi · Air conditioning"

                hotel = {
                    "name":         p.get(
                        "name", "Hotel"
                    ),
                    "stars":        star_rating,
                    "rating":       round(
                        float(guest_rating or 0), 1
                    ),
                    "reviews":      review_count,
                    "pricePerNight": round(
                        float(per_night or 0)
                    ),
                    "totalPrice":   round(
                        float(per_night or 0) * nights
                    ),
                    "nights":       nights,
                    "image":        image_url,
                    "location":     (
                        p.get("neighbourhood", "") or
                        p.get("address", {})
                        .get("streetAddress", "") or
                        city
                    ),
                    "amenities":    amenities_str,
                    "hotelId":      str(p.get("id", "")),
                    "source":       "live"
                }
                hotels.append(hotel)

            except Exception as map_err:
                print(f"[HOTELS] Map error: {map_err}")
                continue

        if not hotels:
            return jsonify({
                "hotels":  _apply_star_filter(
                    FALLBACK_HOTELS, stars),
                "nights":  nights,
                "city":    city,
                "source":  "fallback",
                "warning": "Could not parse hotel data"
            })

        # Apply star filter
        filtered = _apply_star_filter(hotels, stars)

        result = {
            "hotels": filtered,
            "nights": nights,
            "city":   city,
            "total":  len(hotels),
            "source": "live"
        }

        # Cache the result
        _cache[cache_key] = result
        print(f"[HOTELS] Returning {len(filtered)} hotels")

        return jsonify(result)

    except Exception as e:
        print(f"[HOTELS] Error: {str(e)}")
        return jsonify({
            "hotels":  _apply_star_filter(
                FALLBACK_HOTELS, stars),
            "nights":  _calc_nights(checkin, checkout),
            "city":    city,
            "source":  "fallback",
            "warning": str(e)
        })


def get_region_id(city, key):
    try:
        res = requests.get(
            f"{RAPIDAPI_BASE}/regions",
            headers={
                "X-RapidAPI-Key":  key,
                "X-RapidAPI-Host": RAPIDAPI_HOST
            },
            params={
                "query":  city,
                "locale": "en_US"
            },
            timeout=10
        )
        print(f"[HOTELS] Region search status: "
              f"{res.status_code}")

        if res.status_code != 200:
            return None

        data = res.json()
        regions = (
            data.get("data", []) or 
            data.get("suggestions", [])
        )

        # Look for CITY type first
        for r in regions:
            entities = r.get("entities", [r])
            for entity in entities:
                if entity.get("type") in (
                    "CITY", "city", "NEIGHBORHOOD"
                ):
                    region_id = (
                        entity.get("gaiaId") or 
                        entity.get("destinationId") or
                        entity.get("id")
                    )
                    if region_id:
                        return str(region_id)

        # Fall back to first result
        if regions:
            first = regions[0]
            entities = first.get("entities", [first])
            if entities:
                region_id = (
                    entities[0].get("gaiaId") or
                    entities[0].get("destinationId") or
                    entities[0].get("id")
                )
                if region_id:
                    return str(region_id)

        return None

    except Exception as e:
        print(f"[HOTELS] Region search error: {str(e)}")
        return None


def _calc_nights(checkin, checkout):
    try:
        ci = datetime.strptime(checkin, "%Y-%m-%d")
        co = datetime.strptime(checkout, "%Y-%m-%d")
        return max(1, (co - ci).days)
    except Exception:
        return 1


def _apply_star_filter(hotels, stars):
    if stars == "any":
        return hotels
    try:
        min_stars = int(stars)
        return [
            h for h in hotels 
            if h.get("stars", 0) >= min_stars
        ]
    except Exception:
        return hotels
