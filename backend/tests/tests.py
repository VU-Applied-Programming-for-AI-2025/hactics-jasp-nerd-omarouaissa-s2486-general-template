### first backend tests file ###
import requests
import unittest

class tests(unittest.TestCase):
    def test_api_response(self):
        # This tests that the api give a 200 (ok) status code
        assert requests.request("GET", "https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=AIzaSyAI8gKE3AQCSaGhCigcNXRq57OOWmHaT-g").status_code == 200

if __name__ == "__main__":
    unittest.main