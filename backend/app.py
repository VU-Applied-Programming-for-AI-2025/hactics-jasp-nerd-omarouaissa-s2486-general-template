from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
# Run website --> python backend/app.py in cmd
from tests.book_list import BookList

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookbuddy.db'

db = SQLAlchemy(app)

@app.route("/")
def home():

    return "Welcome to BookBuddy"


@app.route("/favorites/<int:user_id>", methods=["GET"])
def get_favorites(user_id):

    #get from database booklist from user: user_id
    
    booklist = BookList()
    booklist.add_book('Hunger Games')
    return f"here are your favorites: {booklist}"


if __name__ == "__main__":
    app.run(debug=True)
