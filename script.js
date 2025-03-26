// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
}

// Handle theme switch
themeToggle.addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
});

// Tab switching functionality
const takeQuizTab = document.getElementById('take-quiz-tab');
const createQuizTab = document.getElementById('create-quiz-tab');
const quizSection = document.getElementById('quiz-section');
const creatorPanel = document.getElementById('creator-panel');

takeQuizTab.addEventListener('click', function() {
    takeQuizTab.classList.add('active');
    createQuizTab.classList.remove('active');
    quizSection.style.display = 'block';
    creatorPanel.style.display = 'none';
});

createQuizTab.addEventListener('click', function() {
    createQuizTab.classList.add('active');
    takeQuizTab.classList.remove('active');
    quizSection.style.display = 'none';
    creatorPanel.style.display = 'block';
});

// Default quiz questions
let myQuestions = [
    {
        question: "What is 2 + 2?",
        answers: {
            a: "3",
            b: "4",
            c: "5",
            d: "6"
        },
        correctAnswer: "b"
    },
    {
        question: "What is the capital of France?",
        answers: {
            a: "London",
            b: "Berlin",
            c: "Paris",
            d: "Madrid"
        },
        correctAnswer: "c"
    },
    {
        question: "What does HTML stand for?",
        answers: {
            a: "Hyper Text Markup Language",
            b: "High Tech Modern Language",
            c: "Hyper Transfer Method Language",
            d: "Home Tool Markup Language"
        },
        correctAnswer: "a"
    }
];

// Load saved questions if they exist
if (localStorage.getItem('customQuestions')) {
    try {
        const savedQuestions = JSON.parse(localStorage.getItem('customQuestions'));
        if (savedQuestions && savedQuestions.length > 0) {
            myQuestions = savedQuestions;
        }
    } catch (e) {
        console.error('Error loading saved questions:', e);
    }
}

// DOM elements
const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const submitButton = document.getElementById('submit');
const nextButton = document.getElementById('next');

// Quiz creator elements
const questionText = document.getElementById('question-text');
const addQuestionBtn = document.getElementById('add-question');
const saveQuizBtn = document.getElementById('save-quiz');
const questionList = document.getElementById('question-list');

// Track quiz state
let currentQuestion = 0;
let score = 0;
let userQuestions = [];

// Initialize quiz
function startQuiz() {
    // Reset variables
    currentQuestion = 0;
    score = 0;
    
    // Hide results, show quiz
    resultsContainer.classList.add('hide');
    quizContainer.classList.remove('hide');
    submitButton.classList.remove('hide');
    nextButton.classList.add('hide');
    
    // Show first question
    showQuestion();
}

// Display current question
function showQuestion() {
    const questionData = myQuestions[currentQuestion];
    
    // Create output HTML
    let output = `
        <div class="question-number">Question ${currentQuestion + 1} of ${myQuestions.length}</div>
        <div class="question">${questionData.question}</div>
        <div class="answers">`;
    
    // Add each answer option
    for (let letter in questionData.answers) {
        output += `
            <label>
                <input type="radio" name="question" value="${letter}">
                ${letter.toUpperCase()}: ${questionData.answers[letter]}
            </label>
        `;
    }
    
    output += '</div>';
    
    // Update the quiz container
    quizContainer.innerHTML = output;
}

// Check the selected answer
function checkAnswer() {
    // Get selected answer
    const answerContainer = quizContainer.querySelector('.answers');
    const selectedOption = answerContainer.querySelector(`input[name="question"]:checked`);
    
    // If no answer selected, alert and exit
    if (!selectedOption) {
        alert('Please select an answer!');
        return false;
    }
    
    const userAnswer = selectedOption.value;
    const correctAnswer = myQuestions[currentQuestion].correctAnswer;
    
    // Apply classes for styling
    answerContainer.querySelectorAll('label').forEach(label => {
        const input = label.querySelector('input');
        if (input.value === correctAnswer) {
            label.classList.add('correct');
        } else if (input.value === userAnswer) {
            label.classList.add('incorrect');
        }
    });
    
    // Update score if correct
    if (userAnswer === correctAnswer) {
        score++;
    }
    
    // Disable all options
    answerContainer.querySelectorAll('input').forEach(input => {
        input.disabled = true;
    });
    
    // Hide submit, show next (or show results if last question)
    submitButton.classList.add('hide');
    
    if (currentQuestion < myQuestions.length - 1) {
        nextButton.classList.remove('hide');
    } else {
        setTimeout(showResults, 1000);
    }
    
    return true;
}

// Show final results
function showResults() {
    quizContainer.classList.add('hide');
    nextButton.classList.add('hide');
    resultsContainer.classList.remove('hide');
    
    // Calculate percentage
    const percentage = Math.round((score / myQuestions.length) * 100);
    
    resultsContainer.innerHTML = `
        <h2>Quiz Results</h2>
        <p>You scored:</p>
        <div class="score-highlight">${score} out of ${myQuestions.length} (${percentage}%)</div>
        <button onclick="startQuiz()">Restart Quiz</button>
    `;
}

// Go to next question
function nextQuestion() {
    currentQuestion++;
    nextButton.classList.add('hide');
    submitButton.classList.remove('hide');
    showQuestion();
}

// Create a new question
function addQuestion() {
    const question = questionText.value.trim();
    if (!question) {
        alert('Please enter a question!');
        return;
    }
    
    const answerOptions = document.querySelectorAll('.option-text');
    const answers = {};
    let allOptionsValid = true;
    
    answerOptions.forEach((option, index) => {
        const letter = String.fromCharCode(97 + index); // a, b, c, d
        const text = option.value.trim();
        if (!text) {
            allOptionsValid = false;
        }
        answers[letter] = text;
    });
    
    if (!allOptionsValid) {
        alert('Please fill in all answer options!');
        return;
    }
    
    const correctAnswer = document.querySelector('input[name="correct-answer"]:checked');
    if (!correctAnswer) {
        alert('Please select a correct answer!');
        return;
    }
    
    // Add question to array
    userQuestions.push({
        question: question,
        answers: answers,
        correctAnswer: correctAnswer.value
    });
    
    // Clear form
    questionText.value = '';
    answerOptions.forEach(option => {
        option.value = '';
    });
    document.querySelectorAll('input[name="correct-answer"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Update question list
    updateQuestionList();
    
    alert('Question added!');
}

// Update the displayed question list
function updateQuestionList() {
    if (userQuestions.length === 0) {
        questionList.innerHTML = '<p>No questions added yet.</p>';
        return;
    }
    
    let output = '<h3>Your Questions:</h3><ul>';
    userQuestions.forEach((q, index) => {
        output += `<li>${index + 1}. ${q.question}</li>`;
    });
    output += '</ul>';
    
    questionList.innerHTML = output;
}

// Save quiz to local storage
function saveQuiz() {
    if (userQuestions.length === 0) {
        alert('Please add at least one question!');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('customQuestions', JSON.stringify(userQuestions));
    
    // Update quiz questions
    myQuestions = userQuestions;
    
    alert('Quiz saved successfully! Switch to "Take Quiz" tab to try it out.');
    
    // Reset for new quiz creation
    userQuestions = [];
    updateQuestionList();
}

// Event listeners
submitButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', nextQuestion);
addQuestionBtn.addEventListener('click', addQuestion);
saveQuizBtn.addEventListener('click', saveQuiz);

// Initialize the app
updateQuestionList();
startQuiz();
