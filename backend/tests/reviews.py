from typing import List
from datetime import datetime
from flask import Flask, request, jsonify, redirect, render_template, url_for
from flask_sqlalchemy import SQLAlchemy


app = Flask("BookBuddy")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reviews.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.String(15), db.ForeignKey("book.id"), nullable=False)
    user = db.Column(db.String(30), nullable=False)
    rating = db.Column(db.Float(3), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    message = db.Column(db.Text)

with app.app_context():
    db.create_all()
    
@app.route('/submit_review', methods=['POST'])
def submit_review():
    data = request.get_json()

    book_id = data.get("book_id")
    user = data.get("user")
    rating = data.get("rating")
    message = data.get("message")

    try:
        rating = float(rating)
    except (TypeError, ValueError):
            return jsonify({"Error":"Please pick a number between 0 and 5."}), 400
           
    if 0.0 > rating or rating > 5.0:
        return jsonify({"Error":"Please pick a number between 0 and 5."}), 400
    
    book = book.query.get(book_id)
    if not book:
        return jsonify({"Error":"Book was not found, please pick an existing book within our library."}), 404
    
    new_review = Review(book_id=book_id, user=user, rating=rating, message=message)
    db.session.add(new_review)
    db.session.commit()

    return jsonify({'Review was submitted succesfully!'}), 201

@app.route('/update_review/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    data = request.get_json()

    updated_rating = data.get("rating")
    updated_message = data.get("message")

    try:
        updated_rating = float(updated_rating)
    except (TypeError, ValueError):
            return jsonify({"Error":"Please pick a number between 0 and 5."}), 400
           
    if 0.0 > updated_rating or updated_rating > 5.0:
        return jsonify({"Error":"Please pick a number between 0 and 5."}), 400
    
    old_review = Review.query.get(review_id)
    if not old_review:
        return jsonify({"Error":"Review was not found."}), 404
    
    old_review.rating = updated_rating
    old_review.message = updated_message
    db.session.commit()

    return jsonify({'Review was updated succesfully!'}), 201    

    

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
        
                    



    def order_review_lf(self, reviews: List[Review]) -> List[Review]:
        '''
        This function will order all the reviews for one book from the highest ratings received to the lowest rating received.
        '''
        return sorted(reviews, key=lambda r: r.rating, reverse=True)


    def order_review_hf(self, reviews: List[Review])-> List[Review]:
        '''
        This function will order all the reviews for one book from the lowest ratings received to the highest rating received.
        '''
        return sorted(reviews, key=lambda r: r.rating)

    def order_review_new(self, reviews: List[Review])-> List[Review]:
        '''
        This function will order all the reviews for one book from the latest review made to the oldest review made.
        '''
        return sorted(reviews, key=lambda r: r.date, reverse=True)

    def order_review_old(self, reviews: List[Review])-> List[Review]:
        '''
        This function will order all the reviews for one book from the oldest review made to the latest review made.
        '''
        return sorted(reviews, key=lambda r: r.date)