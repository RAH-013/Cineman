import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, getYear, formatGenres, getYouTubeId, parallaxStyles } from "../utils/home"
import { apiGetActiveMovies } from '../api/movies';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faVolumeXmark,
    faVolumeHigh,
    faEye,
    faEyeSlash,
    faTicketSimple,
    faMagnifyingGlass,
    faPlay,
    faChevronLeft,
    faChevronRight
} from "@fortawesome/free-solid-svg-icons";

import Loader from "../layouts/Loader";
import Images from "../layouts/Images";

function Home() {
    const [movies, setMovies] = useState([]);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [listPage, setListPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const [isMuted, setIsMuted] = useState(true);
    const [isCinemaModeActive, setIsCinemaModeActive] = useState(false);
    const [isUiVisible, setIsUiVisible] = useState(true);

    const navigate = useNavigate();
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);
    const moviesRef = useRef([]);
    const isMutedRef = useRef(isMuted);
    const featuredIndexRef = useRef(featuredIndex);
    const transitionTimerRef = useRef(null);
    const isCinemaModeActiveRef = useRef(isCinemaModeActive);

    const ITEMS_PER_PAGE = 4;

    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
    useEffect(() => { featuredIndexRef.current = featuredIndex; }, [featuredIndex]);
    useEffect(() => { isCinemaModeActiveRef.current = isCinemaModeActive; }, [isCinemaModeActive]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await apiGetActiveMovies();
                if (response && response.success && response.data && response.data.length > 0) {
                    setMovies(response.data);
                    moviesRef.current = response.data;

                    const postersToLoad = response.data.slice(0, 3).map(m => m.poster_url).filter(Boolean);
                    await Promise.all(postersToLoad.map(url => {
                        return new Promise((resolve) => {
                            const img = new Image();
                            img.src = url;
                            img.onload = resolve;
                            img.onerror = resolve;
                        });
                    }));
                }
            } catch (error) {
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();

        return () => {
            if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (loading || movies.length === 0) return;

        if (window.YT && window.YT.Player) {
            initYoutubePlayer();
            return;
        }

        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            initYoutubePlayer();
        };
    }, [loading, movies]);

    useEffect(() => {
        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
        setShowTrailer(false);
        setIsUiVisible(true);

        if (playerRef.current && playerRef.current.loadVideoById && movies.length > 0) {
            const videoId = getYouTubeId(movies[featuredIndex]?.trailer_url);
            if (videoId) {
                playerRef.current.mute();
                playerRef.current.loadVideoById({
                    videoId: videoId,
                    startSeconds: 0
                });
            }
        }
    }, [featuredIndex, movies]);

    const initYoutubePlayer = () => {
        if (moviesRef.current.length === 0 || playerRef.current || !playerContainerRef.current) return;

        const videoId = getYouTubeId(moviesRef.current[featuredIndexRef.current]?.trailer_url);

        playerRef.current = new window.YT.Player(playerContainerRef.current, {
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                mute: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                playsinline: 1,
                cc_load_policy: 0
            },
            events: {
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        event.target.mute();

                        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
                        transitionTimerRef.current = setTimeout(() => {
                            setShowTrailer(true);
                            if (isCinemaModeActiveRef.current) {
                                setIsUiVisible(false);
                            }
                            if (!isMutedRef.current) {
                                event.target.unMute();
                            }
                        }, 3500);
                    }

                    if (event.data === window.YT.PlayerState.ENDED) {
                        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
                        setShowTrailer(false);
                        setIsUiVisible(true);
                        handleNextMovie();
                    }

                    if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.BUFFERING) {
                        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
                    }
                }
            }
        });
    };

    const handleNextMovie = () => {
        setFeaturedIndex((prevIndex) => (prevIndex + 1) % moviesRef.current.length);
    };

    const executeSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/movies/?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    };

    const toggleMute = () => {
        if (playerRef.current) {
            if (isMuted) {
                playerRef.current.unMute();
            } else {
                playerRef.current.mute();
            }
            setIsMuted(!isMuted);
        }
    };

    const toggleCinemaMode = () => {
        const nextState = !isCinemaModeActive;
        setIsCinemaModeActive(nextState);
        if (showTrailer) {
            setIsUiVisible(!nextState);
        }
    };

    const totalPages = Math.ceil(movies.length / ITEMS_PER_PAGE);
    const paginatedMovies = movies.slice(listPage * ITEMS_PER_PAGE, (listPage + 1) * ITEMS_PER_PAGE);

    const handlePrevPage = () => setListPage((prev) => Math.max(prev - 1, 0));
    const handleNextPage = () => setListPage((prev) => Math.min(prev + 1, totalPages - 1));

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-[#0d1117]">
                <Loader />
            </div>
        );
    }

    if (movies.length === 0) {
        return <div className="flex items-center justify-center w-full h-screen bg-[#0d1117] text-white">No hay películas disponibles.</div>;
    }

    const featuredMovie = movies[featuredIndex];

    return (
        <div className="relative flex w-full h-screen bg-[#0d1117] text-white overflow-hidden font-sans">
            <style>{parallaxStyles}</style>

            <div className="absolute inset-0 overflow-hidden bg-black select-none">
                {featuredMovie && (
                    <div
                        className={`absolute inset-0 w-full h-full z-10 parallax-poster transition-opacity ${showTrailer ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        style={{ transitionDuration: showTrailer ? '1000ms' : '0ms', transitionTimingFunction: 'ease-in' }}
                    >
                        <Images
                            src={featuredMovie.poster_url}
                            alt="Poster"
                            width="100%"
                            height="100%"
                            isRound=""
                        />
                    </div>
                )}

                <div className="absolute top-1/2 left-1/2 w-[140vw] h-[140vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                    <div ref={playerContainerRef} className="w-full h-full border-0"></div>
                </div>

                <div className="absolute inset-0 bg-black/40 z-20 pointer-events-auto" />
                <div className={`absolute inset-0 bg-linear-to-t from-[#0d1117] via-[#0d1117]/80 to-black/60 z-25 pointer-events-none transition-opacity duration-500 ${isUiVisible ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            {playerRef.current && (
                <div className="absolute bottom-8 left-8 z-31 flex space-x-4">
                    <button
                        onClick={toggleMute}
                        className={`w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer ${!isMuted ? 'text-[#8B5CF6]' : 'text-white'}`}
                    >
                        {isMuted ? (
                            <FontAwesomeIcon icon={faVolumeXmark} className="w-5 h-5" />
                        ) : (
                            <FontAwesomeIcon icon={faVolumeHigh} className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={toggleCinemaMode}
                        className={`w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer ${isCinemaModeActive ? 'text-[#8B5CF6]' : 'text-white'}`}
                    >
                        {isCinemaModeActive ? (
                            <FontAwesomeIcon icon={faEyeSlash} className="w-5 h-5" />
                        ) : (
                            <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                        )}
                    </button>
                </div>
            )}

            <main className={`relative flex-1 flex px-16 py-12 z-30 h-full w-full max-w-screen-2xl mx-auto transition-opacity duration-500 ${isUiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex-1 flex flex-col justify-center">
                    {featuredMovie ? (
                        <>
                            <div className="flex items-center space-x-4 text-sm font-semibold tracking-wider text-gray-400 mb-6">
                                <span>{formatDate(featuredMovie.release_date)}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] opacity-90" />
                                <span>{formatGenres(featuredMovie.genres)}</span>
                            </div>

                            <div className="h-px w-full bg-linear-to-r from-white/20 via-white/5 to-transparent mb-6" />

                            <h1 className="text-7xl font-bold uppercase tracking-tight mb-4 leading-none">
                                {featuredMovie.title}
                            </h1>

                            <div className="h-px w-full bg-linear-to-r from-white/20 via-white/5 to-transparent mb-6" />

                            <p className="text-xl text-gray-400 uppercase tracking-widest mb-10">
                                {featuredMovie.director} ({getYear(featuredMovie.release_date)})
                            </p>

                            <div>
                                <button
                                    onClick={() => navigate(`/movies/${featuredMovie.id}`)}
                                    className="bg-[#8B5CF6] hover:bg-violet-700 cursor-pointer text-white px-8 py-3 rounded-full font-bold flex items-center space-x-2 transition-colors duration-300"
                                >
                                    <FontAwesomeIcon icon={faTicketSimple} className="w-5 h-5" />
                                    <span>Comprar Boletos</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <h1 className="text-4xl font-bold text-gray-500">No movies found</h1>
                    )}
                </div>

                <div className="w-80 flex flex-col justify-center h-full">
                    <div className="flex justify-end mb-8 relative">
                        <div className={`flex items-center bg-[#1c2128] border border-gray-700 rounded-full transition-all duration-300 overflow-hidden ${isSearchOpen ? 'w-full opacity-100 ring-2 ring-[#8B5CF6]/50' : 'w-10 h-10 justify-center opacity-70 hover:opacity-100'}`}>
                            {isSearchOpen && (
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => {
                                        if (!searchQuery.trim()) setIsSearchOpen(false);
                                    }}
                                    className="bg-transparent text-white pl-4 py-2 w-full focus:outline-none text-sm"
                                    autoFocus
                                />
                            )}
                            <button
                                onClick={() => {
                                    if (isSearchOpen && searchQuery.trim()) {
                                        executeSearch();
                                    } else if (isSearchOpen && !searchQuery.trim()) {
                                        setIsSearchOpen(false);
                                    } else {
                                        setIsSearchOpen(true);
                                    }
                                }}
                                className={`cursor-pointer p-2 text-gray-400 hover:text-[#8B5CF6] transition-colors flex shrink-0 ${isSearchOpen ? 'pr-3' : ''}`}
                            >
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-5 flex-1 justify-center">
                        {paginatedMovies.map((movie) => {
                            const isCurrent = featuredMovie && movie.id === featuredMovie.id;

                            return (
                                <div
                                    key={movie.id}
                                    onClick={() => setFeaturedIndex(movies.findIndex(m => m.id === movie.id))}
                                    className={`flex items-center space-x-4 cursor-pointer p-2 rounded-lg transition-all ${isCurrent ? 'bg-white/10 border-l-4 border-[#8B5CF6]' : 'hover:bg-white/5 border-l-4 border-transparent'}`}
                                >
                                    <div className="relative w-16 h-16 shrink-0 bg-gray-800 rounded-md">
                                        <Images
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            width="100%"
                                            height="100%"
                                            isRound="rounded-md"
                                            className={`transition-transform duration-500 ${isCurrent ? 'parallax-poster' : 'hover:scale-110'}`}
                                        />
                                        {isCurrent && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md pointer-events-none">
                                                <FontAwesomeIcon icon={faPlay} className="w-5 h-5 text-[#8B5CF6]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <h2 className={`text-sm font-bold truncate w-full ${isCurrent ? 'text-[#8B5CF6]' : 'text-white'}`}>{movie.title}</h2>
                                        <h3 className="text-xs text-gray-400 mt-1 truncate w-full">
                                            {formatGenres(movie.genres)}
                                        </h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-4 mt-8">
                            <button
                                onClick={handlePrevPage}
                                disabled={listPage === 0}
                                className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-[#8B5CF6] hover:border-[#8B5CF6] disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleNextPage}
                                disabled={listPage === totalPages - 1}
                                className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-[#8B5CF6] hover:border-[#8B5CF6] disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Home;