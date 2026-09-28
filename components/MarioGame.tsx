// components/MarioGame.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function MarioGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [coinsLeft, setCoinsLeft] = useState(3);
  const [status, setStatus] = useState<'playing' | 'won'>('playing');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game state
    const gravity = 0.5;
    const keys = { left: false, right: false, up: false };

    const player = {
      x: 50,
      y: 300,
      width: 28,
      height: 38,
      vx: 0,
      vy: 0,
      speed: 4,
      jumpForce: -11,
      grounded: false,
    };

    const platforms = [
      { x: 0, y: 360, width: 800, height: 40, color: '#16a34a' }, // Main ground
      { x: 180, y: 270, width: 100, height: 20, color: '#b45309' }, // Platform 1
      { x: 340, y: 210, width: 120, height: 20, color: '#b45309' }, // Platform 2
      { x: 520, y: 260, width: 100, height: 20, color: '#b45309' }, // Platform 3
      { x: 680, y: 170, width: 90, height: 20, color: '#b45309' },  // Flag platform
    ];

    const coins = [
      { x: 220, y: 230, radius: 8, collected: false },
      { x: 390, y: 170, radius: 8, collected: false },
      { x: 560, y: 220, radius: 8, collected: false },
    ];

    const flag = { x: 730, y: 90, width: 10, height: 80 };

    let currentScore = 0;
    let currentCoins = coins.length;

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        if (player.grounded) {
          player.vy = player.jumpForce;
          player.grounded = false;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;

    const gameLoop = () => {
      // Horizontal Movement
      if (keys.right) player.vx = player.speed;
      else if (keys.left) player.vx = -player.speed;
      else player.vx = 0;

      // Vertical Movement & Gravity
      player.vy += gravity;
      player.x += player.vx;
      player.y += player.vy;

      // Boundary checks
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

      player.grounded = false;

      // Collision with platforms
      for (const plat of platforms) {
        if (
          player.x < plat.x + plat.width &&
          player.x + player.width > plat.x &&
          player.y < plat.y + plat.height &&
          player.y + player.height > plat.y
        ) {
          // Landing on top
          if (player.vy > 0 && player.y + player.height - player.vy <= plat.y) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.grounded = true;
          }
        }
      }

      // Coin collection
      coins.forEach((coin) => {
        if (!coin.collected) {
          const distX = player.x + player.width / 2 - coin.x;
          const distY = player.y + player.height / 2 - coin.y;
          if (Math.hypot(distX, distY) < player.width / 2 + coin.radius) {
            coin.collected = true;
            currentScore += 100;
            currentCoins -= 1;
            setScore(currentScore);
            setCoinsLeft(currentCoins);
          }
        }
      });

      // Goal detection
      if (
        player.x + player.width >= flag.x &&
        player.y + player.height >= flag.y
      ) {
        setStatus('won');
      }

      // --- Rendering ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Platforms / Ground
      platforms.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
      });

      // Coins
      coins.forEach((coin) => {
        if (!coin.collected) {
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#facc15';
          ctx.fill();
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Flagpole & Flag
      ctx.fillStyle = '#374151';
      ctx.fillRect(flag.x, flag.y, flag.width, flag.height);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(flag.x + flag.width, flag.y);
      ctx.lineTo(flag.x + flag.width + 25, flag.y + 15);
      ctx.lineTo(flag.x + flag.width, flag.y + 30);
      ctx.fill();

      // Mario / Player (Cap, Shirt, Overalls)
      ctx.fillStyle = '#dc2626'; // Red Cap & Shirt
      ctx.fillRect(player.x + 4, player.y, player.width - 8, 14);
      ctx.fillStyle = '#2563eb'; // Blue Overalls
      ctx.fillRect(player.x + 2, player.y + 14, player.width - 4, 18);
      ctx.fillStyle = '#78350f'; // Shoes
      ctx.fillRect(player.x, player.y + 32, player.width, 6);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
        <span>Score: {score}</span>
        <span>Coins Left: {coinsLeft}</span>
        {status === 'won' && <span style={{ color: '#16a34a' }}>Level Cleared! 🎉</span>}
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{
          border: '4px solid #1f2937',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }}
      />

      <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
        Controls: <strong>A / D</strong> or <strong>Left / Right Arrows</strong> to move | <strong>W</strong>, <strong>Up Arrow</strong>, or <strong>Space</strong> to jump
      </p>
    </div>
  );
}