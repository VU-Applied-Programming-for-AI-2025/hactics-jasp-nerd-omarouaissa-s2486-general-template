import unittest

import requests

# from .. import app

class test_flask_favorites(unittest.TestCase):
    '''
    To run these tests, you should run the flask application and clear or delete the database.
    '''

    def setUp(self):
        pass

    def test_0010_flask_app(self):
        '''
        Tests the home page of the flask app.
        '''
        get_request = requests.get("http://127.0.0.1:5000")
        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json(), {"message": "Welcome to BookBuddy"})

    def test_0020_post_favorite(self):
        '''
        Tests the creation of favorite lists.
        '''

        get_request = requests.get("http://127.0.0.1:5000/favorites")
        self.assertEqual(get_request.status_code, 200)

        post_request = requests.post("http://127.0.0.1:5000/favorites", json=
        {
            "user": 1,
            "book_list_id": {"list": ["book1", "book2"]}
        })

        self.assertEqual(post_request.status_code, 201)

        post_request2 = requests.post("http://127.0.0.1:5000/favorites", json=
        {
            "user": 2,
            "book_list_id": {"list": ["book3", "book4"]}
        })

        self.assertEqual(post_request2.status_code, 201)

        # You should not be able to create an object with the same user id twice.
        post_request2 = requests.post("http://127.0.0.1:5000/favorites", json=
        {
            "user": 1,
            "book_list_id": {"list": ["book2", "book5"]}
        })

        self.assertEqual(post_request2.status_code, 500)
            

    def test_0030_get_favorite_by_id(self):
        '''
        Tests the get_favorite Get request with an given user id.
        '''

        get_request = requests.get("http://127.0.0.1:5000/favorites/1")
        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json(), {
            "user": 1,
            "book_list_id": {"list": ["book1", "book2"]}
        })

        get_request2 = requests.get("http://127.0.0.1:5000/favorites/2")
        self.assertEqual(get_request2.status_code, 200)
        self.assertEqual(get_request2.json(), {
            "user": 2,
            "book_list_id": {"list": ["book3", "book4"]}
        })


    def test_0031_get_favorites(self):
        '''
        Tests the get_favorites Get request, this function uses the data posted by the previous function.
        '''

        get_request = requests.get("http://127.0.0.1:5000/favorites")
        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json(), {"favorites": [
            {'user': 1, 'book_list_id': {'list': ['book1', 'book2']}}, 
            {'user': 2, 'book_list_id': {'list': ['book3', 'book4']}}]})
        

    def test_0040_update_favorite(self):
        '''
        Tests the update favorite Put request.
        '''

        put_request = requests.put("http://127.0.0.1:5000/favorites/1", json={
            "user": 1,
            "book_list_id": {"list": ["book5", "book7"]}
        })

        self.assertEqual(put_request.status_code, 200)

        self.assertEqual(requests.get("http://127.0.0.1:5000/favorites/1").json(), {
            "user": 1,
            "book_list_id": {"list": ["book5", "book7"]}
        })


    def test_0050_delete_favorite(self):
        '''
        Tests the deletion of a favorites object.
        '''

        delete_request = requests.delete("http://127.0.0.1:5000/favorites/1")
        self.assertEqual(delete_request.status_code, 200)
        
        self.assertEqual(requests.get("http://127.0.0.1:5000/favorites/1").status_code, 404)

    
    def test_0060_get_book_info_by_id(self):
        '''
        Tests the get book info by id. 
        '''

        #GET https://www.googleapis.com/books/v1/volumes/volumeId

        get_request = requests.get("http://127.0.0.1:5000/get_book/5zl-KQEACAAJ")

        self.assertEqual(get_request.status_code, 200)

        self.assertEqual(get_request.json()['volumeInfo']['title'], "Flowers for Algernon")
        self.assertEqual(get_request.json()['volumeInfo']['authors'], ["Daniel Keyes"])






    

