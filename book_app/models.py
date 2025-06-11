from django.db import models

# Create your models here.
class Book(models.Model):
    def __init__(self,item, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.title = item   
    
test = Book("testtt")

print(test.title)