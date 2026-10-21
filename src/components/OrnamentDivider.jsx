import React from 'react';

export default function OrnamentDivider({ variant = 'double' }) {
  return (
    <div className="ornament-box" aria-hidden="true">
      <svg viewBox="0 0 400 30" xmlns="http://www.w3.org/2000/svg">
        <path d="M200 6 C202 10 205 13 209 15 C205 17 202 20 200 24 C198 20 195 17 191 15 C195 13 198 10 200 6 Z" fill="#ede6d1" />
        <circle cx="200" cy="15" r="2.5" fill="#df363e" />
        <line x1="40" y1="15" x2="185" y2="15" stroke="#ede6d1" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="215" y1="15" x2="360" y2="15" stroke="#ede6d1" strokeWidth="1" strokeOpacity="0.4" />
        
        {/* Left flourish scroll */}
        <path d="M50 15 C45 10 38 9 34 13 C30 17 33 22 38 21 C43 20 44 14 38 12 C34 11 28 15 28 19" 
              fill="none" stroke="#ede6d1" strokeWidth="1.2" strokeOpacity="0.75" />
        <circle cx="28" cy="19" r="1.5" fill="#ede6d1" />

        {/* Right flourish scroll */}
        <path d="M350 15 C355 10 362 9 366 13 C370 17 367 22 362 21 C357 20 356 14 362 12 C366 11 372 15 372 19" 
              fill="none" stroke="#ede6d1" strokeWidth="1.2" strokeOpacity="0.75" />
        <circle cx="372" cy="19" r="1.5" fill="#ede6d1" />
      </svg>
    </div>
  );
}
