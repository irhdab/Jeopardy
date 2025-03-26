// Quiz questions
const myQuestions = [
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

// DOM elements
const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const submitButton = document.getElementById('submit');
const nextButton = document.getElementById('next');

// Track quiz state
let currentQuestion = 0;
let score = 0;

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
    let output = `<div class="question">${questionData.question}</div>
                 <div class="answers">`;
    
    // Add each answer option
    for (let letter in questionData.answers) {
        output += `
            <label>
                <input type="radio" name="question" value="${letter}">
                ${letter}: ${questionData.answers[letter]}
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
        showResults();
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
        <p>You scored ${score} out of ${myQuestions.length}</p>
        <p>That's ${percentage}%</p>
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

// Event listeners
submitButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', nextQuestion);

// Start the quiz when page loads
window.onload = startQuiz;
