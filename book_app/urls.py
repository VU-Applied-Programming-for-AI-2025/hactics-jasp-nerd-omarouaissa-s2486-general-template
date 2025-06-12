from django.urls import path
from .views import get_favorites

urlpatterns = [
    path('favorites/', get_favorites)
]

