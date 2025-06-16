import React, { useState, useEffect, useRef } from 'react';
import '../styles/Game.css';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 100;
const SPEED_INCREMENT = 5;
const MAX_SPEED = 50;

// Direction constants
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

// Food colors for visual appeal
const FOOD_COLORS = [
  '#FF5252', // Red
  '#FF4081', // Pink
  '#E040FB', // Purple
  '#7C4DFF', // Deep Purple
  '#536DFE', // Indigo
  '#448AFF', // Blue
  '#40C4FF', // Light Blue
  '#18FFFF', // Cyan
  '#64FFDA', // Teal
  '#69F0AE', // Green
  '#B2FF59', // Light Green
  '#EEFF41', // Lime
  '#FFFF00', // Yellow
  '#FFD740', // Amber
  '#FFAB40', // Orange
];

const Game = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5, color: FOOD_COLORS[0] });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(
    localStorage.getItem('snakeHighScore') ? parseInt(localStorage.getItem('snakeHighScore')) : 0
  );
  
  const directionRef = useRef(direction);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);

  // Generate random food position
  const generateFood = () => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const colorIndex = Math.floor(Math.random() * FOOD_COLORS.length);
    
    // Make sure food doesn't appear on snake
    const isOnSnake = snake.some(segment => segment.x === x && segment.y === y);
    if (isOnSnake) {
      return generateFood();
    }
    
    return { x, y, color: FOOD_COLORS[colorIndex] };
  };

  // Initialize game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOverRef.current) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== DIRECTIONS.DOWN) {
            directionRef.current = DIRECTIONS.UP;
            setDirection(DIRECTIONS.UP);
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== DIRECTIONS.UP) {
            directionRef.current = DIRECTIONS.DOWN;
            setDirection(DIRECTIONS.DOWN);
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== DIRECTIONS.RIGHT) {
            directionRef.current = DIRECTIONS.LEFT;
            setDirection(DIRECTIONS.LEFT);
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== DIRECTIONS.LEFT) {
            directionRef.current = DIRECTIONS.RIGHT;
            setDirection(DIRECTIONS.RIGHT);
          }
          break;
        case ' ':
          // Toggle pause with spacebar
          isPausedRef.current = !isPausedRef.current;
          setIsPaused(!isPaused);
          break;
        case 'r':
        case 'R':
          // Restart game with 'r' key
          if (gameOverRef.current) {
            resetGame();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        head.x += directionRef.current.x;
        head.y += directionRef.current.y;

        // Check for collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          gameOverRef.current = true;
          setGameOver(true);
          return prevSnake;
        }

        // Check for collision with self
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          gameOverRef.current = true;
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
          // Increase score
          const newScore = score + 10;
          setScore(newScore);
          
          // Update high score if needed
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          
          // Generate new food
          setFood(generateFood());
          
          // Increase speed
          if (speed > MAX_SPEED) {
            setSpeed(prevSpeed => prevSpeed - SPEED_INCREMENT);
          }
        } else {
          // Remove tail if no food was eaten
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [food, gameOver, isPaused, score, highScore, speed]);

  // Draw game on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw food with glow effect
    ctx.fillStyle = food.color;
    ctx.shadowColor = food.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    
    // Reset shadow for other elements
    ctx.shadowBlur = 0;
    
    // Draw snake
    snake.forEach((segment, index) => {
      // Head has different color
      if (index === 0) {
        // Snake head
        ctx.fillStyle = '#4CAF50';
        
        // Draw rounded rectangle for head
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        const radius = 4;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + CELL_SIZE, y, x + CELL_SIZE, y + CELL_SIZE, radius);
        ctx.arcTo(x + CELL_SIZE, y + CELL_SIZE, x, y + CELL_SIZE, radius);
        ctx.arcTo(x, y + CELL_SIZE, x, y, radius);
        ctx.arcTo(x, y, x + CELL_SIZE, y, radius);
        ctx.closePath();
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = 'white';
        
        // Position eyes based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2;
        
        if (directionRef.current === DIRECTIONS.RIGHT) {
          eyeX1 = x + CELL_SIZE - 6;
          eyeY1 = y + 5;
          eyeX2 = x + CELL_SIZE - 6;
          eyeY2 = y + CELL_SIZE - 5;
        } else if (directionRef.current === DIRECTIONS.LEFT) {
          eyeX1 = x + 6;
          eyeY1 = y + 5;
          eyeX2 = x + 6;
          eyeY2 = y + CELL_SIZE - 5;
        } else if (directionRef.current === DIRECTIONS.UP) {
          eyeX1 = x + 5;
          eyeY1 = y + 6;
          eyeX2 = x + CELL_SIZE - 5;
          eyeY2 = y + 6;
        } else {
          eyeX1 = x + 5;
          eyeY1 = y + CELL_SIZE - 6;
          eyeX2 = x + CELL_SIZE - 5;
          eyeY2 = y + CELL_SIZE - 6;
        }
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, 2, 0, 2 * Math.PI);
        ctx.fill();
        
      } else {
        // Snake body with gradient color
        const gradientIntensity = 1 - Math.min(index / snake.length, 0.8);
        const green = Math.floor(175 * gradientIntensity + 50);
        ctx.fillStyle = `rgb(76, ${green}, 80)`;
        
        // Draw rounded rectangle for body segments
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        const radius = 3;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + CELL_SIZE, y, x + CELL_SIZE, y + CELL_SIZE, radius);
        ctx.arcTo(x + CELL_SIZE, y + CELL_SIZE, x, y + CELL_SIZE, radius);
        ctx.arcTo(x, y + CELL_SIZE, x, y, radius);
        ctx.arcTo(x, y, x + CELL_SIZE, y, radius);
        ctx.closePath();
        ctx.fill();
      }
    });
    
    // Draw game over or paused overlay
    if (gameOver || isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = '24px "Press Start 2P", cursive';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      
      if (gameOver) {
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 20);
      } else if (isPaused) {
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillText('Press SPACE to Resume', canvas.width / 2, canvas.height / 2 + 40);
      }
    }
    
  }, [snake, food, gameOver, isPaused]);

  // Reset game function
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    setGameOver(false);
    gameOverRef.current = false;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
    isPausedRef.current = false;
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="score-container">
          <div className="score">Score: {score}</div>
          <div className="high-score">High Score: {highScore}</div>
        </div>
        <div className="controls-info">
          <p>Use arrow keys to move</p>
          <p>Space to pause, R to restart</p>
        </div>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={GRID_SIZE * CELL_SIZE} 
        height={GRID_SIZE * CELL_SIZE}
        className="game-canvas"
      />
      
      <div className="game-buttons">
        <button 
          onClick={() => setIsPaused(!isPaused)} 
          disabled={gameOver}
          className="control-button"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button 
          onClick={resetGame} 
          className="control-button restart-button"
        >
          Restart
        </button>
      </div>
      
      {/* Mobile controls */}
      <div className="mobile-controls">
        <button 
          className="direction-button up-button"
          onClick={() => {
            if (directionRef.current !== DIRECTIONS.DOWN) {
              directionRef.current = DIRECTIONS.UP;
              setDirection(DIRECTIONS.UP);
            }
          }}
          disabled={gameOver || isPaused}
        >
          ▲
        </button>
        <div className="horizontal-controls">
          <button 
            className="direction-button left-button"
            onClick={() => {
              if (directionRef.current !== DIRECTIONS.RIGHT) {
                directionRef.current = DIRECTIONS.LEFT;
                setDirection(DIRECTIONS.LEFT);
              }
            }}
            disabled={gameOver || isPaused}
          >
            ◄
          </button>
          <button 
            className="direction-button right-button"
            onClick={() => {
              if (directionRef.current !== DIRECTIONS.LEFT) {
                directionRef.current = DIRECTIONS.RIGHT;
                setDirection(DIRECTIONS.RIGHT);
              }
            }}
            disabled={gameOver || isPaused}
          >
            ►
          </button>
        </div>
        <button 
          className="direction-button down-button"
          onClick={() => {
            if (directionRef.current !== DIRECTIONS.UP) {
              directionRef.current = DIRECTIONS.DOWN;
              setDirection(DIRECTIONS.DOWN);
            }
          }}
          disabled={gameOver || isPaused}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default Game;
