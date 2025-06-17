import unittest

from reviews import Review, ReviewManager, Book


class TestReview(unittest.TestCase):

    def setUp(self):
        self.review = Review()
        self.review_manager = ReviewManager()

    def test_user_not_found_del(self):
        answer = self.review_manager.del_review("Marc Anthony")
        self.assertEqual("User not found, please pick a user that has made a review.", answer)

    def test_cancel_deletion(self):
        answer = self.review_manager.del_review("Cancel")
        self.assertEqual("Deletion has been canceled.", answer)

    def test_review_updated(self):
        answer = self.review.update_review(4.5, "Not at any point in this book was I able to predict what was going to happen.")
        self.assertEqual("Your rating of 1Q84 has been updated to 4.5 out of 5 and your message has been updated to 'Not at any point in this book was I able to predict what was going to happen.'.", answer)

    def test_update_score_above_5(self):
        answer = self.review.update_review(5.1, "Not at any point in this book was I able to predict what was going to happen.")
        self.assertEqual("Please pick a number between 0 and 5.", answer)

    def test_create_score_above_5(self):
        answer = self.review.create_review("1Q84", 5.1, "Not at any point in this book was I able to predict what was going to happen.")
        self.assertEqual("Please pick a number between 0 and 5.", answer)

    def test_book_exists(self):
        answer = self.review.create_review("Fake Book part 1", 4.3, "This book was amazing")
        self.assertEqual("Book was not found, please pick an existing book within our library.", answer)
    
    def test_review_created(self):
        answer = self.review.create_review("1Q84", 4.5, "Not at any point in this book was I able to predict what was going to happen.")
        self.assertEqual((
            f"Your rating for 1Q84 is 4.5 and your review was:\n"
            f"Not at any point in this book was I able to predict what was going to happen."), answer)
    