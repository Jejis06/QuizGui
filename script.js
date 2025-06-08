class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.skippedQuestions = 0;
        this.settings = {
            blankChars: false,
            capitalLetters: false,
            strictTypos: false,
            maxMistakes: 1
        };
        
        // Advanced queue system variables (copied from C++ original)
        this.priorityQueue = [];           // Array of {questionIndex, priority}
        this.isFirstRound = true;          // Flag to check if it's the first round
        this.lastFQuestions = [];          // Queue of last F questions asked
        this.inLastF = new Set();          // Set for O(1) lookup
        this.priorityValue = 1;            // Current priority value (increases over time)
        this.questionsAskedOnce = new Set(); // Track which questions were asked at least once
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Start screen
        document.getElementById('quiz-file').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('start-quiz').addEventListener('click', () => this.startQuiz());
        
        // Settings
        document.getElementById('blank-chars').addEventListener('change', (e) => {
            this.settings.blankChars = e.target.checked;
        });
        document.getElementById('capital-letters').addEventListener('change', (e) => {
            this.settings.capitalLetters = e.target.checked;
        });
        document.getElementById('strict-typos').addEventListener('change', (e) => {
            this.settings.strictTypos = e.target.checked;
        });
        document.getElementById('max-mistakes').addEventListener('change', (e) => {
            this.settings.maxMistakes = parseInt(e.target.value);
        });

        // Quiz screen
        document.getElementById('submit-answer').addEventListener('click', () => this.submitAnswer());
        document.getElementById('answer-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        document.getElementById('skip-question').addEventListener('click', () => this.skipQuestion());
        document.getElementById('exit-quiz').addEventListener('click', () => this.exitQuiz());

        // Results screen
        document.getElementById('restart-quiz').addEventListener('click', () => this.restartQuiz());
        document.getElementById('new-quiz').addEventListener('click', () => this.newQuiz());

        // Drag and drop
        const uploadArea = document.querySelector('.file-upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#667eea';
            uploadArea.style.background = '#edf2f7';
        });
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#cbd5e0';
            uploadArea.style.background = '#f7fafc';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#cbd5e0';
            uploadArea.style.background = '#f7fafc';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseQuestions(content);
        };
        reader.readAsText(file, 'UTF-8');
    }

    parseQuestions(content) {
        const lines = content.split('\n').filter(line => line.trim() !== '');
        this.questions = [];

        // Check for settings in first line
        const firstLine = lines[0].trim();
        const settingsRegex = /^[01]\s+[01]\s+[01]$/;
        let startIndex = 0;

        if (settingsRegex.test(firstLine)) {
            const settings = firstLine.split(/\s+/).map(s => s === '1');
            this.settings.blankChars = settings[0];
            this.settings.capitalLetters = settings[1];
            this.settings.strictTypos = settings[2];
            
            // Update UI toggles
            document.getElementById('blank-chars').checked = settings[0];
            document.getElementById('capital-letters').checked = settings[1];
            document.getElementById('strict-typos').checked = settings[2];
            
            startIndex = 1;
        }

        // Parse questions
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip comments
            if (line.startsWith('//') || line === '') continue;
            
            // Handle multi-word answers (K/ prefix)
            const isMultiWord = line.startsWith('K/');
            const cleanLine = isMultiWord ? line.substring(2).trim() : line;
            
            // Split question and answers
            const parts = cleanLine.split(' -');
            if (parts.length >= 2) {
                const question = parts[0].trim();
                const answersString = parts.slice(1).join(' -');
                
                // Parse multiple answers
                const answers = answersString.split(',').map(answer => answer.trim());
                
                this.questions.push({
                    question: question,
                    answers: answers,
                    isMultiWord: isMultiWord,
                    originalLine: line
                });
            }
        }

        // Update UI
        const uploadArea = document.querySelector('.file-upload-area');
        uploadArea.innerHTML = `
            <i class="fas fa-check-circle" style="color: #38a169;"></i>
            <span style="color: #38a169;">Załadowano ${this.questions.length} pytań</span>
        `;
        
        document.getElementById('start-quiz').disabled = this.questions.length === 0;
        
        if (this.questions.length === 0) {
            this.showFeedback('Nie znaleziono pytań w pliku!', 'error');
        }
    }

    startQuiz() {
        if (this.questions.length === 0) {
            alert('Najpierw wybierz plik z pytaniami!');
            return;
        }

        // Initialize advanced queue system
        this.initializeAdvancedQueue();
        
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.skippedQuestions = 0;
        this.isFirstRound = true;
        this.questionsAskedOnce.clear();
        this.priorityValue = 1;

        // Show quiz screen
        this.showScreen('quiz-screen');
        this.displayQuestion();
    }

    initializeAdvancedQueue() {
        // Shuffle questions for first round
        this.shuffleArray(this.questions);
        
        // Initialize priority queue - all questions start with priority 0
        this.priorityQueue = [];
        for (let i = 0; i < this.questions.length; i++) {
            this.priorityQueue.push({questionIndex: i, priority: 0});
        }
        
        // Initialize F-factor (20% of questions, minimum 1)
        this.F = Math.max(Math.floor(0.2 * (this.questions.length + 1)), 1);
        this.lastFQuestions = [];
        this.inLastF = new Set();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    displayQuestion() {
        // Get next question using advanced queue system
        const questionData = this.getNextQuestion();
        if (!questionData) {
            this.showResults();
            return;
        }
        
        this.currentQuestionIndex = questionData.questionIndex;
        const question = this.questions[this.currentQuestionIndex];
        
        document.getElementById('question-number').textContent = `Pytanie ${this.questionsAskedOnce.size + 1}`;
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('answer-input').value = '';
        document.getElementById('feedback').innerHTML = '';
        document.getElementById('feedback').className = 'feedback';
        
        // Update progress - in advanced mode, progress is based on questions asked at least once
        const totalQuestionsToAsk = this.isFirstRound ? this.questions.length : 0;
        let progress = 0;
        
        if (this.isFirstRound) {
            progress = (this.questionsAskedOnce.size / this.questions.length) * 100;
            document.getElementById('progress-text').textContent = 
                `1. runda: ${this.questionsAskedOnce.size} z ${this.questions.length}`;
        } else {
            // In round mode, show different progress indicator
            document.getElementById('progress-text').textContent = 
                `Tryb powtórki - Wynik: ${this.score}`;
            progress = 100; // Always full in round mode
        }
        
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        // Update score
        document.getElementById('current-score').textContent = this.score;
        
        // Focus input
        document.getElementById('answer-input').focus();
    }

    getNextQuestion() {
        if (this.isFirstRound) {
            // First round: go through all questions in shuffled order
            if (this.questionsAskedOnce.size >= this.questions.length) {
                // All questions asked at least once, check if all were correct
                if (this.score === this.questions.length) {
                    // Perfect score! Ask user if they want to continue
                    if (confirm('Brawo! Odpowiedziałeś dobrze na wszystkie pytania za pierwszym razem.\nCzy chcesz kontynuować w trybie powtórki?')) {
                        this.initializeRoundMode();
                        return this.getNextQuestionFromQueue();
                    } else {
                        return null; // End quiz
                    }
                } else {
                    // Start round mode for questions that were wrong
                    this.initializeRoundMode();
                    return this.getNextQuestionFromQueue();
                }
            }
            
            // Find next unasked question
            for (let i = 0; i < this.questions.length; i++) {
                if (!this.questionsAskedOnce.has(i)) {
                    return {questionIndex: i};
                }
            }
        } else {
            // Round mode: use priority queue
            return this.getNextQuestionFromQueue();
        }
        
        return null;
    }

    initializeRoundMode() {
        this.isFirstRound = false;
        console.log("Już wszystkie pytania były zadane przynajmniej raz. Rozpoczynanie trybu powtórki...");
        
        // Initialize priority queue with questions that need review
        this.priorityQueue = [];
        for (let i = 0; i < this.questions.length; i++) {
            this.priorityQueue.push({questionIndex: i, priority: 0});
        }
        
        // Sort by priority (ascending - lowest priority first)
        this.priorityQueue.sort((a, b) => a.priority - b.priority);
    }

    getNextQuestionFromQueue() {
        if (this.priorityQueue.length === 0) {
            return null;
        }

        // Find a question that wasn't asked in the last F questions
        let selectedIndex = -1;
        const tempStack = [];

        // Use stack approach like in C++ to find valid question
        while (selectedIndex === -1 && this.priorityQueue.length > 0) {
            const candidate = this.priorityQueue.shift(); // Remove from front (lowest priority)
            
            if (!this.inLastF.has(candidate.questionIndex) || this.priorityQueue.length === 0) {
                selectedIndex = candidate.questionIndex;
                // Don't put this back in queue yet, it will be added after processing
                tempStack.push(candidate);
                break;
            } else {
                tempStack.push(candidate);
            }
        }

        // Put back all elements we removed while searching
        this.priorityQueue = tempStack.concat(this.priorityQueue);
        
        if (selectedIndex === -1) {
            return null;
        }

        return {questionIndex: selectedIndex};
    }

    submitAnswer() {
        const userAnswer = document.getElementById('answer-input').value.trim();
        if (userAnswer === '') {
            this.showFeedback('Wpisz odpowiedź!', 'info');
            return;
        }

        // Check for exit command
        if (userAnswer.toLowerCase() === 'e') {
            this.exitQuiz();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        // Mark this question as asked at least once
        this.questionsAskedOnce.add(this.currentQuestionIndex);
        
        // Update F-factor queue (manage last F questions)
        this.updateLastFQuestions(this.currentQuestionIndex);
        
        const checkResult = this.checkAnswerAdvanced(userAnswer, question);
        
        if (checkResult.isCorrect) {
            this.score++;
            this.correctAnswers++;
            this.showFeedback('✅ Poprawna odpowiedź!', 'correct');
            
            // Update priority for correct answer
            this.updateQuestionPriority(this.currentQuestionIndex, true);
            
                         // Check if this was perfect first round
             if (this.isFirstRound && this.score === this.questions.length && this.questionsAskedOnce.size === this.questions.length) {
                 setTimeout(() => {
                     this.displayQuestion(); // This will trigger the perfect score logic
                 }, 1000);
                 return;
             }
        } else {
            this.wrongAnswers++;
            
            // Show detailed feedback for wrong answers
            let feedbackMsg = '❌ Niepoprawna odpowiedź.';
            if (checkResult.feedback) {
                feedbackMsg += ` ${checkResult.feedback}`;
            }
            const correctAnswersText = question.answers.join(' / ');
            feedbackMsg += ` Poprawne odpowiedzi: ${correctAnswersText}`;
            
            this.showFeedback(feedbackMsg, 'incorrect');
            
            // In first round, decrease score but don't go below 0
            if (this.isFirstRound) {
                this.score = Math.max(0, this.score - 1);
            } else {
                this.score--;
            }
            
            // Add question back to priority queue for repetition
            this.addQuestionToPriorityQueue(this.currentQuestionIndex);
        }

        // Show undo option for wrong answers
        this.showUndoOption(checkResult.isCorrect);
    }

    showUndoOption(wasCorrect) {
        if (!wasCorrect) {
            const feedback = document.getElementById('feedback');
            const undoHint = document.createElement('div');
            undoHint.style.marginTop = '10px';
            undoHint.style.fontSize = '0.9rem';
            undoHint.style.opacity = '0.8';
            undoHint.innerHTML = 'Wpisz <strong>"."</strong> aby cofnąć (jeśli odpowiedź była poprawna)';
            feedback.appendChild(undoHint);
            
            // Set up undo listener
            const answerInput = document.getElementById('answer-input');
            answerInput.value = '';
            answerInput.placeholder = 'Wpisz "." aby cofnąć lub naciśnij Enter...';
            
            const undoHandler = (e) => {
                if (e.key === 'Enter') {
                    const value = answerInput.value.trim();
                    if (value === '.') {
                        // Undo the wrong answer
                        this.score++;
                        this.wrongAnswers--;
                        this.correctAnswers++;
                        this.updateQuestionPriority(this.currentQuestionIndex, true);
                        this.showFeedback('✅ Odpowiedź cofnięta - zaliczono jako poprawną!', 'correct');
                        
                                                 setTimeout(() => {
                             this.nextQuestion();
                         }, 800);
                    } else {
                        this.nextQuestion();
                    }
                    answerInput.removeEventListener('keypress', undoHandler);
                    answerInput.placeholder = 'Wpisz swoją odpowiedź...';
                }
            };
            
            answerInput.addEventListener('keypress', undoHandler);
            
                         // Auto-proceed after 3 seconds if no undo
             setTimeout(() => {
                 if (answerInput.placeholder.includes('cofnąć')) {
                     answerInput.removeEventListener('keypress', undoHandler);
                     answerInput.placeholder = 'Wpisz swoją odpowiedź...';
                     this.nextQuestion();
                 }
             }, 3000);
                 } else {
             // Move to next question after delay for correct answers
             setTimeout(() => {
                 this.nextQuestion();
             }, 1000);
         }
    }

    updateLastFQuestions(questionIndex) {
        // Add to last F questions
        this.lastFQuestions.push(questionIndex);
        this.inLastF.add(questionIndex);
        
        // Remove oldest if we exceed F
        if (this.lastFQuestions.length > this.F) {
            const removed = this.lastFQuestions.shift();
            this.inLastF.delete(removed);
        }
    }

    updateQuestionPriority(questionIndex, isCorrect) {
        if (!this.isFirstRound) {
            // Find and update priority in queue
            const queueItem = this.priorityQueue.find(item => item.questionIndex === questionIndex);
            if (queueItem && isCorrect) {
                queueItem.priority += this.priorityValue++;
                // Re-sort the queue
                this.priorityQueue.sort((a, b) => a.priority - b.priority);
            }
        }
    }

    addQuestionToPriorityQueue(questionIndex) {
        if (this.isFirstRound) {
            // Add to priority queue for later rounds
            this.priorityQueue.push({questionIndex: questionIndex, priority: 0});
        }
        // If already in round mode, question is already in queue and will be processed again
    }

    checkAnswerAdvanced(userAnswer, question) {
        // Enhanced version of checkAnswer that provides more detailed feedback
        const answers = question.answers;
        let bestMatch = null;
        let feedback = '';
        
        // For K/ questions (multi-word answers)
        if (question.isMultiWord) {
            return this.checkMultiWordAnswer(userAnswer, question);
        }
        
        // Regular answer checking
        for (let correctAnswer of answers) {
            if (this.compareAnswers(userAnswer, correctAnswer, question)) {
                return {isCorrect: true, feedback: ''};
            }
        }
        
        return {isCorrect: false, feedback: feedback};
    }

    checkMultiWordAnswer(userAnswer, question) {
        const userWords = this.divideIntoWords(userAnswer);
        const correctWords = [];
        
        // Flatten all possible correct answers
        for (let answer of question.answers) {
            correctWords.push(...this.divideIntoWords(answer));
        }
        
        const notCorrect = [];
        const notPresent = [...correctWords];
        const matched = new Set();
        
        // Check each user word against correct words
        for (let userWord of userWords) {
            let found = false;
            for (let i = 0; i < notPresent.length; i++) {
                if (!matched.has(i) && this.compareAnswers(userWord, notPresent[i], question)) {
                    matched.add(i);
                    notPresent.splice(i, 1);
                    found = true;
                    break;
                }
            }
            if (!found) {
                notCorrect.push(userWord);
            }
        }
        
        let feedback = '';
        if (notPresent.length > 0) {
            feedback += `Brakuje: ${notPresent.join(', ')}. `;
        }
        if (notCorrect.length > 0) {
            feedback += `Źle: ${notCorrect.join(', ')}. `;
        }
        
        const isCorrect = notPresent.length === 0 && notCorrect.length === 0;
        const isPartiallyCorrect = notPresent.length < correctWords.length;
        
        return {
            isCorrect: isCorrect,
            feedback: feedback.trim(),
            isPartial: isPartiallyCorrect
        };
    }

    divideIntoWords(text) {
        return text.split(',').map(word => word.trim()).filter(word => word.length > 0);
    }

    checkAnswer(userAnswer, question) {
        for (let correctAnswer of question.answers) {
            if (this.compareAnswers(userAnswer, correctAnswer, question)) {
                return true;
            }
        }
        return false;
    }

    compareAnswers(userAnswer, correctAnswer, question) {
        let user = userAnswer;
        let correct = correctAnswer;

        // Handle blank characters
        if (!this.settings.blankChars) {
            user = user.replace(/\s+/g, ' ').trim();
            correct = correct.replace(/\s+/g, ' ').trim();
        }

        // Handle capital letters
        if (!this.settings.capitalLetters) {
            user = user.toLowerCase();
            correct = correct.toLowerCase();
        }

        // Exact match
        if (user === correct) {
            return true;
        }

        // Handle typos if not strict and no numbers in answer
        if (!this.settings.strictTypos && !this.hasNumbers(correct)) {
            return this.checkTypos(user, correct);
        }

        return false;
    }

    hasNumbers(text) {
        return /\d/.test(text);
    }

    checkTypos(userAnswer, correctAnswer) {
        // Simple Levenshtein distance implementation
        const distance = this.levenshteinDistance(userAnswer, correctAnswer);
        return distance <= this.settings.maxMistakes;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[len2][len1];
    }

    skipQuestion() {
        this.skippedQuestions++;
        const question = this.questions[this.currentQuestionIndex];
        
        // Mark as asked at least once
        this.questionsAskedOnce.add(this.currentQuestionIndex);
        
        // Update F-factor queue
        this.updateLastFQuestions(this.currentQuestionIndex);
        
        // Add back to priority queue for repetition
        this.addQuestionToPriorityQueue(this.currentQuestionIndex);
        
        const correctAnswersText = question.answers.join(' / ');
        this.showFeedback(`⏭️ Pytanie pominięte. Poprawne odpowiedzi: ${correctAnswersText}`, 'info');
        
        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    }

    nextQuestion() {
        // In advanced queue system, displayQuestion() handles getting the next question
        this.displayQuestion();
    }

    exitQuiz() {
        if (confirm('Czy na pewno chcesz zakończyć quiz?')) {
            this.showResults();
        }
    }

    showResults() {
        this.showScreen('results-screen');
        
        const totalQuestions = this.questionsAskedOnce.size || this.questions.length;
        let percentage = 0;
        
        if (this.isFirstRound) {
            // First round: percentage based on questions asked at least once
            percentage = totalQuestions > 0 ? Math.round((this.score / totalQuestions) * 100) : 0;
        } else {
            // Round mode: show current score vs total questions in database
            percentage = this.questions.length > 0 ? Math.round((this.score / this.questions.length) * 100) : 0;
        }
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('total-questions').textContent = totalQuestions;
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('correct-answers').textContent = this.correctAnswers;
        document.getElementById('wrong-answers').textContent = this.wrongAnswers;
        document.getElementById('skipped-questions').textContent = this.skippedQuestions;

        // Update results title based on mode
        const resultsTitle = document.querySelector('#results-screen h1');
        if (this.isFirstRound) {
            resultsTitle.textContent = 'Pierwsza runda zakończona!';
        } else {
            resultsTitle.textContent = 'Sesja treningowa zakończona!';
        }

        // Set result icon and percentage color based on score
        const resultsIcon = document.getElementById('results-icon');
        const percentageElement = document.getElementById('score-percentage');
        
        if (percentage >= 90) {
            resultsIcon.className = 'fas fa-trophy';
            resultsIcon.style.color = '#ffd700';
            percentageElement.style.background = '#c6f6d5';
            percentageElement.style.color = '#22543d';
        } else if (percentage >= 70) {
            resultsIcon.className = 'fas fa-medal';
            resultsIcon.style.color = '#38a169';
            percentageElement.style.background = '#bee3f8';
            percentageElement.style.color = '#2a4365';
        } else {
            resultsIcon.className = 'fas fa-handshake';
            resultsIcon.style.color = '#3182ce';
            percentageElement.style.background = '#fed7d7';
            percentageElement.style.color = '#c53030';
        }
    }

    restartQuiz() {
        // Reset quiz with advanced queue system
        this.initializeAdvancedQueue();
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.skippedQuestions = 0;
        this.isFirstRound = true;
        this.questionsAskedOnce.clear();
        this.priorityValue = 1;
        this.lastFQuestions = [];
        this.inLastF.clear();
        
        this.showScreen('quiz-screen');
        this.displayQuestion();
    }

    newQuiz() {
        this.questions = [];
        this.showScreen('start-screen');
        
        // Reset file input
        document.getElementById('quiz-file').value = '';
        document.querySelector('.file-upload-area').innerHTML = `
            <i class="fas fa-upload"></i>
            <span>Kliknij aby wybrać plik lub przeciągnij tutaj</span>
        `;
        document.getElementById('start-quiz').disabled = true;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
    }
}

// Tutorial functions
function toggleTutorial() {
    const content = document.getElementById('tutorial-content');
    const arrow = document.getElementById('tutorial-arrow');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        arrow.classList.remove('rotated');
    } else {
        content.classList.add('expanded');
        arrow.classList.add('rotated');
    }
}

function downloadSampleQuiz() {
    const sampleContent = `0 0 1
// Przykładowy quiz - Historia Polski
Kto był pierwszym królem Polski? -Bolesław Chrobry
W którym roku Polska odzyskała niepodległość? -1918
Która bitwa miała miejsce w 1410 roku? -Grunwald, bitwa pod Grunwaldem
K/ Wymień trzy największe miasta Polski -Warszawa, Kraków, Wrocław
Kto napisał "Pan Tadeusz"? -Adam Mickiewicz
W którym wieku żył Mikołaj Kopernik? -XV, XVI, 15, 16
// Pytania o geografię
Która rzeka przepływa przez Warszawę? -Wisła
Jak nazywa się najwyższy szczyt w Polsce? -Rysy
K/ Wymień trzy polskie morza -Bałtyckie
Które województwo graniczy z Niemcami? -zachodniopomorskie, lubuskie, dolnośląskie
// Pytania kulturowe
Kto skomponował "Mazurka Dąbrowskiego"? -Józef Wybicki
Który polski film zdobył Oscara? -Ida
K/ Wymień polskich noblistów -Henryk Sienkiewicz, Czesław Miłosz, Wisława Szymborska`;

    const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'przykładowy_quiz.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
}); 