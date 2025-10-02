from django.urls import path
from . import views, auth_views

urlpatterns = [
    path('weather', views.weather, name='weather'),
    path('suggest', views.suggest, name='suggest'),
    path('auth/register', auth_views.register_view, name='register'),
    path('auth/login', auth_views.login_view, name='login'),
    path('auth/logout', auth_views.logout_view, name='logout'),
    path('auth/check', auth_views.check_auth, name='check_auth'),
    path('profile', auth_views.profile_view, name='profile'),
    path('search-history', auth_views.search_history_view, name='search_history'),
]
