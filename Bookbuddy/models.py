from django.db import models

# Create your models here.

class Favorites(models.Model):
    user = models.CharField()
    book_list = models.JSONField()

class ReadBooks(models.Model):
    user = models.CharField()
    book_list = models.JSONField()

class WantToRead(models.Model):
    user = models.CharField()
    book_list = models.JSONField()   
