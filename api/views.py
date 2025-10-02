from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import WeatherService, SuggestionService
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
def weather(request):
    place = request.data.get('place', '').strip()
    timezone = request.data.get('timezone', 'auto')
    lang = request.data.get('lang', 'en')
    
    if not place:
        return Response(
            {'error': 'Place is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(place) > 100:
        return Response(
            {'error': 'Place name too long'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    geocode_data = WeatherService.geocode(place)
    if not geocode_data:
        return Response(
            {'error': f'Could not find location: {place}'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    forecast_data = WeatherService.get_forecast(
        geocode_data['latitude'],
        geocode_data['longitude'],
        timezone
    )
    
    if not forecast_data:
        return Response(
            {'error': 'Could not fetch weather data'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    place_label = f"{geocode_data['name']}, {geocode_data['admin1']}, {geocode_data['country']}"
    summary = WeatherService.build_summary(forecast_data, lang)
    
    return Response({
        'placeLabel': place_label,
        'coords': {
            'latitude': geocode_data['latitude'],
            'longitude': geocode_data['longitude']
        },
        'summary': summary,
        'raw': forecast_data.get('daily', {})
    })



@api_view(['POST'])
def suggest(request):
    query = request.data.get('query', '').strip()
    place = request.data.get('place', '').strip()
    weather_summary = request.data.get('weatherSummary', '').strip()
    persona = request.data.get('persona', 'outings')
    output_lang = request.data.get('outputLang', 'en')
    provider = request.data.get('provider', 'openai').lower()  # 'openai' or 'gemini'

    if not query:
        return Response(
            {'error': 'Query is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(query) > 500:
        return Response(
            {'error': 'Query too long'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if persona not in ['outings', 'travel', 'fashion']:
        return Response(
            {'error': 'Invalid persona. Must be outings, travel, or fashion'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if output_lang not in ['en', 'ja']:
        return Response(
            {'error': 'Invalid output language. Must be en or ja'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Choose provider
    if provider == 'gemini':
        result = SuggestionService.generate_suggestions_gemini(
            query, place, weather_summary, persona, output_lang
        )
    else:
        result = SuggestionService.generate_suggestions(
            query, place, weather_summary, persona, output_lang
        )

    if 'error' in result:
        return Response(
            {'error': result['error']},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response(result)
