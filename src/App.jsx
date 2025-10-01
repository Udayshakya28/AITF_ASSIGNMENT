import { useState, useEffect } from 'react'

const getApiUrl = () => {
  if (window.location.hostname.includes('replit.dev')) {
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    return `${protocol}//${hostname}:8000/api`
  }
  return 'http://localhost:8000/api'
}

const API_URL = getApiUrl()

const translations = {
  en: {
    title: 'Voice Weather Assistant',
    language: 'Language',
    persona: 'Persona',
    outings: 'Outings',
    travel: 'Travel',
    fashion: 'Fashion',
    place: 'Place',
    placePlaceholder: 'Enter city name',
    query: 'Query',
    queryPlaceholder: 'What activity are you planning?',
    generate: 'Generate Suggestions',
    loading: 'Loading...',
    weather: 'Weather',
    suggestions: 'Suggestions',
    readAloud: 'Read Aloud',
    startVoice: 'Start Voice Input',
    stopVoice: 'Stop Voice Input',
    listening: 'Listening...',
    noSpeech: 'Speech recognition not supported',
  },
  ja: {
    title: '音声天気アシスタント',
    language: '言語',
    persona: 'ペルソナ',
    outings: '外出',
    travel: '旅行',
    fashion: 'ファッション',
    place: '場所',
    placePlaceholder: '都市名を入力',
    query: 'クエリ',
    queryPlaceholder: 'どんな活動を計画していますか？',
    generate: '提案を生成',
    loading: '読み込み中...',
    weather: '天気',
    suggestions: '提案',
    readAloud: '読み上げ',
    startVoice: '音声入力開始',
    stopVoice: '音声入力停止',
    listening: '聞いています...',
    noSpeech: '音声認識に対応していません',
  },
}

function App() {
  const [lang, setLang] = useState('en')
  const [locale, setLocale] = useState('en-US')
  const [persona, setPersona] = useState('outings')
  const [place, setPlace] = useState('Tokyo')
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)

  const t = translations[lang]

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
      }
      
      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      rec.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(rec)
    }
  }, [])

  useEffect(() => {
    if (recognition) {
      recognition.lang = locale
    }
  }, [locale, recognition])

  const handleLanguageChange = (newLang) => {
    setLang(newLang)
    setLocale(newLang === 'ja' ? 'ja-JP' : 'en-US')
  }

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert(t.noSpeech)
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const fetchWeatherAndSuggestions = async () => {
    if (!place.trim() || !query.trim()) {
      setError('Please enter both place and query')
      return
    }

    setLoading(true)
    setError(null)
    setWeather(null)
    setSuggestions(null)

    try {
      const weatherRes = await fetch(`${API_URL}/weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place, timezone: 'auto', lang }),
      })

      if (!weatherRes.ok) {
        const errorData = await weatherRes.json()
        throw new Error(errorData.error || 'Failed to fetch weather')
      }

      const weatherData = await weatherRes.json()
      setWeather(weatherData)

      const suggestRes = await fetch(`${API_URL}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          place: weatherData.placeLabel,
          weatherSummary: weatherData.summary,
          persona,
          locale,
          outputLang: lang,
        }),
      })

      if (!suggestRes.ok) {
        const errorData = await suggestRes.json()
        throw new Error(errorData.error || 'Failed to generate suggestions')
      }

      const suggestData = await suggestRes.json()
      setSuggestions(suggestData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const readAloud = () => {
    if (!suggestions || !suggestions.text) return

    const utterance = new SpeechSynthesisUtterance(suggestions.text)
    utterance.lang = locale
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">{t.title}</h1>
          
          <div className="flex justify-center gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">{t.language}:</label>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg transition ${
                  lang === 'en'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('ja')}
                className={`ml-2 px-4 py-2 rounded-lg transition ${
                  lang === 'ja'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                日本語
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">{t.persona}:</label>
              {['outings', 'travel', 'fashion'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={`px-3 py-2 ml-2 rounded-lg text-sm transition ${
                    persona === p
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t[p]}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.place}
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder={t.placePlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.query}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.queryPlaceholder}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {recognition && (
                  <button
                    onClick={toggleVoiceInput}
                    className={`px-6 py-3 rounded-lg font-medium transition min-w-[44px] min-h-[44px] ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                    aria-pressed={isListening}
                    aria-label={isListening ? t.stopVoice : t.startVoice}
                  >
                    🎤
                  </button>
                )}
              </div>
              {isListening && (
                <p className="text-sm text-indigo-600 mt-2">{t.listening}</p>
              )}
            </div>

            <button
              onClick={fetchWeatherAndSuggestions}
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition min-h-[44px]"
            >
              {loading ? t.loading : t.generate}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {weather && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.weather}</h2>
            <div className="space-y-2">
              <p className="text-lg font-medium text-indigo-700">{weather.placeLabel}</p>
              <p className="text-gray-700">{weather.summary}</p>
              <p className="text-sm text-gray-500">
                Coordinates: {weather.coords.latitude.toFixed(2)}, {weather.coords.longitude.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {suggestions && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{t.suggestions}</h2>
              <button
                onClick={readAloud}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition min-h-[44px]"
              >
                🔊 {t.readAloud}
              </button>
            </div>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans">{suggestions.text}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
