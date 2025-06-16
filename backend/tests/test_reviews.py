import unittest

from reviews import Review, ReviewManager, Book


class TestReview(unittest.TestCase):

    def setUp(self):
        self.review_manager = ReviewManager()

    def test_user_not_found_del(self):
        answer = self.review_manager.del_review("Marc Anthony")
        self.assertEqual("User not found, please pick a user that has made a review.", answer)

    def test_cancel_deletion(self):
        answer = self.review_manager.del_review("Cancel")
        self.assertEqual("Deletion has been canceled.", answer)

    
    