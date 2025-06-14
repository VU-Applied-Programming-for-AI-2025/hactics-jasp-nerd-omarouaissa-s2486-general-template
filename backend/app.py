from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import requests

# Run website --> python backend/app.py in cmd

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookbuddy.db'

db = SQLAlchemy(app)

class Favorite(db.Model):
    '''
    Favorite model, to store list of book id's and the user the favorites belong to.
    '''
    user = db.Column(db.Integer, primary_key=True)
    book_list_id = db.Column(db.JSON)

    def to_dict(self):
        return {
            "user": self.user,
            "book_list_id": self.book_list_id
        }
    
class ReadBooks(db.Model):
    '''
    Read books model, stores list of book id's and the user the read books belong to.
    '''
    user = db.Column(db.Integer, primary_key=True)
    book_list_id = db.Column(db.JSON)

    def to_dict(self):
        return {
            "user": self.user,
            "book_list_id": self.book_list_id
        }
    
class WantToRead(db.Model):
    '''
    Want to read books model, stores list of book id's and the user the want to read books belong to.
    '''
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
    '''
    Returns all favorites stored in the database.
    The return is a list of book id's
    '''
    favorites = Favorite.query.all()
    return jsonify({"favorites": [favorite.to_dict() for favorite in favorites]})


@app.route("/favorites/<int:user_id>", methods=["GET"])
def get_favorite(user_id):
    '''
    Returns users favorites according to user id.
    The return is a list of book id's
    '''
    favorite = Favorite.query.get(user_id)
    
    if favorite:
        return jsonify(favorite.to_dict())
    else:
        return jsonify({"error": f"favorite not found for user: {user_id}"}), 404

@app.route("/favorite_books/<int:user_id>", methods=["GET"])
def get_favorite_books(user_id):
    '''
    Returns users favorite books according to the user id.
    It returns the a list of books, the same as Google books.
    '''
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
    '''
    Creates favorites for user. 
    The data from the post request should hold the user id and the list of book id's.
    '''
    data = request.get_json()
    
    new_favorite = Favorite(user=data["user"], book_list_id=data["book_list_id"])

    db.session.add(new_favorite)
    db.session.commit()

    return jsonify(new_favorite.to_dict()), 201

@app.route("/favorites/<int:user_id>", methods=["PUT"])
def update_favorites(user_id):
    '''
    Updates favorites for user.
    The data from the put request should hold the user id and the list of book id's.
    '''
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
    '''
    Deletes the favorites of user with user_id.
    '''
    favorite = Favorite.query.get(user_id)
    if favorite:
        db.session.delete(favorite)
        db.session.commit()

        return jsonify({"message": "favorite was deleted"})
    else:
        return jsonify({"error": "favorite not found"}), 404
    
@app.route("/favorites/<int:user_id>/add/<string:book_id>", methods=["POST"])
def add_book_id_to_favorites(user_id, book_id):
    '''
    The post request does not need body information, the book_id is given in the url of the request
    '''
    return f"test, {user_id}, {book_id}"
    
#endregion


#region read book app routes
@app.route("/read_books", methods=["GET"])
def get_read_books():
    '''
    Returns all read books stored in the database.
    The return is a list of book id's
    '''
    read_books = ReadBooks.query.all()
    return jsonify({"read books": [read_book.to_dict() for read_book in read_books]})


@app.route("/read_books/<int:user_id>", methods=["GET"])
def get_read_book(user_id):
    '''
    Returns users read books according to user id.
    The return is a list of book id's
    '''
    read_books = ReadBooks.query.get(user_id)
    
    if read_books:
        return jsonify(read_books.to_dict())
    else:
        return jsonify({"error": f"read_book not found for user: {user_id}"}), 404

@app.route("/read_book_objects/<int:user_id>", methods=["GET"])
def get_read_book_object(user_id):
    '''
    Returns users read books according to the user id.
    It returns the a list of books, the same as Google books.
    '''
    read_books = Favorite.query.get(user_id)
    
    if read_books:
        read_book_list = read_books.to_dict()['book_list_id']['list']
        book_list = []
        for read in read_book_list:
            book = get_book_by_id(read)
            book_list.append(book)
        return jsonify(book_list)
    else:
        return jsonify({"error": f"read_book not found for user: {user_id}"}), 404

