// Game State
// Load saved high score
function loadHighScore() {
    return parseInt(localStorage.getItem('spelltutor_highscore') || '0');
}

function saveHighScore(score) {
    const currentHigh = loadHighScore();
    if (score > currentHigh) {
        localStorage.setItem('spelltutor_highscore', score);
        return true; // New record!
    }
    return false;
}
let gameState = {
    playerName: '',
    playerAge: 0,
    currentMode: '',
    currentDifficulty: 'easy',
    score: 0,
    streak: 0,
    bestStreak: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    currentWord: null,
    totalQuestions: 10
};

// API Base URL
const API_URL = '';

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Start Game
function startGame() {
    const name = document.getElementById('playerName').value.trim();
    const age = document.getElementById('playerAge').value;
    
    if (!name || !age) {
        alert('Please enter your name and age! 😊');
        return;
    }
    
    gameState.playerName = name;
    gameState.playerAge = parseInt(age);
    
    document.getElementById('displayName').textContent = name;
    showScreen('menuScreen');
    playSound('success');
}

// Select Game Mode
function selectMode(mode) {
    gameState.currentMode = mode;
    document.querySelectorAll('.mode-card').forEach(card => {
        card.style.border = '3px solid transparent';
    });
    event.target.closest('.mode-card').style.border = '3px solid #667eea';
}

// Select Difficulty
function selectDifficulty(difficulty) {
    if (!gameState.currentMode) {
        alert('Please select a game mode first! 🎮');
        return;
    }
    
    gameState.currentDifficulty = difficulty;
    resetGameStats();
    showScreen('gameScreen');
    loadQuestion();
}

// Reset Game Stats
function resetGameStats() {
    gameState.score = 0;
    gameState.streak = 0;
    gameState.questionsAnswered = 0;
    gameState.correctAnswers = 0;
    gameState.incorrectAnswers = 0;
    
    updateGameUI();
}

