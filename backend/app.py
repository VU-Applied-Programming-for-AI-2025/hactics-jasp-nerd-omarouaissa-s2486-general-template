from flask import Flask, render_template
# Run website --> python backend/app.py in cmd


app = Flask(__name__)

@app.route("/")
def home():

    return "Welcome to BookBuddy"

if __name__ == "__main__":
    app.run(debug=True)
