from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
# Run website --> python backend/app.py in cmd

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookbuddy.db'

db = SQLAlchemy(app)

class Favorite(db.Model):
    # id = db.Column(db.Integer, primary_key=True)
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
        return jsonify({"message": f"no favorites found for user: {user_id}"}), 404


@app.route("/favorites", methods=["POST"])
def post_favorites():
    data = request.get_json()
    
    new_favorite = Favorite(user=data["user"], book_list_id=data["book_list_id"])

    db.session.add(new_favorite)
    db.session.commit()

    return jsonify(new_favorite.to_dict()), 201


if __name__ == "__main__":
    app.run(debug=True)
