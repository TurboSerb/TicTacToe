import { print, askQuestion } from "./io.mjs";
import { debug, DEBUG_LEVELS } from "./debug.mjs";
import { ANSI } from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;
const EMPTY = 0;

const MENU_CHOICES = {
    START_GAME_PVP: 1,
    START_GAME_PVC: 2,
    SHOW_SETTINGS: 3,
    EXIT_GAME: 4,
};

let language = DICTIONARY.en;  // Main language set to English
let gameboard;
let currentPlayer;

clearScreen();
showSplashScreen();
setTimeout(start, 2500); 

async function start() {
    do {
        let chosenAction = await showMenu();

        switch (chosenAction) {
            case MENU_CHOICES.START_GAME_PVP:
                await runGame(false); // PvP
                break;
            case MENU_CHOICES.START_GAME_PVC:
                await runGame(true); // PvC
                break;
            case MENU_CHOICES.SHOW_SETTINGS:
                await showSettings(); // Access settings
                break;
            case MENU_CHOICES.EXIT_GAME:
                clearScreen();
                process.exit();
        }
    } while (true);
}

async function runGame(isPlayerVsComputer) {
    let isPlaying = true;

    while (isPlaying) {
        initializeGame(); 
        isPlaying = await playGame(isPlayerVsComputer); 
    }
}

async function showMenu() {
    let choice;
    let validChoice = false;

    while (!validChoice) {
        clearScreen();
        print(ANSI.COLOR.YELLOW + language.MENU_TITLE + ANSI.RESET);
        print(language.START_GAME_PVP);
        print(language.START_GAME_PVC);
        print(language.SETTINGS);
        print(language.EXIT_GAME);

        choice = await askQuestion(language.SELECT_OPTION);

        if (Object.values(MENU_CHOICES).includes(Number(choice))) {
            validChoice = true;
        } else {
            print(ANSI.COLOR.RED + language.INVALID_CHOICE + ANSI.RESET);
        }
    }

    return Number(choice);
}

async function showSettings() {
    clearScreen();
    print(language.SETTINGS_TITLE);
    print(language.CHANGE_LANGUAGE);
    print(language.BACK_TO_MENU);
    
    let choice = await askQuestion(language.SELECT_OPTION);
    if (choice === '1') {
        await changeLanguage();
    } else if (choice === '2') {
        return; // Go back to main menu
    } else {
        print(language.INVALID_CHOICE);
        await showSettings(); // Back to settings again
    }
}

async function changeLanguage() {
    clearScreen();
    print(language.CHOOSE_LANGUAGE);
    print(language.LANGUAGE_ENGLISH);
    print(language.LANGUAGE_SERBIAN);
    
    let choice = await askQuestion(language.SELECT_OPTION);
    switch (choice) {
        case '1':
            language = DICTIONARY.en;
            break;
        case '2':
            language = DICTIONARY.srb;
            break;
        default:
            print(language.INVALID_CHOICE);
            await showSettings(); // Settings appear if invalid
    }
}

async function playGame(isPlayerVsComputer) {
    let outcome;
    do {
        clearScreen();
        showGameBoardWithCurrentState();
        showHUD();
        
        let move;
        if (isPlayerVsComputer && currentPlayer === PLAYER_2) {
            move = await getComputerMove(); 
        } else {
            move = await getGameMoveFromCurrentPlayer();
        }

        updateGameBoardState(move);
        outcome = evaluateGameState();
        changeCurrentPlayer();
    } while (outcome === 0);

    showGameSummary(outcome);
    return await askWantToPlayAgain();
}

async function askWantToPlayAgain() {
    let answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
    return answer && answer.toLowerCase()[0] === language.CONFIRM;
}

function showGameSummary(outcome) {
    clearScreen();
    if (outcome === 'draw') {
        print(language.DRAW);
    } else {
        let winningPlayer = (outcome > 0) ? 1 : 2;
        print(language.WINNER + winningPlayer);
    }
    showGameBoardWithCurrentState();
    print(language.GAME_OVER);
}

function changeCurrentPlayer() {
    currentPlayer *= -1;
}

function evaluateGameState() {
    let sum = 0;

    // Rows and Columns
    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        sum = gameboard[i].reduce((acc, val) => acc + val, 0);
        if (Math.abs(sum) === 3) return sum; // Win found
    }

    for (let i = 0; i < GAME_BOARD_SIZE; i++) {
        sum = 0;
        for (let j = 0; j < GAME_BOARD_SIZE; j++) {
            sum += gameboard[j][i];
        }
        if (Math.abs(sum) === 3) return sum; // Win found
    }

    // Diagonal
    sum = gameboard[0][0] + gameboard[1][1] + gameboard[2][2];
    if (Math.abs(sum) === 3) return sum; // Win found

    sum = gameboard[0][2] + gameboard[1][1] + gameboard[2][0];
    if (Math.abs(sum) === 3) return sum; // Win found

    // Draw
    if (gameboard.flat().every(cell => cell !== EMPTY)) return 'draw';

    return 0; // Game continues
}

function updateGameBoardState(move) {
    const ROW_ID = 0;
    const COLUMN_ID = 1;
    gameboard[move[ROW_ID]][move[COLUMN_ID]] = currentPlayer;
}

async function getGameMoveFromCurrentPlayer() {
    let position = null;
    do {
        let rawInput = await askQuestion(language.PLACE_MARK);
        position = rawInput.split(" ").map(num => parseInt(num) - 1); 
    } while (!isValidPositionOnBoard(position));

    return position;
}

async function getComputerMove() {
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            if (gameboard[row][col] === EMPTY) {
                return [row, col]; 
            }
        }
    }
    return null; 
}

function isValidPositionOnBoard(position) {
    if (position.length < 2) {
        return false;
    }

    let row = position[0];
    let col = position[1];

    if (row < 0 || row >= GAME_BOARD_SIZE || col < 0 || col >= GAME_BOARD_SIZE) {
        return false; // Not on board
    }
    if (gameboard[row][col] !== EMPTY) {
        return false; 
    }

    return true; 
}

function showHUD() {
    let playerDescription = (currentPlayer === PLAYER_1) ? language.PLAYER_TURN : "Играч два је ваш ред"; // Serbian for player 2
    print(playerDescription);
}

function showGameBoardWithCurrentState() {
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
        let rowOutput = "";
        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            let cell = gameboard[row][col];
            if (cell === EMPTY) {
                rowOutput += "_ ";
            } else if (cell === PLAYER_1) {
                rowOutput += ANSI.COLOR.GREEN + "X" + ANSI.RESET + " ";
            } else {
                rowOutput += ANSI.COLOR.RED + "O" + ANSI.RESET + " ";
            }
        }
        print(rowOutput);
    }
}

function initializeGame() {
    gameboard = createGameBoard();
    currentPlayer = PLAYER_1;
}

function createGameBoard() {
    return Array.from({ length: GAME_BOARD_SIZE }, () => Array(GAME_BOARD_SIZE).fill(EMPTY));
}

function clearScreen() {
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME, ANSI.RESET);
}


//#endregion