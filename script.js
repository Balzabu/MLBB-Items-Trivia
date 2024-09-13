let items = [];
let currentMode = '';
let score = 0;

// Fetch items data
fetch('assets/items.json')
    .then(response => response.json())
    .then(data => {
        items = data;
        init();
    });

function init() {
    const easyModeBtn = document.getElementById('easy-mode');
    const hardModeBtn = document.getElementById('hard-mode');
    const gameArea = document.getElementById('game-area');
    const modeSelection = document.getElementById('mode-selection');
    const gameOver = document.getElementById('game-over');
    const playAgainBtn = document.getElementById('play-again');

    easyModeBtn.addEventListener('click', () => startGame('easy'));
    hardModeBtn.addEventListener('click', () => startGame('hard'));
    playAgainBtn.addEventListener('click', resetGame);

    function startGame(mode) {
        console.log("Starting game in mode:", mode);
        currentMode = mode;
        console.log("Current mode set to:", currentMode);
        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('game-over').style.display = 'none';
        score = 0;
        updateScore();
        nextQuestion();
    }

    function resetGame() {
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('mode-selection').style.display = 'flex';
        document.getElementById('game-area').style.display = 'none';
        score = 0;
        updateScore();
    }
}

function nextQuestion() {
    const itemDisplay = document.getElementById('item-display');
    const optionsContainer = document.getElementById('options-container');

    itemDisplay.innerHTML = '';
    optionsContainer.innerHTML = '';

    if (currentMode === 'easy') {
        let correctItem, correctOption;
        do {
            correctItem = getRandomItem();
            correctOption = getRandomOption(correctItem);
        } while (correctOption === null);

        const options = [correctOption];
        while (options.length < 3) {
            let newOption;
            do {
                newOption = getRandomOption(getRandomItem());
            } while (newOption === null || options.includes(newOption));
            options.push(newOption);
        }
        shuffleArray(options);

        itemDisplay.innerHTML = `<img src="./assets/${correctItem.icon}" alt="${correctItem.name}">
                                 <h2>${formatItemName(correctItem.name)}</h2>`;

        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => checkAnswer(option === correctOption, optionElement));
            optionsContainer.appendChild(optionElement);
        });
    } else if (currentMode === 'hard') {
        let correctItem, correctOption;
        do {
            correctItem = getRandomItem();
            correctOption = getRandomOption(correctItem);
        } while (correctOption === null);

        const itemOptions = [correctItem];
        while (itemOptions.length < 3) {
            const newItem = getRandomItem();
            if (!itemOptions.includes(newItem) && getRandomOption(newItem) !== null) {
                itemOptions.push(newItem);
            }
        }
        shuffleArray(itemOptions);

        itemDisplay.innerHTML = `<h2>${correctOption}</h2>`; // Qui mostriamo solo il valore

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

function getRandomItem() {
    return items[Math.floor(Math.random() * items.length)];
}

function getRandomOption(item) {
    const options = Object.entries(item).filter(([key, value]) => 
        key !== 'name' && key !== 'icon' && value !== 'N.A' && value !== '' && value !== 'N/A'
    );
    if (options.length === 0) return null;
    const [selectedKey, selectedValue] = options[Math.floor(Math.random() * options.length)];
    return selectedValue;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function checkAnswer(isCorrect, selectedElement) {
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const gameoverSound = document.getElementById('gameover-sound');

    if (isCorrect) {
        score++;
        updateScore();
        selectedElement.classList.add('correct');
        correctSound.play();
        setTimeout(() => {
            selectedElement.classList.remove('correct');
            nextQuestion();
        }, 1000);
    } else {
        selectedElement.classList.add('wrong');
        wrongSound.play();
        setTimeout(() => {
            gameoverSound.play();
            gameOver();
        }, 1000);
    }
}

function updateScore() {
    document.getElementById('score-value').textContent = score;
}

function formatItemName(name) {
    return name.replace(/_/g, ' ');
}

function gameOver() {
    const gameArea = document.getElementById('game-area');
    const gameOverScreen = document.getElementById('game-over');
    const finalScore = document.getElementById('final-score');

    gameArea.style.display = 'none';
    gameOverScreen.style.display = 'block';
    finalScore.textContent = score;
}