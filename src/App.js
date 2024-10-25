import React, { useState, useEffect } from "react";
import "./App.css";
import LevelSelector from "./selectordeniveles";
import { io } from "socket.io-client";

const NUMBER_OF_LINES = 5;
const NOTE_REMOVAL_HEIGHT = 510; // Altura donde se eliminarán las notas
const PULSE_LIMIT_HEIGHT = 350;   // Nueva altura límite para pulsar
const GAME_TIME_LIMIT = 60;       // Límite de tiempo de 60 segundos

function App() {
  const [notes, setNotes] = useState([]);
  const [collectedNotes, setCollectedNotes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(null);
  const [noteSpeed, setNoteSpeed] = useState(5);
  const [showStartScreen, setShowStartScreen] = useState(false);
  const [socket, setSocket] = useState(null); // Para guardar la conexión de socket

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('rfidMessage', (data) => {
        const noteLine = parseInt(data); // Asegurarse de que 'data' sea el índice correcto de la línea
        console.log(`Pulsador ${noteLine} presionado`);

        if (noteLine === 2) {
          setNotes((prevNotes) =>
            prevNotes.map((note) => {
              if (
                note.line === 1 &&
                note.top > PULSE_LIMIT_HEIGHT &&
                note.top < NOTE_REMOVAL_HEIGHT &&
                note.color !== "#FF0000" &&
                note.color !== "#00FF00"
              ) {
                setCollectedNotes((prev) => prev + 1); // Incrementar el puntaje de 1 en 1
                return { ...note, color: "#00FF00" };  // Cambiar la nota a verde
              }
              return note;
            })
          );
        }
      });
    }
  }, [socket, notes]);

  useEffect(() => {
    switch (level) {
      case "basic":
        setNoteSpeed(5);
        break;
      case "intermediate":
        setNoteSpeed(10);
        break;
      case "expert":
        setNoteSpeed(15);
        break;
      default:
        setNoteSpeed(5);
    }
  }, [level]);

  // Generación de notas en intervalos
  useEffect(() => {
    if (!gameOver && showStartScreen) {
      const intervals = [];

      for (let i = 0; i < NUMBER_OF_LINES; i++) {
        const interval = setInterval(() => {
          setNotes((prevNotes) => [
            ...prevNotes,
            { id: Date.now(), line: i, top: 0, color: "#000000", counted: false },
          ]);
        }, Math.random() * 3000 + 1000); // Tiempo aleatorio entre 1 y 4 segundos
        intervals.push(interval);
      }

      return () => intervals.forEach(clearInterval);
    }
  }, [gameOver, showStartScreen]);

  // Actualización de las notas en el tiempo
  useEffect(() => {
    if (!gameOver && showStartScreen) {
      const updateInterval = setInterval(() => {
        setNotes((prevNotes) => {
          return prevNotes
            .map((note) => ({ ...note, top: note.top + noteSpeed })) // Mover las notas hacia abajo
            .map((note) => {
              // Cambiar a rojo si la nota ha pasado el límite sin ser pulsada
              if (note.top >= NOTE_REMOVAL_HEIGHT && note.color !== "#00FF00") {
                return { ...note, color: "#FF0000" }; // Cambiar a rojo
              }
              return note;
            })
            .filter((note) => note.top < NOTE_REMOVAL_HEIGHT); // Eliminar las notas que llegan al final
        });
      }, 50);

      return () => clearInterval(updateInterval);
    }
  }, [gameOver, showStartScreen, noteSpeed]);

  // Actualizar el temporizador del juego
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

  // Función para reiniciar el juego
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
                      <div key={note.id} className="note" style={{ top: `${note.top}px`, backgroundColor: note.color }}>
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
