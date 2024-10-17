import React, { useState, useEffect } from "react";
import "./App.css";
import LevelSelector from "./selectordeniveles"; 

const NUMBER_OF_LINES = 5;
const NOTE_REMOVAL_HEIGHT = 510; // Altura donde se eliminarán las notas
const GAME_TIME_LIMIT = 60; // Límite de tiempo de 60 segundos

function App() {
  const [notes, setNotes] = useState([]);
  const [collectedNotes, setCollectedNotes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(null); 
  const [noteSpeed, setNoteSpeed] = useState(5); 
  const [showStartScreen, setShowStartScreen] = useState(false); 

 
  useEffect(() => {
    switch (level) {
      case "basic":
        setNoteSpeed(5); // Velocidad básica (la actual)
        break;
      case "intermediate":
        setNoteSpeed(10); // Velocidad intermedia, más rápida
        break;
      case "expert":
        setNoteSpeed(15); // Velocidad experta, aún más rápida
        break;
      default:
        setNoteSpeed(5); // Valor por defecto, velocidad básica
    }
  }, [level]);

  useEffect(() => {
    if (!gameOver && showStartScreen) {
      const intervals = [];

      for (let i = 0; i < NUMBER_OF_LINES; i++) {
        const interval = setInterval(() => {
          setNotes((prevNotes) => [
            ...prevNotes,
            { id: Date.now() + i, line: i, top: 0 },
          ]);
        }, Math.random() * 3000 + 1000); // Tiempo aleatorio entre 1 y 4 segundos
        intervals.push(interval);
      }

      return () => intervals.forEach(clearInterval); 
    }
  }, [gameOver, showStartScreen]);

  useEffect(() => {
    if (!gameOver && showStartScreen) {
      const updateInterval = setInterval(() => {
        setNotes((prevNotes) =>
          prevNotes
            .map((note) => ({ ...note, top: note.top + noteSpeed })) 
            .filter((note) => {
              if (note.top >= NOTE_REMOVAL_HEIGHT) {
                setCollectedNotes((prev) => prev + 1);
                return false;
              }
              return true;
            })
        );
      }, 50); 

      return () => clearInterval(updateInterval);
    }
  }, [gameOver, showStartScreen, noteSpeed]);

 
  useEffect(() => {
    if (!gameOver && timeLeft > 0 && showStartScreen) {
      const timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1); 
      }, 1000);

      return () => clearInterval(timerInterval); 
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver, showStartScreen]);

  //Función para reiniciar el juego
  const resetGame = () => {
    setNotes([]); 
    setCollectedNotes(0); 
    setTimeLeft(GAME_TIME_LIMIT);
    setGameOver(false); 
    setShowStartScreen(false); 
    setLevel(null); 
  };

 
  const startGame = () => {
    setShowStartScreen(true);
  };

  return (
    <div className="piano-container">
      {level === null && (
        <LevelSelector setLevel={setLevel} />
      )}

      {!showStartScreen && level !== null && (
          <img 
            src="/image.png" 
            alt="Play" 
            style={{ width: '450px', height: 'center' }} 
            className="play-button" 
            onClick={startGame} 
          />
      )}


      {gameOver && timeLeft === 0 ? (
        <div className="game-over-screen">
          <h1>Puntaje</h1>
          <div className="final-score">🎶 {collectedNotes}</div>
          <button onClick={resetGame} className="reset-button">INICIO</button>
        </div>
      ) : (
        showStartScreen && (
          <>
            <div className="header">
              <div className="score">🎶 : {collectedNotes}</div>
              <div className="timer">⌚ : {timeLeft}s</div>
            </div>
            <div className="lines">
              {Array.from({ length: NUMBER_OF_LINES }).map((_, index) => (
                <div key={index} className="line">
                  {notes
                    .filter((note) => note.line === index)
                    .map((note) => (
                      <div key={note.id} className="note" style={{ top: `${note.top}px` }}>
                        🎶
                      </div>
                    ))}
                </div>
              ))}
            </div>

            <div className="footer">Límite</div>
          </>
        )
      )}
    </div>
  );
}

export default App;
