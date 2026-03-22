"""
Weather Route - OpenWeatherMap API Integration
"""
from flask import Blueprint, request, jsonify
import requests
import os
from cachetools import TTLCache
from datetime import datetime

weather_bp = Blueprint('weather', __name__)
weather_cache = TTLCache(maxsize=100, ttl=600)  # Cache for 10 minutes

# Emoji mapping for weather conditions
WEATHER_EMOJIS = {
    800: "☀️",      # Clear sky
    801: "🌤️",      # Few clouds
    802: "⛅",      # Scattered clouds
    803: "☁️",      # Broken clouds
    804: "☁️",      # Overcast
    500: "🌧️", 501: "🌧️", 502: "🌧️", 503: "🌧️", 504: "🌧️",  # Rain
    511: "🌨️",      # Freezing rain
    200: "⛈️", 201: "⛈️", 202: "⛈️",  # Thunderstorm
    210: "⛈️", 211: "⛈️", 212: "⛈️", 221: "⛈️",
    230: "⛈️", 231: "⛈️", 232: "⛈️",
    600: "❄️", 601: "❄️", 602: "❄️", 613: "❄️",  # Snow
    615: "❄️", 616: "❄️", 620: "❄️", 621: "❄️", 622: "❄️",
}

@weather_bp.route('/', methods=['GET'])
def get_weather():
    city = request.args.get('city', '').strip()
    if not city:
        return jsonify({"error": "City name required"}), 400

    key = os.environ.get('OPENWEATHER_KEY')
    if not key:
        return jsonify({"error": "API not configured"}), 503

    try:
        # Current weather
        url = f"https://api.openweathermap.org/data/2.5/weather"
        params = {"q": city, "appid": key, "units": "metric"}
        print(f"[WEATHER] Calling: {url} with city={city}")
        
        response = requests.get(url, params=params, timeout=10)
        print(f"[WEATHER] Status code: {response.status_code}")
        print(f"[WEATHER] Response: {response.text[:300]}")
        
        if response.status_code == 401:
            return jsonify({"error": "Invalid API key"}), 401
        if response.status_code == 404:
            return jsonify({"error": "City not found"}), 404
        if response.status_code != 200:
            return jsonify({"error": f"Weather API error: {response.status_code}"}), 500
        
        data = response.json()

        # Map condition code to emoji
        code = data["weather"][0]["id"]
        if code == 800:
            icon = "☀️"
        elif 801 <= code <= 804:
            icon = "⛅"
        elif 500 <= code <= 531:
            icon = "🌧️"
        elif 200 <= code <= 232:
            icon = "⛈️"
        elif 600 <= code <= 622:
            icon = "❄️"
        elif 700 <= code <= 781:
            icon = "🌫️"
        else:
            icon = "🌤️"

        # 5-day forecast
        forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
        forecast_res = requests.get(forecast_url, params=params, timeout=10)
        forecast_data = forecast_res.json()
        
        days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
        forecast = []
        seen = set()
        for item in forecast_data.get("list", []):
            date = item["dt_txt"].split(" ")[0]
            if date not in seen and len(forecast) < 5:
                seen.add(date)
                day_code = item["weather"][0]["id"]
                if day_code == 800:
                    day_icon = "☀️"
                elif 500 <= day_code <= 531:
                    day_icon = "🌧️"
                elif 200 <= day_code <= 232:
                    day_icon = "⛈️"
                else:
                    day_icon = "⛅"
                d = datetime.strptime(date, "%Y-%m-%d")
                forecast.append({
                    "d": days[d.weekday()],
                    "i": day_icon,
                    "t": f"{round(item['main']['temp'])}°"
                })

        return jsonify({
            "temp":      round(data["main"]["temp"]),
            "feels":     round(data["main"]["feels_like"]),
            "humidity":  data["main"]["humidity"],
            "wind":      round(data["wind"]["speed"]),
            "condition": data["weather"][0]["description"].title(),
            "icon":      icon,
            "forecast":  forecast
        })

    except requests.exceptions.ConnectionError:
        print("[WEATHER] Connection error - no internet?")
        return jsonify({"error": "Connection failed"}), 503
    except requests.exceptions.Timeout:
        print("[WEATHER] Request timed out")
        return jsonify({"error": "Request timed out"}), 503
    except Exception as e:
        print(f"[WEATHER] Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"[ERROR] weather route: {str(e)}")
        return jsonify({"error": str(e)}), 500
