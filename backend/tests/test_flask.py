import unittest
import os
import requests

# from .. import app
BASE_URL = os.environ.get("BOOKBUDDY_BASE_URL", "http://127.0.0.1:5000")

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
        get_request = requests.get(f"{BASE_URL}/")
        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json(), {"message": "Welcome to BookBuddy"})

    def test_0020_post_favorite(self):
        '''
        Tests the creation of favorite lists.
        '''

        get_request = requests.get(f"{BASE_URL}/favorites")
        self.assertEqual(get_request.status_code, 200)

        post_request = requests.post(f"{BASE_URL}/favorites", json=
        {
            "user": "user1",
            "book_list_id": {"list": ["book1", "book2"]}
        })

        self.assertEqual(post_request.status_code, 201)

        post_request2 = requests.post(f"{BASE_URL}/favorites", json=
        {
            "user": "user2",
            "book_list_id": {"list": ["XjYQCwAAQBAJ", "7L1_BAAAQBAJ"]}
        })

        self.assertEqual(post_request2.status_code, 201)

        # You should not be able to create an object with the same username twice.
        post_request2 = requests.post(f"{BASE_URL}/favorites", json=
        {
            "user": "user1",
            "book_list_id": {"list": ["book2", "book5"]}
        })

        self.assertEqual(post_request2.status_code, 500)
        

    def test_0030_get_favorite_by_id(self):
        '''
        Tests the get_favorite Get request with a given username.
        '''

        get_request = requests.get(f"{BASE_URL}/favorites/user1")
        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json(), {
            "user": "user1",
            "book_list_id": {"list": ["book1", "book2"]}
        })

        get_request2 = requests.get(f"{BASE_URL}/favorites/user2")
        self.assertEqual(get_request2.status_code, 200)
        self.assertEqual(get_request2.json(), {
            "user": "user2",
            "book_list_id": {"list": ["XjYQCwAAQBAJ", "7L1_BAAAQBAJ"]}
        })

    def test_0031_get_favorites(self):
        '''
        Tests the get_favorites Get request, this function uses the data posted by the previous function.
        '''

        get_request = requests.get(f"{BASE_URL}/favorites")
        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json(), {"favorites": [
            {'user': "user1", 'book_list_id': {'list': ['book1', 'book2']}}, 
            {'user': "user2", 'book_list_id': {'list': ['book3', 'book4']}}]})
        

    def test_0040_update_favorite(self):
        '''
        Tests the update favorite Put request.
        '''

        put_request = requests.put(f"{BASE_URL}/favorites/user1", json={
            "user": "user1",
            "book_list_id": {"list": ["book5", "book7"]}
        })

        self.assertEqual(put_request.status_code, 200)
        self.assertEqual(requests.get(f"{BASE_URL}/favorites/user1").json(), {
            "user": "user1",
            "book_list_id": {"list": ["book5", "book7"]}
        })

    def test_0050_delete_favorite(self):
        '''
        Tests the deletion of a favorites object.
        '''

        delete_request = requests.delete(f"{BASE_URL}/favorites/user1")
        self.assertEqual(delete_request.status_code, 200)
        
        self.assertEqual(requests.get(f"{BASE_URL}/favorites/user1").status_code, 404)

    def test_0060_get_book_info_by_id(self):
        '''
        Tests the get book info by id. 
        '''

        #GET https://www.googleapis.com/books/v1/volumes/volumeId

        get_request = requests.get(f"{BASE_URL}/get_book/5zl-KQEACAAJ")

        self.assertEqual(get_request.status_code, 200)

        self.assertEqual(get_request.json()['volumeInfo']['title'], "Flowers for Algernon")
        self.assertEqual(get_request.json()['volumeInfo']['authors'], ["Daniel Keyes"])

    def test_0070_get_favorite_books(self):
        '''
        Tests the get favorite books request.
        '''

        requests.post(f"{BASE_URL}/favorites", json={
            "user": "user3",
            "book_list_id": {"list": ["5zl-KQEACAAJ", "F1wgqlNi8AMC"]}
        })

        get_request = requests.get(f"{BASE_URL}/favorite_books/user3")

        self.assertEqual(get_request.status_code, 200)
        print(get_request.json())
        self.assertEqual(get_request.json()[0]['volumeInfo']['title'], "Flowers for Algernon")
        self.assertEqual(get_request.json()[1]['volumeInfo']['title'], "Flowers for Algernon")
        self.assertEqual(get_request.json()[0]['volumeInfo']['authors'], ["Daniel Keyes"])
        self.assertEqual(get_request.json()[1]['volumeInfo']['authors'], ["David Rogers", "Daniel Keyes"])

    def test_0080_add_book_id_to_favorites(self):
        '''
        Tests the add book id to favorites request.
        '''

        post_request = requests.post(f'{BASE_URL}/favorites/user3/add/book24534')

        self.assertEqual(post_request.status_code, 200)

        get_request = requests.get(f'{BASE_URL}/favorites/user3')

        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json()["book_list_id"]["list"][2], "book24534")

    def test_0081_delete_book_id_from_favorites(self):
        '''
        Tests the delete book id to favorites request.
        '''
        post_request = requests.post(BASE_URL+'/favorites/user3/delete/book24534')
        self.assertEqual(post_request.status_code, 200)

        get_request = requests.get(BASE_URL+'/favorites/user3')

        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json()["book_list_id"], {"list": ["5zl-KQEACAAJ", "F1wgqlNi8AMC"]})


    def test_0090_get_recommendations(self):
        '''
        Tests the get recommendations for user function.
        {
            "recommendations": [list of recommended books],
            "genre": genre_of_recommended_books
        }
        '''

        #genre: Young Adult Fiction
        requests.post(BASE_URL+'/favorites/user3/add/9XYlEQAAQBAJ')
        requests.post(BASE_URL+'/favorites/user3/add/Yz8Fnw0PlEQC')
        requests.post(BASE_URL+'/favorites/user3/add/7L1_BAAAQBAJ')

        get_request = requests.get(BASE_URL+"/recommendations/user3")

        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json()["genre"], "Young Adult Fiction")
        self.assertEqual(len(get_request.json()["recommendations"]['items']), 10)

        #user 4 does not exist, but we still want recommendations
        get_request2 = requests.get(BASE_URL+"/recommendations/user4")

        self.assertEqual(get_request2.status_code, 200)
        
        #standard genre if user does not exist or is new: Juvenile Fiction
        self.assertEqual(get_request2.json()["genre"], "Juvenile Fiction")
        self.assertEqual(len(get_request2.json()["recommendations"]['items']), 10)

    
    def test_0100_get_most_favorite(self):
        '''
        Tests the get most favorites function.
        '''
        requests.post(BASE_URL+'/favorites/user3/add/XjYQCwAAQBAJ')

        get_request = requests.get(BASE_URL+"/most_favorites")

        self.assertEqual(get_request.status_code, 200)
        self.assertEqual(get_request.json()['book_list_id']['list'][0], "XjYQCwAAQBAJ")

        #if books have the same favorites, a book should still be returned
        requests.post(BASE_URL+'/favorites/user3/delete/XjYQCwAAQBAJ')

        get_request = requests.get(BASE_URL+"/most_favorites")

        self.assertEqual(get_request.status_code, 200)
        self.assertIsInstance(get_request.json()['book_list_id']['list'][0], str)


if __name__ == "__main__":
    unittest.main()