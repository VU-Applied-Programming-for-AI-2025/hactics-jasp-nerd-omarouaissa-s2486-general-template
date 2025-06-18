from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import requests
from sqlalchemy.orm.attributes import flag_modified
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import requests
import os

# Run website --> python backend/app.py in cmd
load_dotenv()

app = Flask(__name__)

# Start gemini API with system prompt for book recommendations
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
chat = client.chats.create(
    model="gemini-2.0-flash",
    config=types.GenerateContentConfig(
        system_instruction="You are BookBuddy, a friendly and knowledgeable book recommendation assistant."
    )
)

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


def search_url_build(query, order_by=None, lg=None, start_index=0, max_results=10, api_key=None):
    base_link = "https://www.googleapis.com/books/v1/volumes"
    params = {
        "q": query,
        "startIndex": start_index,
        "maxResults": max_results
    }

    if order_by:
        params["orderBy"] = order_by
    if lg:
        params["langRestrict"] = lg
    if api_key:
        params["key"] = api_key

    # add all of the parameters to the url for the search.
    from urllib.parse import urlencode
    query_string = urlencode(params)
    full_url = f"{base_link}?{query_string}"

    #returns full url with all the searches
    return full_url



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
    # maybe change the book_id to be in the body of the request

    favorite = Favorite.query.get(user_id)
    if favorite:

        # new_book_list = favorite.to_dict()['book_list_id']['list']
        favorite.book_list_id['list'].append(book_id)

        flag_modified(favorite, 'book_list_id')
        db.session.commit()
        return jsonify({'created': favorite.to_dict()})
    else:
        return jsonify({'error': 'user not found'}), 404

@app.route("/favorites/<int:user_id>/remove/<string:book_id>", methods=["DELETE"])
def remove_book_id_from_favorites(user_id, book_id):
    '''
    Removes a specific book_id from the users favorites list.
    '''
    favorite = Favorite.query.get(user_id)
    if favorite:
        book_list = favorite.book_list_id.get('list', [])
        if book_id in book_list:
            book_list.remove(book_id)
            flag_modified(favorite, 'book_list_id')
            db.session.commit()
            return jsonify({'message': f'Book {book_id} deleted.'})
        else:
            return jsonify({'error': f'Book {book_id} not found in favorites.'}), 404
    else:
        return jsonify({'error': 'user not found'}), 404

    
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
    read_books = ReadBooks.query.get(user_id)
    
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


@app.route("/read_books/<int:user_id>/add/<string:book_id>", methods=["POST"])
def add_book_id_to_read_books(user_id, book_id):
    '''
    The post request does not need body information, the book_id is given in the url of the request
    '''

    read_book = ReadBooks.query.get(user_id)
    if read_book:
        read_book.book_list_id['list'].append(book_id)

        flag_modified(read_book, 'book_list_id')
        db.session.commit()
        return jsonify({'created': read_book.to_dict()})
    else:
        return jsonify({'error': 'user not found'}), 404

@app.route("/read_books/<int:user_id>/remove/<string:book_id>", methods=["DELETE"])
def remove_book_id_from_read_books(user_id, book_id):
    '''
    Removes a specific book_id from the users read books list.
    '''
    read_book = ReadBooks.query.get(user_id)
    if read_book:
        book_list = read_book.book_list_id.get('list', [])
        if book_id in book_list:
            book_list.remove(book_id)
            flag_modified(read_book, 'book_list_id')
            db.session.commit()
            return jsonify({'message': f'Book {book_id} deleted.'})
        else:
            return jsonify({'error': f'Book {book_id} not found in read books.'}), 404
    else:
        return jsonify({'error': 'user not found'}), 404


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
    
@app.route("/want_to_reads/<int:user_id>/add/<string:book_id>", methods=["POST"])
def add_book_id_to_want_to_read(user_id, book_id):
    '''
    The post request does not need body information, the book_id is given in the url of the request
    '''

    want_to_read = WantToRead.query.get(user_id)
    if want_to_read:
        want_to_read.book_list_id['list'].append(book_id)

        flag_modified(want_to_read, 'book_list_id')
        db.session.commit()
        return jsonify({'created': want_to_read.to_dict()})
    else:
        return jsonify({'error': 'user not found'}), 404

@app.route("/want_to_reads/<int:user_id>/remove/<string:book_id>", methods=["DELETE"])
def remove_book_id_from_want_to_read(user_id, book_id):
    '''
    Removes a specific book_id from the users want to read list.
    '''
    want_to_read = WantToRead.query.get(user_id)
    if want_to_read:
        book_list = want_to_read.book_list_id.get('list', [])
        if book_id in book_list:
            book_list.remove(book_id)
            flag_modified(want_to_read, 'book_list_id')
            db.session.commit()
            return jsonify({'message': f'Book {book_id} deleted.'})
        else:
            return jsonify({'error': f'Book {book_id} not found in want to read.'}), 404
    else:
        return jsonify({'error': 'user not found'}), 404

    
#endregion


@app.route("/get_book/<string:book_id>", methods=["GET"])
def get_book_by_id(book_id):
    '''
    Returns a book object from the given book_id the same as the Google Books API.
    '''
    book_request = requests.get(f"https://www.googleapis.com/books/v1/volumes/{book_id}")
    return book_request.json()


#search region
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q')
    order_by = request.args.get('order_by')
    lg = request.args.get('lang')
    page = int(request.args.get('page', 1))
    max_results = 10
    start_index = (page - 1) * max_results

    url = search_url_build(
        query=query,
        order_by=order_by,
        lg=lg,
        start_index=start_index,
        max_results=max_results,
        api_key= os.environ["API_KEY"]
    )

    response = requests.get(url)
    books = response.json().get("items", [])
    return jsonify(books)


@app.route("/api/chat", methods=["POST"])
def chat_endpoint():
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "No message provided"}), 400

        user_message = data["message"]
        
        # Send message to gemini and get response
        response = chat.send_message(user_message)
        
        return jsonify({
            "response": response.text,
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == "__main__":
    app.run(debug=True)

def book_search_title(query):
    spliced = query.lower().split()
    spliced = "+".join(spliced)
    resonse = requests.request("GET",f"https://www.googleapis.com/books/v1/volumes?q=intitle:{spliced}&orderBY=relevance&key={os.environ["API_KEY"]}" )
    return resonse.json()["items"]
