import React, { useState } from 'react';

function Images({ src, alt = "Imagen", width = "100%", height = "auto", className = "", objectFit = "cover", isRound = "rounded-2xl", style = {} }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            className={`relative overflow-hidden ${isRound}`}
            style={{ width, height, ...style }}
        >
            {!loaded && (
                <div className="absolute inset-0 bg-gray-400 dark:bg-gray-700 animate-pulse"></div>
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
                className={`w-full h-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                style={{ objectFit }}
            />
        </div>
    );
}

export default Images;