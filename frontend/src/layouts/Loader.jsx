import React from 'react';

function Loader() {
    const reelPath = "M 0,-28 A 28,28 0 1,1 0,28 A 28,28 0 1,1 0,-28 M 0,-4 A 4,4 0 1,0 0,4 A 4,4 0 1,0 0,-4 M 0,-22 A 6,6 0 1,0 0,-10 A 6,6 0 1,0 0,-22 M 15.2,-10.9 A 6,6 0 1,0 15.2,1.1 A 6,6 0 1,0 15.2,-10.9 M 9.4,6.9 A 6,6 0 1,0 9.4,18.9 A 6,6 0 1,0 9.4,6.9 M -9.4,6.9 A 6,6 0 1,0 -9.4,18.9 A 6,6 0 1,0 -9.4,6.9 M -15.2,-10.9 A 6,6 0 1,0 -15.2,1.1 A 6,6 0 1,0 -15.2,-10.9";

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
            <style>
                {`
                    @keyframes projectorFlicker {
                        0%   { opacity: 1; }
                        10%  { opacity: 0.8; }
                        20%  { opacity: 0.95; }
                        30%  { opacity: 0.6; }
                        40%  { opacity: 0.9; }
                        50%  { opacity: 0.75; }
                        60%  { opacity: 1; }
                        70%  { opacity: 0.85; }
                        80%  { opacity: 0.65; }
                        90%  { opacity: 0.95; }
                        100% { opacity: 1; }
                    }
                    .animate-flicker {
                        animation: projectorFlicker 0.25s infinite linear;
                    }
                `}
            </style>

            <div className="relative w-64 h-48 drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <svg viewBox="0 0 250 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <polygon
                        points="190,75 250,30 250,175 190,130"
                        className="text-purple-400 animate-flicker"
                        fill="url(#lightGradient)"
                    />

                    <rect x="60" y="70" width="100" height="65" rx="8" className="fill-gray-900 stroke-purple-500" strokeWidth="3" />

                    <rect x="60" y="75" width="25" height="15" className="fill-gray-800" />
                    <rect x="130" y="80" width="20" height="10" rx="2" className="fill-purple-500/20 stroke-purple-400" strokeWidth="1.5" />
                    <circle cx="80" cy="115" r="5" className="fill-gray-700" />

                    <path d="M160 85 L190 75 L190 130 L160 120 Z" className="fill-gray-800 stroke-purple-500" strokeWidth="3" strokeLinejoin="round" />

                    <line x1="190" y1="75" x2="190" y2="130" className="stroke-purple-400 animate-flicker" strokeWidth="4" strokeLinecap="round" />

                    <path d="M 80 17 L 140 17" className="stroke-purple-500" strokeWidth="2" strokeDasharray="4 4" fill="none" />

                    <g transform="translate(80, 45)">
                        <path
                            d={reelPath}
                            fillRule="evenodd"
                            className="fill-gray-800 stroke-purple-500 animate-[spin_3s_linear_infinite]"
                            strokeWidth="2"
                            style={{ transformOrigin: '0px 0px' }}
                        />
                        <circle cx="0" cy="0" r="3" className="fill-purple-400" />
                    </g>

                    <g transform="translate(140, 45)">
                        <path
                            d={reelPath}
                            fillRule="evenodd"
                            className="fill-gray-800 stroke-purple-500 animate-[spin_3s_linear_infinite]"
                            strokeWidth="2"
                            style={{ transformOrigin: '0px 0px' }}
                        />
                        <circle cx="0" cy="0" r="3" className="fill-purple-400" />
                    </g>
                </svg>
            </div>
        </div>
    );
}

export default Loader;