from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy


app = Flask("BookBuddy")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reviews.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Review(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.String(15), db.ForeignKey("book.id"), nullable=False)
    user = db.Column(db.String(30), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    message = db.Column(db.Text)

with app.app_context():
    db.create_all()
    
@app.route("/submit_review", methods=["POST"])

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
    
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"Error":"Book was not found, please pick an existing book within our library."}), 404
    
    review_exists = Review.query.filter_by(user=user, book_id=book_id).first()
    if review_exists:
        return jsonify({"Error":"Review has already been submitted. Please delete your old review before posting a new one or edit your current review."}), 400
    
    new_review = Review(book_id=book_id, user=user, rating=rating, message=message)
    db.session.add(new_review)
    db.session.commit()

    return jsonify({"Message":"Review was submitted successfully!", "review_id": new_review.id}), 201

@app.route("/update_review/<int:review_id>", methods=["PUT"])

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

    return jsonify({"Message":"Review was updated successfully!"}), 200    

@app.route("/delete_review", methods=["DELETE"])

def delete_review_by_user():

    data = request.get_json()

    user = data.get("user")
    book_id = data.get("book_id")

    review = Review.query.filter_by(user=user, book_id=book_id).first()

    if not review:
        return jsonify({"Error":"Review was not found."}), 404
    
    db.session.delete(review)
    db.session.commit()

    return jsonify({"Message":"Review has been deleted successfully!"}), 200

@app.route("/reviews_sorted")

def get_sorted_reviews():

    sort_by = request.args.get("sort_by", "rating")
    order = request.args.get("order", "asc")

    if sort_by == "rating":
        category_order = Review.rating 
    elif sort_by == "date":
        category_order = Review.date
    else:
        return jsonify({"Error":"Order Category not found."}), 404
    
    if order == "asc":
        type_order = category_order.asc()
    elif order == "desc":
        type_order = category_order.desc()
    else:
        return jsonify({"Error":"Order Type not found."}), 404
    
    reviews = Review.query.order_by(type_order).all()

    return jsonify([{"user": review.user, "rating":review.rating, "message":review.message, "date":review.date.isoformat()} for review in reviews]) 