// Update Game UI
function updateGameUI() {
    document.getElementById('gameScore').textContent = gameState.score;
    document.getElementById('streak').textContent = gameState.streak;
    document.getElementById('totalScore').textContent = gameState.score;
    
    const progress = (gameState.questionsAnswered / gameState.totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Load Question
async function loadQuestion() {
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.classList.add('hidden');
    document.getElementById('answerInput').value = '';
    
    try {
        if (gameState.currentMode === 'jumbled' || gameState.currentMode === 'spelling') {
            const response = await fetch(`${API_URL}/api/word/random?difficulty=${gameState.currentDifficulty}`);
            const data = await response.json();
            gameState.currentWord = data;
            displayQuestion(data);
        } else if (gameState.currentMode === 'letter') {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            const response = await fetch(`${API_URL}/api/word/letter?letter=${randomLetter}`);
            const data = await response.json();
            gameState.currentWord = {word: data.random, letter: randomLetter};
            displayLetterQuestion(data);
        }
    } catch (error) {
        console.error('Error loading question:', error);
        document.getElementById('questionText').textContent = 'Error loading question';
    }
}

// Display Question
function displayQuestion(data) {
    document.getElementById('emojiDisplay').textContent = data.image || '🎯';
    
    if (gameState.currentMode === 'jumbled') {
        document.getElementById('questionText').textContent = data.jumbled.toUpperCase();
        document.getElementById('hintText').textContent = `💡 Hint: ${data.hint}`;
    } else {
        document.getElementById('questionText').textContent = '❓❓❓';
        document.getElementById('hintText').textContent = `💡 Spell this word: ${data.hint}`;
    }
    
    document.getElementById('answerInput').focus();
}

// Display Letter Question
// Display Letter Question - Show specific word to spell
function displayLetterQuestion(data) {
    const wordToSpell = data.random;
    
    document.getElementById('emojiDisplay').textContent = '📝';
    document.getElementById('questionText').textContent = '_ _ _ _ _'; // Hidden word
    document.getElementById('hintText').textContent = `💡 Spell a word starting with "${data.letter}": ${wordToSpell}`;
    
    // Store the specific word they need to spell
    gameState.currentWord.word = wordToSpell;
    
    document.getElementById('answerInput').focus();
}

// Then use regular validation
async function checkLetterAnswer(answer) {
    return answer.toLowerCase() === gameState.currentWord.word.toLowerCase();
}
// Submit Answer
async function submitAnswer() {
    const answerInput = document.getElementById('answerInput');
    const userAnswer = answerInput.value.trim().toLowerCase();
    
    if (!userAnswer) {
        alert('Please type your answer! ✏️');
        return;
    }
    
    let isCorrect = false;
    
    if (gameState.currentMode === 'letter') {
        // For letter mode, check if answer starts with the letter
        const validWords = await checkLetterAnswer(userAnswer);
        isCorrect = validWords;
    } else {
        isCorrect = userAnswer === gameState.currentWord.word.toLowerCase();
    }
    
    showFeedback(isCorrect, gameState.currentWord.word);
    updateScore(isCorrect);
    
    gameState.questionsAnswered++;
    
    if (gameState.questionsAnswered >= gameState.totalQuestions) {
        setTimeout(() => showResults(), 2000);
    } else {
        setTimeout(() => loadQuestion(), 2000);
    }
}

// Check Letter Answer
// Check Letter Answer - Accept ANY valid word from the list
async function checkLetterAnswer(answer) {
    try {
        const response = await fetch(`${API_URL}/api/word/letter?letter=${gameState.currentWord.letter}`);
        const data = await response.json();
        // Accept any word from the valid words list (case-insensitive)
        const isValid = data.words.some(word => word.toLowerCase() === answer.toLowerCase());
        
        if (isValid) {
            // Update current word to show what they typed was correct
            gameState.currentWord.word = answer;
        }
        
        return isValid;
    } catch {
        return false;
    }
}

// Show Feedback
function showFeedback(isCorrect, correctAnswer) {
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.classList.remove('hidden', 'correct', 'incorrect');
    
    if (isCorrect) {
        feedbackEl.classList.add('correct');
        feedbackEl.innerHTML = `🎉 Excellent! That's correct! <br><strong>${correctAnswer}</strong>`;
        playSound('correct');
        celebrate();
    } else {
        feedbackEl.classList.add('incorrect');
        feedbackEl.innerHTML = `❌ Oops! The correct answer is: <br><strong>${correctAnswer}</strong>`;
        playSound('incorrect');
    }
}

// Update Score
function updateScore(isCorrect) {
    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.streak++;
        
        // Score based on difficulty and streak
        const baseScore = gameState.currentDifficulty === 'easy' ? 10 : 
                         gameState.currentDifficulty === 'medium' ? 20 : 30;
        const streakBonus = gameState.streak > 1 ? gameState.streak * 5 : 0;
        
        gameState.score += baseScore + streakBonus;
        
        if (gameState.streak > gameState.bestStreak) {
            gameState.bestStreak = gameState.streak;
        }
    } else {
        gameState.incorrectAnswers++;
        gameState.streak = 0;
    }
    
    updateGameUI();
}

// Skip Question
function skipQuestion() {
    gameState.questionsAnswered++;
    gameState.streak = 0;
    
    if (gameState.questionsAnswered >= gameState.totalQuestions) {
        showResults();
    } else {
        loadQuestion();
    }
}

// Show Results
function showResults() {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctCount').textContent = gameState.correctAnswers;
    document.getElementById('incorrectCount').textContent = gameState.incorrectAnswers;
    document.getElementById('bestStreak').textContent = gameState.bestStreak;
    
    // Check for new high score
    const isNewRecord = saveHighScore(gameState.score);
    
    // Calculate stars
    const percentage = (gameState.correctAnswers / gameState.totalQuestions) * 100;
    let stars = '⭐';
    if (percentage >= 50) stars = '⭐⭐';
    if (percentage >= 80) stars = '⭐⭐⭐';
    
    // Show special message for new record
    if (isNewRecord) {
        stars += ' 🏆 NEW RECORD!';
    }
    
    document.getElementById('achievementStars').textContent = stars;
    
    showScreen('resultsScreen');
    playSound('complete');
    celebrate();// In showFeedback function, add this line when correct:
if (isCorrect) {
    feedbackEl.classList.add('correct');
    feedbackEl.innerHTML = `🎉 Excellent! That's correct! <br><strong>${correctAnswer}</strong>`;
    playSound('correct');
    celebrate(); // ← Add this
}
}
// Play Again
function playAgain() {
    showScreen('menuScreen');
}

// Back to Menu
function backToMenu() {
    showScreen('menuScreen');
}

// Confetti celebration
function celebrate() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}
// Sound Effects (Simple beep simulation)
// Sound Effects using Web Audio API (no files needed!)
function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
        // Happy ascending notes
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'incorrect') {
        // Descending sad note
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'complete') {
        // Victory fanfare
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.45);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
    }
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('answerInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
    
    document.getElementById('playerName')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('playerAge').focus();
        }
    });
    
    document.getElementById('playerAge')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });
});