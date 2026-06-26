let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 15;
const maxTime = 15;

const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices-container');
const scoreDisplay = document.getElementById('current-score');
const timerDisplay = document.getElementById('timer-display');
const highScoreDisplay = document.getElementById('high-score-display');
const progressBar = document.getElementById('progress-bar');
const quizBox = document.getElementById('quiz-box');
const resultsBox = document.getElementById('results-box');
const finalScore = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

const startBox = document.getElementById('start-box');
const startBtn = document.getElementById('start-btn');

function decodeHtmlEntities(htmlStr) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = htmlStr;
    return textarea.value;
}
function initAppLayout() {
    const savedHighScore = localStorage.getItem('quizHighScore') || 0;
    highScoreDisplay.textContent = savedHighScore;
    quizBox.classList.add('hidden');
    resultsBox.classList.add('hidden');
    startBox.classList.remove('hidden');
}
 
async function loadQuizData() {
    startBox.classList.add('hidden');
    resultsBox.classList.add('hidden');
    quizBox.classList.remove('hidden');
    
    try {
        questionText.textContent = "Loading trivia questions from API...";
        
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple');
        
        if (!response.ok) throw new Error("Network request failed");
        
        const data = await response.json();
        questions = data.results;
        
        if(questions.length === 0) {
            questionText.textContent = "API rate-limited. Please refresh the page.";
            return;
        }

        currentQuestionIndex = 0;
        score = 0;
        scoreDisplay.textContent = score;
        
        renderQuestion();
    } catch (error) {
    
        console.warn("API offline or blocked. Running fallback local mock system.", error);
        
        questions = [
            {
                question: "Which programming language runs natively inside web browsers?",
                correct_answer: "JavaScript",
                incorrect_answers: ["Python", "Java", "C++"]
            },
            {
                question: "What does DOM stand for in JavaScript?",
                correct_answer: "Document Object Model",
                incorrect_answers: ["Data Object Management", "Digital Ordinance Matrix", "Desktop Operating Mode"]
            },
            {
                question: "Which keyword declares a block-scoped constant variable?",
                correct_answer: "const",
                incorrect_answers: ["let", "var", "def"]
            }
        ];
        
        currentQuestionIndex = 0;
        score = 0;
        scoreDisplay.textContent = score;
        
        renderQuestion();
    }
}

function renderQuestion() {
    clearInterval(timerInterval);
    timeLeft = maxTime;
    timerDisplay.textContent = timeLeft;
    progressBar.style.width = '100%';

    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = decodeHtmlEntities(currentQuestion.question);
    
    const allChoices = [
        ...currentQuestion.incorrect_answers.map(item => decodeHtmlEntities(item)),
        decodeHtmlEntities(currentQuestion.correct_answer)
    ];
    allChoices.sort(() => Math.random() - 0.5);

    choicesContainer.innerHTML = '';
    allChoices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.addEventListener('click', () => processUserSelection(button, choice, currentQuestion.correct_answer));
        choicesContainer.appendChild(button);
    });

    initiateCountdown();
}

function initiateCountdown() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        const percentage = (timeLeft / maxTime) * 100;
        progressBar.style.width = `${percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            highlightCorrectAndMoveOn();
        }
    }, 1000);
}

function processUserSelection(clickedButton, selectedAnswer, correctAnswer) {
    clearInterval(timerInterval);
    
    const buttons = choicesContainer.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true);

    const interpretedCorrectAnswer = decodeHtmlEntities(correctAnswer);

    if (selectedAnswer === interpretedCorrectAnswer) {
        clickedButton.classList.add('correct');
        score += 10;
        scoreDisplay.textContent = score;
    } else {
        clickedButton.classList.add('wrong');
        
        buttons.forEach(btn => {
            if (btn.textContent === interpretedCorrectAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    setTimeout(advanceQuizFlow, 1500);
}

function highlightCorrectAndMoveOn() {
    const buttons = choicesContainer.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true);

    const currentQuestion = questions[currentQuestionIndex];
    const interpretedCorrectAnswer = decodeHtmlEntities(currentQuestion.correct_answer);

    buttons.forEach(btn => {
        if (btn.textContent === interpretedCorrectAnswer) {
            btn.classList.add('correct');
        }
    });

    setTimeout(advanceQuizFlow, 1500);
}

function advanceQuizFlow() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        displayFinalResults();
    }
}

function displayFinalResults() {
    quizBox.classList.add('hidden');
    resultsBox.classList.remove('hidden');
    finalScore.textContent = score;

    const currentHighScore = parseInt(localStorage.getItem('quizHighScore') || '0', 10);
    if (score > currentHighScore) {
        localStorage.setItem('quizHighScore', score);
        highScoreDisplay.textContent = score;
    }
}
startBtn.addEventListener('click', loadQuizData);
restartBtn.addEventListener('click', loadQuizData);

initAppLayout();
