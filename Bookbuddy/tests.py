import requests
import unittest
from typing import List



class SearchTests(unittest.TestCase):

    def test_api_response(self):
        # This tests that the api give a 200 (ok) status code
        self.assertEqual(requests.request("GET", "https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=AIzaSyAI8gKE3AQCSaGhCigcNXRq57OOWmHaT-g").status_code, 200)

    
    def test_book_search(self):
        '''
        Test for the book search function.

        The function will take a string and perform a call to the Google Books API, it will then put the resulted books into a list.
        '''
        query = "The Way of Kings"
        result_list = book_search(query)
        
        assert isinstance(result_list, list)
        assert len(result_list) > 0
        assert "volumeInfo" in result_list[0]


if __name__ == "__main__":
    
    unittest.main