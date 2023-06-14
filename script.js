// script.js

// Variables globales
const cells = document.querySelectorAll('.cell');
let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Función para reiniciar el juego
function restartGame() {
    currentPlayer = 'X';
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {

        cell.textContent = '';
        cell.classList.remove('winner');
    });
}

// Función para manejar el clic en una celda
function handleCellClick(cell, index) {

    if (!gameActive || cell.textContent !== '') {
        return;
    }

    // Actualizar el estado del juego
    gameState[index] = currentPlayer == "X" ? -1 : 1;
    cell.textContent = currentPlayer;

    // Comprobar si hay un ganador
    if (checkWin()) {
        gameActive = false;
        cells.forEach(cell => cell.classList.add('winner'));
        alert('¡' + currentPlayer + ' ha ganado!');
        return;
    }

    // Comprobar si hay un empate
    if (!gameState.includes('')) {
        gameActive = false;
        alert('¡Empate!');
        return;
    }

    // Cambiar al siguiente jugador
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    console.log(gameState);

    // Hacer el movimiento del modelo de aprendizaje (puedes implementar tu lógica aquí)
    if (currentPlayer === 'O') {

        tf.ready().then(() => {
            const estadoJuego = gameState.map(e => e === '' ? 0 : e);;
            const modelPath = 'model/ttt_model.json'
            tf.tidy(() => {
                tf.loadLayersModel(modelPath).then((model) => {
                    // Three board states

                    const betterBlockMe = tf.tensor(estadoJuego)

                    // Stack states into a shape [3, 9]
                    const matches = tf.stack([betterBlockMe])
                    const result = model.predict(matches)
                    // Log the results
                    result.reshape([3, 3]).print()
                    result.data().then((data) => {
                        const prediccion = data;

                        for (var i = 0; i < estadoJuego.length; i++) {
                            if (estadoJuego[i] !== 0) {
                                prediccion[i] = 0;
                            }
                        }
                        console.log(prediccion);

                        // obtengo la posicion con mayor valor
                        const valorMaximo = Math.max(...prediccion);
                        const posicionMaxima = prediccion.indexOf(valorMaximo);

                        // Actualizar el estado del juego
                        gameState[posicionMaxima] = currentPlayer == "X" ? -1 : 1;
                        cells[posicionMaxima].textContent = currentPlayer;

                        // Comprobar si hay un ganador
                        if (checkWin()) {
                            gameActive = false;
                            cells.forEach(cell => cell.classList.add('winner'));
                            alert('¡' + currentPlayer + ' ha ganado!');
                            return;
                        }

                        // Comprobar si hay un empate
                        if (!gameState.includes('')) {
                            gameActive = false;
                            alert('¡Empate!');
                            return;
                        }

                        // Cambiar al siguiente jugador
                        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                        console.log(gameState);
                    });
                })
            })
        })
    }

    // ...
}

// Función para comprobar si hay un ganador
function checkWin() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (
            gameState[a] !== '' &&
            gameState[a] === gameState[b] &&
            gameState[a] === gameState[c]
        ) {
            return true;
        }
    }
    return false;
}

// Asignar el evento de clic a cada celda
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(cell, index));
});

// Asignar el evento de reinicio al botón de reinicio
const restartButton = document.createElement('button');
restartButton.textContent = 'Reiniciar';
restartButton.addEventListener('click', restartGame);
document.body.appendChild(restartButton);
