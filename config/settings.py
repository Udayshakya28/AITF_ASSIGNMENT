# settings.py
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Security / Debug ---
# Allow either DJANGO_SECRET_KEY or SECRET_KEY (use DJANGO_SECRET_KEY on Render)
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY') or os.getenv(
    'SECRET_KEY',
    'django-insecure-r3le7wefcs*u=@53n)yt1+=!ar2)p=rk-vr*_+okj++%pm(l&z'
)

DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Comma-separated list in env (e.g., "your-service.onrender.com,localhost,127.0.0.1")
ALLOWED_HOSTS = [h for h in os.getenv('DJANGO_ALLOWED_HOSTS', '*').split(',') if h]

# --- Installed apps / middleware ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # WhiteNoise must be right after SecurityMiddleware
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "corsheaders.middleware.CorsMiddleware",  # must be high in the list
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# --- Database ---
# Keep SQLite by default; switch to DATABASE_URL automatically if present
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    # Optional: pip install dj-database-url
    import dj_database_url
    DATABASES['default'] = dj_database_url.parse(DATABASE_URL, conn_max_age=600, ssl_require=False)

# --- Password validators (unchanged) ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- I18N / TZ (unchanged) ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- Static files with WhiteNoise ---
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Optional: enable gzip/brotli if available (WhiteNoise handles this automatically)
# STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- CORS / CSRF (from env) ---
# Put your Vercel URL(s) in these after the frontend is live
def _split_env(name):
    return [v for v in os.getenv(name, '').split(',') if v]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
]

CORS_ALLOW_CREDENTIALS = True

# --- Cache (unchanged) ---
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'weather-cache',
        'TIMEOUT': 600,
    }
}

# --- OpenAI ---
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# --- Gemini ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# --- REST Framework ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {'anon': '30/min'},
}

# --- Render / Proxy HTTPS ---
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
