// Add this to your script.js file

// Function to generate a shareable URL with quiz data
function generateShareableURL() {
    // Create an object with just the essential quiz data
    const quizData = {
        questions: myQuestions.map(q => ({
            question: q.question,
            answers: q.answers,
            correctAnswer: q.correctAnswer
        }))
    };
    
    // Convert the quiz object to a JSON string
    const jsonString = JSON.stringify(quizData);
    
    // Encode the JSON string for URL safety
    const encodedData = encodeURIComponent(jsonString);
    
    // Create URL with the encoded data as a parameter
    const shareableURL = `${window.location.origin}${window.location.pathname}?quiz=${encodedData}`;
    
    return shareableURL;
}

// Function to share the quiz (copy to clipboard)
function shareQuiz() {
    const url = generateShareableURL();
    
    // Check if the URL is too long (browsers have limits)
    if (url.length > 2000) {
        alert("This quiz is too large to share via URL. Consider reducing the number of questions.");
        return;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(url)
        .then(() => {
            alert("Shareable link copied to clipboard!");
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            // Fallback: show the URL for manual copying
            prompt("Copy this link to share your quiz:", url);
        });
}

// Function to load quiz from URL parameters
function loadQuizFromURL() {
    const urlParams = new URL(window.location).searchParams;
    const quizParam = urlParams.get('quiz');
    
    if (quizParam) {
        try {
            // Decode the URL parameter
            const jsonString = decodeURIComponent(quizParam);
            
            // Parse the JSON data
            const quizData = JSON.parse(jsonString);
            
            // Update the quiz questions
            if (quizData.questions && quizData.questions.length > 0) {
                myQuestions = quizData.questions;
                console.log("Quiz loaded from URL:", myQuestions.length, "questions");
                
                // Restart the quiz with the new questions
                currentQuestion = 0;
                score = 0;
                startQuiz();
                
                return true;
            }
        } catch (error) {
            console.error("Error loading quiz from URL:", error);
        }
    }
    
    return false;
}

// Add event listener for the share button
document.addEventListener('DOMContentLoaded', function() {
    const shareButton = document.getElementById('share-quiz');
    if (shareButton) {
        shareButton.addEventListener('click', shareQuiz);
    }
    
    // Try to load quiz from URL when page loads
    loadQuizFromURL();
});


// Wrap all code in DOMContentLoaded to ensure elements are loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // ============== THEME TOGGLE FUNCTIONALITY ==============
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        console.log('Theme toggle found');
        
        // Check for saved theme preference
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
        }
        
        // Handle theme switch
        themeToggle.addEventListener('change', function() {
            console.log('Theme toggled, checked:', this.checked);
            
            if (this.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    } else {
        console.error('Theme toggle not found! Check your HTML ID');
    }
    
    // ============== TAB SWITCHING FUNCTIONALITY ==============
    const takeQuizTab = document.getElementById('take-quiz-tab');
    const createQuizTab = document.getElementById('create-quiz-tab');
    const quizSection = document.getElementById('quiz-section');
    const creatorPanel = document.getElementById('creator-panel');
    
    if (takeQuizTab && createQuizTab && quizSection && creatorPanel) {
        takeQuizTab.addEventListener('click', function() {
            console.log('Take Quiz tab clicked');
            takeQuizTab.classList.add('active');
            createQuizTab.classList.remove('active');
            quizSection.style.display = 'block';
            creatorPanel.style.display = 'none';
        });
        
        createQuizTab.addEventListener('click', function() {
            console.log('Create Quiz tab clicked');
            createQuizTab.classList.add('active');
            takeQuizTab.classList.remove('active');
            quizSection.style.display = 'none';
            creatorPanel.style.display = 'block';
        });
    } else {
        console.error('One or more tab elements not found!');
    }
    
    // ============== QUIZ DATA AND DOM ELEMENTS ==============
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
                console.log('Loaded saved questions:', myQuestions.length);
            }
        } catch (e) {
            console.error('Error loading saved questions:', e);
        }
    }
    
    // Get DOM elements with error handling
    const quizContainer = document.getElementById('quiz');
    const resultsContainer = document.getElementById('results');
    const submitButton = document.getElementById('submit');
    const nextButton = document.getElementById('next');
    
    if (!quizContainer || !resultsContainer || !submitButton || !nextButton) {
        console.error('One or more quiz elements not found!');
        return; // Exit if critical elements are missing
    }
    
    // Quiz creator elements
    const questionText = document.getElementById('question-text');
    const addQuestionBtn = document.getElementById('add-question');
    const updateQuestionBtn = document.getElementById('update-question');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const saveQuizBtn = document.getElementById('save-quiz');
    const questionList = document.getElementById('question-list');
    
    if (!questionText || !addQuestionBtn || !saveQuizBtn || !questionList) {
        console.error('One or more quiz creator elements not found!');
    }
    
    // ============== QUIZ STATE VARIABLES ==============
    let currentQuestion = 0;
    let score = 0;
    let userQuestions = [];
    let currentEditIndex = null;
    let isEditMode = false;
    
    // ============== QUIZ FUNCTIONS ==============
    // Initialize quiz
    function startQuiz() {
        console.log('Starting quiz');
        // Reset variables
        currentQuestion = 0;
        score = 0;
        
        if (myQuestions.length === 0) {
            quizContainer.innerHTML = '<p>No questions available. Please create some questions first!</p>';
            return;
        }
        
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
        if (currentQuestion >= myQuestions.length) {
            console.error('Question index out of bounds');
            return;
        }
        
        const questionData = myQuestions[currentQuestion];
        console.log('Showing question:', currentQuestion + 1);
        
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
        console.log('User answer:', userAnswer, 'Correct answer:', correctAnswer);
        
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
            console.log('Correct! Score:', score);
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
        console.log('Showing results, final score:', score);
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
        console.log('Moving to next question');
        currentQuestion++;
        nextButton.classList.add('hide');
        submitButton.classList.remove('hide');
        showQuestion();
    }
    
    // ============== QUIZ CREATION FUNCTIONS ==============
    // Create or update a question
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
        
        console.log('Processing question:', isEditMode ? 'update' : 'add');
        
        // If in edit mode, update existing question
        if (isEditMode && currentEditIndex !== null) {
            userQuestions[currentEditIndex] = {
                question: question,
                answers: answers,
                correctAnswer: correctAnswer.value
            };
            
            // Exit edit mode
            exitEditMode();
            alert('Question updated!');
        } else {
            // Add new question to array
            userQuestions.push({
                question: question,
                answers: answers,
                correctAnswer: correctAnswer.value
            });
            
            alert('Question added!');
        }
        
        // Clear form
        clearQuestionForm();
        
        // Update question list
        updateQuestionList();
    }
    
    // Edit a question
    function editQuestion(index) {
        if (index < 0 || index >= userQuestions.length) {
            console.error('Invalid question index:', index);
            return;
        }
        
        console.log('Editing question:', index);
        
        // Enter edit mode
        isEditMode = true;
        currentEditIndex = index;
        
        // Get the question to edit
        const questionToEdit = userQuestions[index];
        
        // Populate the form with question data
        questionText.value = questionToEdit.question;
        
        // Set the answer options
        const answerOptions = document.querySelectorAll('.option-text');
        for (let i = 0; i < answerOptions.length; i++) {
            const letter = String.fromCharCode(97 + i); // a, b, c, d
            if (questionToEdit.answers[letter]) {
                answerOptions[i].value = questionToEdit.answers[letter];
            }
        }
        
        // Select the correct answer
        const correctRadio = document.querySelector(`input[name="correct-answer"][value="${questionToEdit.correctAnswer}"]`);
        if (correctRadio) {
            correctRadio.checked = true;
        }
        
        // Update UI to show edit mode
        if (addQuestionBtn) addQuestionBtn.classList.add('hide');
        if (updateQuestionBtn) updateQuestionBtn.classList.remove('hide');
        if (cancelEditBtn) cancelEditBtn.classList.remove('hide');
        
        // Scroll to form
        document.getElementById('question-form').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Exit edit mode
    function exitEditMode() {
        console.log('Exiting edit mode');
        isEditMode = false;
        currentEditIndex = null;
        
        // Clear the form
        clearQuestionForm();
        
        // Update UI to hide edit mode buttons
        if (addQuestionBtn) addQuestionBtn.classList.remove('hide');
        if (updateQuestionBtn) updateQuestionBtn.classList.add('hide');
        if (cancelEditBtn) cancelEditBtn.classList.add('hide');
    }
    
    // Clear the question form
    function clearQuestionForm() {
        if (questionText) questionText.value = '';
        document.querySelectorAll('.option-text').forEach(option => {
            option.value = '';
        });
        document.querySelectorAll('input[name="correct-answer"]').forEach(radio => {
            radio.checked = false;
        });
    }
    
    // Delete a question
    function deleteQuestion(index) {
        if (confirm('Are you sure you want to delete this question?')) {
            console.log('Deleting question:', index);
            userQuestions.splice(index, 1);
            updateQuestionList();
        }
    }
    
    // Update the displayed question list
    function updateQuestionList() {
        if (!questionList) {
            console.error('Question list element not found!');
            return;
        }
        
        if (userQuestions.length === 0) {
            questionList.innerHTML = '<p>No questions added yet.</p>';
            return;
        }
        
        console.log('Updating question list, count:', userQuestions.length);
        
        let output = '<h3>Your Questions:</h3>';
        userQuestions.forEach((q, index) => {
            output += `
                <div class="question-list-item">
                    <span class="question-text">${index + 1}. ${q.question}</span>
                    <div class="question-actions">
                        <button class="edit-btn" onclick="editQuestion(${index})">Edit</button>
                        <button class="delete-btn" onclick="deleteQuestion(${index})">Delete</button>
                    </div>
                </div>
            `;
        });
        
        questionList.innerHTML = output;
        
        // Re-attach event listeners to dynamically created buttons
        document.querySelectorAll('.edit-btn').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                editQuestion(index);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                deleteQuestion(index);
            });
        });
    }
    
    // Save quiz to local storage
    function saveQuiz() {
        if (userQuestions.length === 0) {
            alert('Please add at least one question!');
            return;
        }
        
        console.log('Saving quiz with', userQuestions.length, 'questions');
        
        // Exit edit mode if active
        if (isEditMode) {
            exitEditMode();
        }
        
        // Save to localStorage
        localStorage.setItem('customQuestions', JSON.stringify(userQuestions));
        
        // Update quiz questions
        myQuestions = [...userQuestions];
        
        alert('Quiz saved successfully! Switch to "Take Quiz" tab to try it out.');
        
        // Reset for new quiz creation
        userQuestions = [];
        updateQuestionList();
    }
    
    // ============== EVENT LISTENERS ==============
    // Make functions available globally for inline event handlers
    window.editQuestion = editQuestion;
    window.deleteQuestion = deleteQuestion;
    window.startQuiz = startQuiz;
    
    // Attach event listeners with error handling
    if (submitButton) {
        submitButton.addEventListener('click', checkAnswer);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', nextQuestion);
    }
    
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', addQuestion);
    }
    
    if (updateQuestionBtn) {
        updateQuestionBtn.addEventListener('click', addQuestion); // Reuse addQuestion for updates
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', exitEditMode);
    }
    
    if (saveQuizBtn) {
        saveQuizBtn.addEventListener('click', saveQuiz);
    }
    
    // ============== INITIALIZE THE APP ==============
    updateQuestionList();
    startQuiz();
    
    console.log('Quiz application initialized');
});
