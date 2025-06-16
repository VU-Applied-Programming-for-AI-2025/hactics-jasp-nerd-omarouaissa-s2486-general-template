from typing import List, Dict

class Book():
    def __init__(self):
        pass

class Review():
    def __init__(self, book: Book, user: str, rating: float, date: str, message: str):
        self.book = book
        self.user = user
        self.rating = rating
        self.date = date
        self.message = message

    def update_review(self, book, rating, message) -> any:
        '''
        This function will update an existing review and rating for a book the user has read.
        '''       
        pass

    

class ReviewManager():
    def __init__(self, book, reviews: List[Review]):
        self.book = book
        self.reviews = reviews

    def del_review(self, user):
        '''
        This function will delete a review from the list of reviews made for a book(, for now from an admin perspective).
        '''
        if user == "Cancel":
                return "Deletion has been canceled."
        for review in self.reviews:
            if review.user == user:
                self.reviews.remove(review)
                return "User review deleted"
        else:
            return "User not found, please pick a user that has made a review."
        
                    



    def order_review_lf(self)-> List[Review]:
        '''
        This function will order all the reviews for one book from the highest ratings received to the lowest rating received.
        '''
        pass

    def order_review_hf(self)-> List[Review]:
        '''
        This function will order all the reviews for one book from the lowest ratings received to the highest rating received.
        '''
        pass

    def order_review_new(self)-> List[Review]:
        '''
        This function will order all the reviews for one book from the latest review made to the oldest review made.
        '''
        pass

    def order_review_new(self)-> List[Review]:
        '''
        This function will order all the reviews for one book from the oldest review made to the latest review made.
        '''
        pass