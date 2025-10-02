import requests
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class WeatherService:
    GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
    FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
    
    @staticmethod
    def geocode(place):
        cache_key = f"geocode_{place.lower()}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        try:
            response = requests.get(
                WeatherService.GEOCODING_URL,
                params={"name": place, "count": 1, "language": "en", "format": "json"},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if not data.get("results"):
                return None
            
            result = data["results"][0]
            geocode_data = {
                "latitude": result["latitude"],
                "longitude": result["longitude"],
                "name": result["name"],
                "admin1": result.get("admin1", ""),
                "country": result.get("country", "")
            }
            
            cache.set(cache_key, geocode_data, 3600)
            return geocode_data
        except Exception as e:
            logger.error(f"Geocoding error: {str(e)}")
            return None
    
    @staticmethod
    def get_forecast(latitude, longitude, timezone="auto"):
        cache_key = f"forecast_{latitude}_{longitude}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        try:
            response = requests.get(
                WeatherService.FORECAST_URL,
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "timezone": timezone,
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,sunrise,sunset",
                    "forecast_days": 3
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            cache.set(cache_key, data, 600)
            return data
        except Exception as e:
            logger.error(f"Forecast error: {str(e)}")
            return None
    
    @staticmethod
    def build_summary(forecast_data, lang='en'):
        if not forecast_data or "daily" not in forecast_data:
            return "Weather data unavailable" if lang == 'en' else "天気データが利用できません"
        
        daily = forecast_data["daily"]
        
        temp_max = daily["temperature_2m_max"][0]
        temp_min = daily["temperature_2m_min"][0]
        precip = daily["precipitation_sum"][0]
        uv = daily["uv_index_max"][0]
        sunrise = daily["sunrise"][0].split("T")[1] if daily.get("sunrise") else "N/A"
        sunset = daily["sunset"][0].split("T")[1] if daily.get("sunset") else "N/A"
        
        if lang == 'ja':
            summary = f"今日: {temp_max}°/{temp_min}°C、降水量: {precip}mm、UV: {uv}、日の出: {sunrise}、日の入り: {sunset}"
        else:
            summary = f"Today: {temp_max}°/{temp_min}°C, Precip: {precip}mm, UV: {uv}, Sunrise: {sunrise}, Sunset: {sunset}"
        return summary


class SuggestionService:
    PERSONA_PROMPTS = {
        "outings": {
            "en": "You are a helpful assistant specializing in local activities and outings lasting 2-4 hours. Focus on practical, budget-friendly recommendations.",
            "ja": "あなたは2〜4時間の地元のアクティビティや外出に特化した親切なアシスタントです。実用的で予算に優しい推奨事項に焦点を当ててください。"
        },
        "travel": {
            "en": "You are a helpful assistant specializing in day trips and overnight travel. Include transport hints and booking considerations.",
            "ja": "あなたは日帰り旅行や宿泊旅行に特化した親切なアシスタントです。交通手段のヒントや予約の考慮事項を含めてください。"
        },
        "fashion": {
            "en": "You are a helpful assistant specializing in weather-appropriate fashion and outfit recommendations. Focus on layers, shoes, accessories, and weather protection.",
            "ja": "あなたは天候に適したファッションと服装の推奨に特化した親切なアシスタントです。レイヤー、靴、アクセサリー、天候保護に焦点を当ててください。"
        }
    }
    @staticmethod
    def generate_suggestions(query, place=None, weather_summary=None, persona=None, output_lang="en"):
        # Only Gemini is supported now
        return SuggestionService.generate_suggestions_gemini(query, place, weather_summary, persona, output_lang)

    @staticmethod
    def generate_suggestions_gemini(query, place, weather_summary, persona, output_lang):
        import os
        try:
            from google import genai
        except ImportError:
            return {"error": "google-genai SDK not installed"}

        api_key = os.getenv('GEMINI_API_KEY', getattr(settings, 'GEMINI_API_KEY', None))
        if not api_key:
            return {"error": "Gemini API key not configured"}

        client = genai.Client(api_key=api_key)

        if output_lang == "ja":
            user_prompt = f"""場所: {place}\n天気の概要: {weather_summary}\nクエリ: {query}\n\n上記の情報に基づいて、正確に3つの提案を番号付きリストとして提供してください。各提案には以下を含めてください：\n1) 概要（1文）\n2) ステップ\n3) 持ち物\n4) 注意事項\n\n簡潔で実用的な内容にしてください。"""
        else:
            user_prompt = f"""Place: {place}\nWeather summary: {weather_summary}\nQuery: {query}\n\nBased on the information above, provide exactly 3 suggestions as a numbered list. For each suggestion, include:\n1) Summary (one sentence)\n2) Steps\n3) Items to bring\n4) Cautions\n\nKeep it concise and practical."""

        try:
            response = client.models.generate_content(
            model="models/gemini-2.5-pro",  # or "models/gemini-2.5-flash"
            contents=user_prompt
)
            text = getattr(response, 'text', None)
            if not text:
                text = str(response)
            return {"text": text}
        except Exception as e:
            logger.error(f"Gemini suggestion error: {str(e)}")
            return {"error": f"Failed to generate Gemini suggestions: {str(e)}"}
