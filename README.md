# BookBuddy

BookBuddy is a digital library web application that allows users to manage their personal book lists, including books they have read, want to read, and their favorites. Users can search for books, get personalized recommendations, and write/read reviews. The app uses the Google Books API and integrates with Gemini AI for chat-based book recommendations.


## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/VU-Applied-Programming-for-AI-2025/hactics-jasp-nerd-omarouaissa-s2486-general-template
cd hactics-jasp-nerd-omarouaissa-s2486-general-template
```

### 2. Install Dependencies
Make sure you have Python 3.8+ and pip installed. Then run:
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file with the following keys:
```
API_KEY=your_google_books_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Application
```bash
python backend/app.py
```
The backend will start on `http://127.0.0.1:5000/` by default.
### FOR TESTING!!
Please reset/delete the old databases before running the tests.
