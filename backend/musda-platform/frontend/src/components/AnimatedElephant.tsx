import React from 'react';
import { motion } from 'motion/react';

export function AnimatedElephant() {
  return (
    <div className="relative">
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 1, -1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          {/* Golden gradient definitions */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FF8C00" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Elephant body */}
          <ellipse cx="100" cy="130" rx="45" ry="35" fill="url(#goldGradient)" filter="url(#glow)" />
          
          {/* Elephant head */}
          <circle cx="100" cy="80" r="35" fill="url(#goldGradient)" filter="url(#glow)" />
          
          {/* Ears */}
          <ellipse cx="75" cy="70" rx="15" ry="25" fill="url(#goldGradient)" filter="url(#glow)" />
          <ellipse cx="125" cy="70" rx="15" ry="25" fill="url(#goldGradient)" filter="url(#glow)" />
          
          {/* Trunk */}
          <path 
            d="M 100 95 Q 90 120 95 145 Q 100 160 110 155" 
            stroke="url(#goldGradient)" 
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round"
            filter="url(#glow)"
          />
          
          {/* Crown/decorative pattern */}
          <polygon 
            points="85,50 95,35 100,45 105,35 115,50 100,60" 
            fill="url(#goldGradient)" 
            filter="url(#glow)"
          />
          
          {/* Decorative pattern on body */}
          <rect x="85" y="120" width="30" height="20" rx="3" fill="#B8860B" opacity="0.7" />
          <circle cx="100" cy="130" r="3" fill="#FFD700" />
          
          {/* Eyes */}
          <circle cx="90" cy="75" r="3" fill="#000" />
          <circle cx="110" cy="75" r="3" fill="#000" />
          
          {/* Legs */}
          <rect x="80" y="155" width="8" height="20" fill="url(#goldGradient)" filter="url(#glow)" />
          <rect x="95" y="155" width="8" height="20" fill="url(#goldGradient)" filter="url(#glow)" />
          <rect x="108" y="155" width="8" height="20" fill="url(#goldGradient)" filter="url(#glow)" />
          <rect x="123" y="155" width="8" height="20" fill="url(#goldGradient)" filter="url(#glow)" />
        </svg>
      </motion.div>
      
      {/* Sparkle effects around elephant */}
      <motion.div
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5,
        }}
        className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full"
      />
      <motion.div
        animate={{
          scale: [0, 1, 0],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1,
        }}
        className="absolute bottom-4 left-4 w-1 h-1 bg-yellow-300 rounded-full"
      />
      <motion.div
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 90, 180],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1.5,
        }}
        className="absolute top-8 left-2 w-1.5 h-1.5 bg-yellow-400 rounded-full"
      />
    </div>
  );
}