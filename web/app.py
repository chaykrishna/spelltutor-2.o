from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import random
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Load word database
def load_words():
    data_path = Path(__file__).parent.parent / 'data' / 'words.json'
    with open(data_path, 'r', encoding='utf-8') as f:
        return json.load(f)

words_db = load_words()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/word/random', methods=['GET'])
def get_random_word():
    """Get a random word for spelling practice"""
    difficulty = request.args.get('difficulty', 'easy')
    
    if difficulty in words_db and isinstance(words_db[difficulty], list):
        word_data = random.choice(words_db[difficulty])
        return jsonify(word_data)
    
    return jsonify({"error": "Invalid difficulty"}), 400

@app.route('/api/word/letter', methods=['GET'])
def get_word_by_letter():
    """Get words starting with a specific letter"""
    letter = request.args.get('letter', 'A').upper()
    
    if letter in words_db.get('letterToSpellings', {}):
        words = words_db['letterToSpellings'][letter]
        return jsonify({
            "letter": letter,
            "words": words,
            "random": random.choice(words)
        })
    
    return jsonify({"error": "Invalid letter"}), 400

@app.route('/api/check/spelling', methods=['POST'])
def check_spelling():
    """Check if the spelling is correct"""
    data = request.json
    user_answer = data.get('answer', '').lower().strip()
    correct_answer = data.get('correct', '').lower().strip()
    
    is_correct = user_answer == correct_answer
    
    return jsonify({
        "correct": is_correct,
        "userAnswer": user_answer,
        "correctAnswer": correct_answer
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get word count statistics"""
    stats = {
        "easy": len(words_db.get('easy', [])),
        "medium": len(words_db.get('medium', [])),
        "hard": len(words_db.get('hard', [])),
        "letters": len(words_db.get('letterToSpellings', {}))
    }
    return jsonify(stats)

@app.route('/api/leaderboard', methods=['GET', 'POST'])
def leaderboard():
    """Simple leaderboard (in-memory for now)"""
    # This would connect to a database in production
    if request.method == 'POST':
        data = request.json
        # Save score logic here
        return jsonify({"success": True})
    
    # Return mock leaderboard
    return jsonify({
        "topScores": [
            {"name": "Champion", "score": 1000, "level": "Expert"},
            {"name": "StarLearner", "score": 850, "level": "Advanced"},
            {"name": "WordWizard", "score": 720, "level": "Intermediate"}
        ]
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)