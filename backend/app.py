from flask import Flask, render_template
# Run website --> python backend/app.py in cmd


app = Flask(__name__)

@app.route("/")
def home():

    return "Welcome to BookBuddy"

if __name__ == "__main__":
    app.run(debug=True)

import requests
def book_search_title(query):
    spliced = query.lower().split()
    spliced = "+".join(spliced)
    resonse = requests.request("GET",f"https://www.googleapis.com/books/v1/volumes?q=intitle:{spliced}&orderBY=relevance" )
    return resonse.json()["items"]
