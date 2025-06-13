from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import requests

# Run website --> python backend/app.py in cmd

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookbuddy.db'

db = SQLAlchemy(app)

class Favorite(db.Model):
    user = db.Column(db.Integer, primary_key=True)
    book_list_id = db.Column(db.JSON)

    def to_dict(self):
        return {
            "user": self.user,
            "book_list_id": self.book_list_id
        }
    
class ReadBooks(db.Model):
    user = db.Column(db.Integer, primary_key=True)
    book_list_id = db.Column(db.JSON)

    def to_dict(self):
        return {
            "user": self.user,
            "book_list_id": self.book_list_id
        }
    
class WantToRead(db.Model):
    user = db.Column(db.Integer, primary_key=True)
    book_list_id = db.Column(db.JSON)

    def to_dict(self):
        return {
            "user": self.user,
            "book_list_id": self.book_list_id
        }
    
with app.app_context():
    db.create_all()


@app.route("/")
def home():

    return jsonify({"message": "Welcome to BookBuddy"})


#region favorite app routes
@app.route("/favorites", methods=["GET"])
def get_favorites():
    favorites = Favorite.query.all()
    return jsonify({"favorites": [favorite.to_dict() for favorite in favorites]})


@app.route("/favorites/<int:user_id>", methods=["GET"])
def get_favorite(user_id):
    favorite = Favorite.query.get(user_id)
    
    if favorite:
        return jsonify(favorite.to_dict())
    else:
        return jsonify({"error": f"favorite not found for user: {user_id}"}), 404

@app.route("/favorite_books/<int:user_id>", methods=["GET"])
def get_favorite_books(user_id):
    favorite = Favorite.query.get(user_id)
    
    if favorite:
        favorite_list = favorite.to_dict()['book_list_id']['list']
        book_list = []
        for fav in favorite_list:
            book = get_book_by_id(fav)
            book_list.append(book)
        return jsonify(book_list)
    else:
        return jsonify({"error": f"favorite not found for user: {user_id}"}), 404

@app.route("/favorites", methods=["POST"])
def post_favorites():
    data = request.get_json()
    
    new_favorite = Favorite(user=data["user"], book_list_id=data["book_list_id"])

    db.session.add(new_favorite)
    db.session.commit()

    return jsonify(new_favorite.to_dict()), 201

@app.route("/favorites/<int:user_id>", methods=["PUT"])
def udpate_favorites(user_id):
    data = request.get_json()

    favorite = Favorite.query.get(user_id)
    if favorite:
        favorite.user = data.get('user', favorite.user)
        favorite.book_list_id = data.get('book_list_id', favorite.book_list_id)

        db.session.commit()
        return jsonify(favorite.to_dict())
    else:
        return jsonify({"error": "favorite not found"}), 404


@app.route("/favorites/<int:user_id>", methods=["DELETE"])
def delete_favorites(user_id):
    favorite = Favorite.query.get(user_id)
    if favorite:
        db.session.delete(favorite)
        db.session.commit()

        return jsonify({"message": "favorite was deleted"})
    else:
        return jsonify({"error": "favorite not found"}), 404
    
#endregion

@app.route("/get_book/<string:book_id>", methods=["GET"])
def get_book_by_id(book_id):
    book_request = requests.get(f"https://www.googleapis.com/books/v1/volumes/{book_id}")
    return book_request.json()



if __name__ == "__main__":
    app.run(debug=True)
