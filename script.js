let items = [];
let currentMode = '';
let score = 0;

// Fetch the items data from a local JSON file and initialize the game
fetch('assets/items.json')
    .then(response => response.json())
    .then(data => {
        items = data;
        init();
    });

/**
 * Initializes the game by setting up event listeners for buttons and handling mode selection.
 */
function init() {
    const easyModeBtn = document.getElementById('easy-mode');
    const hardModeBtn = document.getElementById('hard-mode');
    const gameArea = document.getElementById('game-area');
    const modeSelection = document.getElementById('mode-selection');
    const gameOver = document.getElementById('game-over');
    const playAgainBtn = document.getElementById('play-again');

    // Set event listeners for Easy and Hard mode buttons
    easyModeBtn.addEventListener('click', () => startGame('easy'));
    hardModeBtn.addEventListener('click', () => startGame('hard'));
    playAgainBtn.addEventListener('click', resetGame);

    /**
     * Starts the game by setting the mode and preparing the game area.
     * @param {string} mode - The difficulty level of the game ('easy' or 'hard').
     */
    function startGame(mode) {
        console.log("Starting game in mode:", mode);
        currentMode = mode; // Set the game mode (easy/hard)
        console.log("Current mode set to:", currentMode);
        
        // Hide mode selection screen and show the game area
        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('game-over').style.display = 'none';
        
        score = 0; // Reset score
        updateScore(); // Display updated score
        nextQuestion(); // Load the first question
    }

    /**
     * Resets the game to its initial state when the "Play Again" button is clicked.
     */
    function resetGame() {
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('mode-selection').style.display = 'flex';
        document.getElementById('game-area').style.display = 'none';
        score = 0; // Reset score to zero
        updateScore(); // Update the score display
    }
}

/**
 * Loads the next question based on the current game mode (easy or hard).
 */
function nextQuestion() {
    const itemDisplay = document.getElementById('item-display');
    const optionsContainer = document.getElementById('options-container');

    // Clear previous question and options
    itemDisplay.innerHTML = '';
    optionsContainer.innerHTML = '';

    if (currentMode === 'easy') {
        let correctItem, correctOption;
        
        // Fetch a valid random item and option for the question
        do {
            correctItem = getRandomItem();
            correctOption = getRandomOption(correctItem);
        } while (correctOption === null);

        // Generate a set of options including the correct one
        const options = [correctOption];
        while (options.length < 3) {
            let newOption;
            do {
                newOption = getRandomOption(getRandomItem());
            } while (newOption === null || options.includes(newOption));
            options.push(newOption);
        }
        shuffleArray(options); // Randomize the options for display

        // Display the image and name of the correct item
        itemDisplay.innerHTML = `<img src="./assets/${correctItem.icon}" alt="${correctItem.name}">
                                 <h2>${formatItemName(correctItem.name)}</h2>`;

        // Create clickable options for the user to choose from
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => checkAnswer(option === correctOption, optionElement));
            optionsContainer.appendChild(optionElement);
        });
    } else if (currentMode === 'hard') {
        let correctItem, correctOption;

        // Fetch a valid random item and option for the hard mode question
        do {
            correctItem = getRandomItem();
            correctOption = getRandomOption(correctItem);
        } while (correctOption === null);

        // Generate a set of item options including the correct one
        const itemOptions = [correctItem];
        while (itemOptions.length < 3) {
            const newItem = getRandomItem();
            if (!itemOptions.includes(newItem) && getRandomOption(newItem) !== null) {
                itemOptions.push(newItem);
            }
        }
        shuffleArray(itemOptions); // Randomize item options

        // In hard mode, display the correct option (value) instead of the item image
        itemDisplay.innerHTML = `<h2>${correctOption}</h2>`;

        // Create clickable item options for the user to select
        itemOptions.forEach(item => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.innerHTML = `<img src="./assets/${item.icon}" alt="${item.name}">
                                       <p>${formatItemName(item.name)}</p>`;
            optionElement.addEventListener('click', () => checkAnswer(item === correctItem, optionElement));
            optionsContainer.appendChild(optionElement);
        });
    }
}

/**
 * Selects a random item from the items list.
 * @returns {Object} Randomly selected item.
 */
function getRandomItem() {
    return items[Math.floor(Math.random() * items.length)];
}

/**
 * Selects a random valid option (value) from an item, excluding invalid options.
 * @param {Object} item - The item from which to extract an option.
 * @returns {string|null} A random valid option, or null if no valid options exist.
 */
function getRandomOption(item) {
    const options = Object.entries(item).filter(([key, value]) => 
        key !== 'name' && key !== 'icon' && value !== 'N.A' && value !== '' && value !== 'N/A'
    );
    if (options.length === 0) return null;
    const [selectedKey, selectedValue] = options[Math.floor(Math.random() * options.length)];
    return selectedValue;
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} array - The array to shuffle.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Handles checking the user's answer and provides feedback.
 * @param {boolean} isCorrect - Indicates whether the selected answer is correct.
 * @param {HTMLElement} selectedElement - The DOM element representing the selected option.
 */
function checkAnswer(isCorrect, selectedElement) {
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const gameoverSound = document.getElementById('gameover-sound');

    if (isCorrect) {
        score++; // Increment score on correct answer
        updateScore(); // Update the score display
        selectedElement.classList.add('correct');
        correctSound.play();  // Play correct answer sound
        setTimeout(() => {
            selectedElement.classList.remove('correct');
            nextQuestion();  // Load the next question after a delay
        }, 1000);
    } else {
        selectedElement.classList.add('wrong');
        wrongSound.play();  // Play incorrect answer sound
        setTimeout(() => {
            gameoverSound.play(); // Play game over sound
            gameOver(); // Trigger game over
        }, 1000);
    }
}

/**
 * Updates the score display on the UI.
 */
function updateScore() {
    document.getElementById('score-value').textContent = score;
}

/**
 * Formats an item's name by replacing underscores with spaces.
 * @param {string} name - The item name to format.
 * @returns {string} The formatted item name.
 */
function formatItemName(name) {
    return name.replace(/_/g, ' ');
}

/**
 * Displays the game over screen and shows the final score.
 */
function gameOver() {
    const gameArea = document.getElementById('game-area');
    const gameOverScreen = document.getElementById('game-over');
    const finalScore = document.getElementById('final-score');

    gameArea.style.display = 'none';
    gameOverScreen.style.display = 'block';
    finalScore.textContent = score;
}
