import requests
import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from book_app import apps

print(apps.book_search(2)) 
class SearchTests(unittest.TestCase):
 
    def test_api_response(self):
        # This tests that the api give a 200 (ok) status code
        self.assertEqual(requests.request("GET", "https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=AIzaSyAI8gKE3AQCSaGhCigcNXRq57OOWmHaT-g").status_code, 200)

    def test_filter_search(self):
        pass
    
    def test_book_search(self):
        '''
        Test for the book search function.

        The function will take a string and perform a call to the Google Books API, it will then put the resulted books into a list.
        '''
        query = "The Way of Kings"
        result_list = apps.book_search(query)
        print(result_list)
        assert isinstance(result_list, list)
        assert len(result_list) > 0
        assert "volumeInfo" in result_list[0]

class FilterTests(unittest.TestCase):

    def test_addition(self):
        self.assertGreater(1,2)

if __name__ == "__main__":
    
    unittest.main