@app.route("/read_books", methods=["POST"])
def post_read_books():
    '''
    Creates read books for user. 
    The data from the post request should hold the user id and the list of book id's.
    '''
    data = request.get_json()
    
    new_read_book = ReadBooks(user=data["user"], book_list_id=data["book_list_id"])

    db.session.add(new_read_book)
    db.session.commit()

    return jsonify(new_read_book.to_dict()), 201

@app.route("/read_books/<int:user_id>", methods=["PUT"])
def update_read_books(user_id):
    '''
    Updates read books for user.
    The data from the put request should hold the user id and the list of book id's.
    '''
    data = request.get_json()

    read_book = ReadBooks.query.get(user_id)
    if read_book:
        read_book.user = data.get('user', read_book.user)
        read_book.book_list_id = data.get('book_list_id', read_book.book_list_id)

        db.session.commit()
        return jsonify(read_book.to_dict())
    else:
        return jsonify({"error": "read_book not found"}), 404


@app.route("/read_books/<int:user_id>", methods=["DELETE"])
def delete_read_books(user_id):
    '''
    Deletes the read books of user with user_id.
    '''
    read_book = ReadBooks.query.get(user_id)
    if read_book:
        db.session.delete(read_book)
        db.session.commit()

        return jsonify({"message": "read_book was deleted"})
    else:
        return jsonify({"error": "read_book not found"}), 404
    
#endregion


#region want to read app routes
@app.route("/want_to_reads", methods=["GET"])
def get_want_to_reads():
    '''
    Returns all want to read books stored in the database.
    The return is a list of book id's
    '''
    want_to_reads = WantToRead.query.all()
    return jsonify({"want to read books": [want_to_read.to_dict() for want_to_read in want_to_reads]})


@app.route("/want_to_reads/<int:user_id>", methods=["GET"])
def get_want_to_read(user_id):
    '''
    Returns users want to read books according to user id.
    The return is a list of book id's
    '''
    want_to_reads = WantToRead.query.get(user_id)
    
    if want_to_reads:
        return jsonify(want_to_reads.to_dict())
    else:
        return jsonify({"error": f"want_to_read not found for user: {user_id}"}), 404

@app.route("/want_to_read_books/<int:user_id>", methods=["GET"])
def get_want_to_read_books(user_id):
    '''
    Returns users want to read books according to the user id.
    It returns the a list of books, the same as Google books.
    '''
    want_to_reads = WantToRead.query.get(user_id)
    
    if want_to_reads:
        want_to_read_list = want_to_reads.to_dict()['book_list_id']['list']
        book_list = []
        for read in want_to_read_list:
            book = get_book_by_id(read)
            book_list.append(book)
        return jsonify(book_list)
    else:
        return jsonify({"error": f"want_to_read not found for user: {user_id}"}), 404

@app.route("/want_to_reads", methods=["POST"])
def post_want_to_read_books():
    '''
    Creates want to read books for user. 
    The data from the post request should hold the user id and the list of book id's.
    '''
    data = request.get_json()
    
    new_want_to_read = WantToRead(user=data["user"], book_list_id=data["book_list_id"])

    db.session.add(new_want_to_read)
    db.session.commit()

    return jsonify(new_want_to_read.to_dict()), 201

@app.route("/want_to_reads/<int:user_id>", methods=["PUT"])
def update_want_to_read(user_id):
    '''
    Updates want to read books for user.
    The data from the put request should hold the user id and the list of book id's.
    '''
    data = request.get_json()

    want_to_read = WantToRead.query.get(user_id)
    if want_to_read:
        want_to_read.user = data.get('user', want_to_read.user)
        want_to_read.book_list_id = data.get('book_list_id', want_to_read.book_list_id)

        db.session.commit()
        return jsonify(want_to_read.to_dict())
    else:
        return jsonify({"error": "want_to_reads not found"}), 404


@app.route("/want_to_reads/<int:user_id>", methods=["DELETE"])
def delete_want_to_read(user_id):
    '''
    Deletes the want to read books of user with user_id.
    '''
    want_to_read = WantToRead.query.get(user_id)
    if want_to_read:
        db.session.delete(want_to_read)
        db.session.commit()

        return jsonify({"message": "want_to_read was deleted"})
    else:
        return jsonify({"error": "want_to_read not found"}), 404
    
#endregion


@app.route("/get_book/<string:book_id>", methods=["GET"])
def get_book_by_id(book_id):
    '''
    Returns a book object from the given book_id the same as the Google Books API.
    '''
    book_request = requests.get(f"https://www.googleapis.com/books/v1/volumes/{book_id}")
    return book_request.json()



if __name__ == "__main__":
    app.run(debug=True)
