import unittest

import requests
import unittest
import sys
import os 

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import book_search_title, search_url_build

class SearchTests(unittest.TestCase):
 

    def test_api_response(self):
        # This tests that the api give a 200 (ok) status code
        self.assertEqual(requests.request("GET", f"https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key={os.environ["API_KEY"]}").status_code, 200)

    def test_filter_search(self):
        #test a filter search, checking to see if params are in place.
        url = search_url_build("flowers", [] )
        assert "q=flowers" in url
        assert "startIndex=0" in url
        assert "maxResults=10" in url

    def test_book_search_title(self):
        '''
        Test for the book search function.

        The function will take a string and perform a call to the Google Books API, it will then put the resulted books into a list.
        
        This tests that it returns a list of items, that the list is not empty and that an item contains the relevant volumeInfo inside it.
        '''
        query = "The Way of Kings"
        result_list = book_search_title(query) 
        assert isinstance(result_list, list)
        assert len(result_list) > 0
        assert "volumeInfo" in result_list[0]
        assert result_list[0]["volumeInfo"]["title"] == "The Way of Kings"
    
    def test_flask_search_routes(self):
        #Checks if the url even works in flask aka (200) status code.
        self.assertEqual(requests.request("GET", f"http://127.0.0.1:5000/search").status_code, 200)
    
    def test_optional_params_none(self):
        #Test if i do not put in ANY filters, is it gonna break on me or not.
        url = search_url_build("Python")
        assert "filter=" not in url
        assert "orderBy=" not in url
        assert "langRestrict=" not in url
        assert "printType=" not in url
        assert "key=" not in url

if __name__ == "__main__":
    unittest.main