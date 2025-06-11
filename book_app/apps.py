from django.apps import AppConfig
import os


class BookAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'book_app'

def book_search(query):
    return "testtt"

