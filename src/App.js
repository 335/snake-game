import React from 'react';
import Game from './components/Game';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Snake Game</h1>
      </header>
      <main>
        <Game />
      </main>
      <footer>
        <p>Use arrow keys to control the snake. Eat food to grow longer!</p>
      </footer>
    </div>
  );
}

export default App;
