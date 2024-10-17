import React from "react";

const selectordeniveles = ({ setLevel}) => {
    return (
      <div className="level-selector">
        <h2>Selecciona el Nivel de Juego</h2>
        <button onClick={() => setLevel("basic")} className="level-button">Básico</button>
        <button onClick={() => setLevel("intermediate")} className="level-button">Intermedio</button>
        <button onClick={() => setLevel("expert")} className="level-button">Experto</button>
      </div>
    );
  };
  
export default selectordeniveles;
