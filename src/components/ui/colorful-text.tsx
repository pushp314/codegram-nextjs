
'use client';
import React, { useEffect, useState } from 'react';

const colors = [
  'rgb(131, 179, 32)',
  'rgb(47, 195, 106)',
  'rgb(42, 160, 210)',
  'rgb(4, 112, 202)',
  'rgb(107, 10, 255)',
  'rgb(183, 0, 218)',
  'rgb(218, 0, 171)',
  'rgb(238, 64, 92)',
  'rgb(232, 98, 63)',
  'rgb(249, 129, 47)',
];

export default function ColourfulText({ text }: { text: string }) {
  const [currentColors, setCurrentColors] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColors((prevColors) => {
        const newColors = [...prevColors];
        if (newColors.length === 0) {
          // Initialize colors
          return text.split('').map(() => colors[Math.floor(Math.random() * colors.length)]);
        }

        // Shift colors
        const lastColor = newColors.pop()!;
        newColors.unshift(lastColor);
        return newColors;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="inline-block">
      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
            color: currentColors[index] || 'white',
            transition: 'color 0.5s ease',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
