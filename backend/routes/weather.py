from flask import Blueprint, request, jsonify
import requests
import os
from dotenv import load_dotenv


# --------------------------------------------------
# Load .env from the backend folder
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)


# --------------------------------------------------
# Flask Blueprint
# --------------------------------------------------

weather_bp = Blueprint("weather", __name__)


# --------------------------------------------------
# OpenWeather API configuration
# --------------------------------------------------

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


# --------------------------------------------------
# Disease spread risk calculation
# --------------------------------------------------

def calculate_spread_risk(temp_c, humidity, weather_main):
    """
    Simple rule-based risk model for disease spread likelihood.

    Higher humidity, suitable temperature,
    and rainy/misty conditions increase risk.
    """

    risk_score = 0

    # Humidity
    if humidity >= 80:
        risk_score += 3
    elif humidity >= 60:
        risk_score += 2
    elif humidity >= 40:
        risk_score += 1

    # Temperature
    if 20 <= temp_c <= 30:
        risk_score += 2
    elif 15 <= temp_c < 20 or 30 < temp_c <= 35:
        risk_score += 1

    # Rain / moisture
    if weather_main in [
        "Rain",
        "Drizzle",
        "Thunderstorm",
        "Mist"
    ]:
        risk_score += 2

    # Final risk
    if risk_score >= 6:
        return "High"
    elif risk_score >= 3:
        return "Medium"
    else:
        return "Low"


# --------------------------------------------------
# Weather API route
# --------------------------------------------------

@weather_bp.route("/weather", methods=["GET"])
def get_weather():

    lat = request.args.get("lat")
    lon = request.args.get("lon")
    city = request.args.get("city")

    # Check API key
    if not OPENWEATHER_API_KEY:
        return jsonify({
            "error": "Weather API key not configured on server"
        }), 500

    # API parameters
    params = {
        "appid": OPENWEATHER_API_KEY,
        "units": "metric"
    }

    # Location by coordinates
    if lat and lon:
        params["lat"] = lat
        params["lon"] = lon

    # Location by city
    elif city:
        params["q"] = city

    else:
        return jsonify({
            "error": "Provide either lat/lon or city query params"
        }), 400

    # Request weather data
    try:
        response = requests.get(
            OPENWEATHER_URL,
            params=params,
            timeout=10
        )

    except requests.RequestException as e:
        return jsonify({
            "error": "Unable to connect to weather service",
            "details": str(e)
        }), 502

    # OpenWeather API error
    if response.status_code != 200:

        try:
            details = response.json()
        except ValueError:
            details = response.text

        return jsonify({
            "error": "Failed to fetch weather data",
            "details": details
        }), response.status_code

    # Parse response
    data = response.json()

    # Extract weather information
    temp_c = data["main"]["temp"]
    humidity = data["main"]["humidity"]

    weather_main = data["weather"][0]["main"]
    weather_desc = data["weather"][0]["description"]

    location_name = data.get("name", "Unknown")

    # Calculate disease spread risk
    risk = calculate_spread_risk(
        temp_c,
        humidity,
        weather_main
    )

    # Return response
    return jsonify({
        "location": location_name,
        "temperature_c": temp_c,
        "humidity": humidity,
        "weather": weather_main,
        "description": weather_desc,
        "disease_spread_risk": risk
    })