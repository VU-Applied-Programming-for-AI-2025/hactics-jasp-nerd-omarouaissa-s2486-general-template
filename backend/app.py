from flask import Flask, render_template
from flask import Flask, request, jsonify
from google import genai
import os
from dotenv import load_dotenv
# Run website --> python backend/app.py in cmd

load_dotenv()

app = Flask(__name__)

# Start gemini API
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
chat = client.chats.create(model="gemini-2.0-flash")

@app.route("/")
def home():
    return "Welcome to BookBuddy"

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
