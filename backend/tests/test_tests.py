### first backend tests file ###
import requests
import pytest
import sys

#Allows us to import from the backend folder itself
sys.path.insert(1, 'backend')

from app import book_search



def test_api_response():
    # This tests that the api give a 200 (ok) status code
    assert requests.request("GET", "https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=AIzaSyAI8gKE3AQCSaGhCigcNXRq57OOWmHaT-g").status_code == 200

def test_book_search():
    result_list = book_search(2)
    print(result_list)
    assert result_list == 21
