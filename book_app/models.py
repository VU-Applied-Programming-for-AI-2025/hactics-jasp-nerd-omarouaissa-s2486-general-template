from django.db import models

# Create your models here.
class Book(models.Model):
    def __init__(self,item, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.title = item   
    
test = Book("testtt")

class BookList(models.Model):
    user = models.CharField()
    books = [models.JSONField()]

    



booklist = BookList()
booklist.books = [{"title": "hugerGames"}]
booklist.save()

# bookbuddy/user/favorites
class Favorites(models.Model):
    user = models.CharField()
    book_list = models.JSONField()

# # bookbuddy/user/readbooks
# class ReadBooks(models.Model):
#     user = models.CharField()
#     book_list = models.JSONField()

# # bookbuddy/user/wanttoread
# class WantToRead(models.Model):
#     user = models.CharField()
#     book_list = models.JSONField()   

# print(test.title)
# favorites = Favorites()
# favorites.user = "me"
# favorites.book_list = {
#     "me": [{"title": "book_name"}]
#     }
# print(favorites.book_list)