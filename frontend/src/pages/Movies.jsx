import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiGetMovies } from '../api/movies';
import { formatGenres, getYear } from '../utils/movie';
import { AVAILABLE_CLASSIFICATIONS, AVAILABLE_GENRES } from "../utils/movies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faChevronLeft,
    faChevronRight,
    faFilm,
    faChevronDown,
    faSliders,
    faCheck
} from "@fortawesome/free-solid-svg-icons";

import Images from '../layouts/Images';
import Loader from '../layouts/Loader';

function Movies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenreOpen, setIsGenreOpen] = useState(false);
    const [isClassificationOpen, setIsClassificationOpen] = useState(false);

    const genreRef = useRef(null);
    const classificationRef = useRef(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const searchQuery = searchParams.get('search') || '';
    const genreFilter = searchParams.get('genre') || 'all';
    const classificationFilter = searchParams.get('classification') || 'all';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (genreRef.current && !genreRef.current.contains(event.target)) {
                setIsGenreOpen(false);
            }
            if (classificationRef.current && !classificationRef.current.contains(event.target)) {
                setIsClassificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const response = await apiGetMovies();
                if (response && response.success && response.data) {
                    setMovies(response.data);
                }
            } catch (error) {
                console.error("Error fetching movies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        const currentParams = Object.fromEntries([...searchParams]);

        if (query) {
            setSearchParams({ ...currentParams, search: query, page: '1' });
        } else {
            searchParams.delete('search');
            searchParams.set('page', '1');
            setSearchParams(searchParams);
        }
    };

    const handleParamChange = (key, value) => {
        const currentParams = Object.fromEntries([...searchParams]);
        if (value !== 'all') {
            setSearchParams({ ...currentParams, [key]: value, page: '1' });
        } else {
            searchParams.delete(key);
            searchParams.set('page', '1');
            setSearchParams(searchParams);
        }
        setIsGenreOpen(false);
        setIsClassificationOpen(false);
    };

    const handlePageChange = (newPage) => {
        const currentParams = Object.fromEntries([...searchParams]);
        setSearchParams({ ...currentParams, page: newPage.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentGenreLabel = AVAILABLE_GENRES.find(g => g.value === genreFilter)?.label || 'Todos los géneros';
    const currentClassificationLabel = AVAILABLE_CLASSIFICATIONS.find(c => c.value === classificationFilter)?.label || 'Clasificaciones';

    const filteredAndSortedMovies = useMemo(() => {
        return movies
            .filter(movie => {
                const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesGenre = genreFilter === 'all' || movie.genres.toLowerCase().includes(genreFilter.toLowerCase());
                const matchesClassification = classificationFilter === 'all' || movie.classification === classificationFilter;
                return matchesSearch && matchesGenre && matchesClassification;
            })
            .sort((a, b) => {
                if (!searchQuery) return 0;

                const q = searchQuery.toLowerCase();
                const aTitle = a.title.toLowerCase();
                const bTitle = b.title.toLowerCase();

                const aIndex = aTitle.indexOf(q);
                const bIndex = bTitle.indexOf(q);

                if (aIndex !== bIndex) {
                    return aIndex - bIndex;
                }

                return aTitle.localeCompare(bTitle);
            });
    }, [movies, searchQuery, genreFilter, classificationFilter]);

    const totalPages = Math.ceil(filteredAndSortedMovies.length / ITEMS_PER_PAGE);
    const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

    const paginatedMovies = useMemo(() => {
        const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedMovies.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredAndSortedMovies, safeCurrentPage]);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full min-h-screen bg-[#07070a]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="relative flex flex-col w-full min-h-screen bg-[#07070a] text-neutral-200 overflow-x-hidden font-sans selection:bg-violet-600 selection:text-white">

            <div className="fixed inset-0 z-0 pointer-events-none select-none">
                <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-violet-600/10 rounded-full blur-[160px]" />
                <div className="absolute bottom-[5%] right-[5%] w-125 h-125 bg-fuchsia-600/5 rounded-full blur-[140px]" />
            </div>

            <div className="relative z-20 flex-1 flex flex-col container mx-auto max-w-7xl px-6 py-12 lg:py-20">

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 pb-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5 text-violet-400 font-bold text-xs uppercase tracking-[0.25em]">
                            <FontAwesomeIcon icon={faFilm} className="text-sm" />
                            <span>Cartelera Oficial</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400">
                            Cartelera
                        </h1>
                    </div>

                    <div className="z-11 grid grid-cols-1 md:grid-cols-3 gap-3 w-full lg:w-auto bg-white/2 p-2 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl">
                        <div className="relative flex items-center bg-black/40 rounded-xl px-4 py-3 border border-white/5 focus-within:border-violet-500/40 focus-within:bg-black/60 transition-all duration-300">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-neutral-500 text-xs shrink-0" />
                            <input
                                type="text"
                                placeholder="Buscar por título..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="bg-transparent border-none text-sm text-white w-full ml-3 focus:outline-none placeholder-neutral-600 font-medium tracking-wide"
                            />
                        </div>

                        <div className="relative" ref={genreRef}>
                            <button
                                onClick={() => {
                                    setIsGenreOpen(!isGenreOpen);
                                    setIsClassificationOpen(false);
                                }}
                                className={`w-full flex items-center justify-between bg-black/40 hover:bg-black/60 border rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer ${isGenreOpen ? 'border-violet-500/40 text-white' : 'border-white/5 text-neutral-400'
                                    }`}
                            >
                                <span className="truncate">{genreFilter === 'all' ? 'Todos los géneros' : currentGenreLabel}</span>
                                <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] text-neutral-500 transition-transform duration-300 ${isGenreOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isGenreOpen && (
                                <div className="absolute left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto bg-[#0d0d14]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 scrollbar-none">
                                    <button
                                        onClick={() => handleParamChange('genre', 'all')}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${genreFilter === 'all' ? 'text-violet-400 bg-violet-500/5 font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                                            }`}
                                    >
                                        <span>Todos los géneros</span>
                                        {genreFilter === 'all' && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                                    </button>
                                    {AVAILABLE_GENRES.map((genre) => (
                                        <button
                                            key={genre.value}
                                            onClick={() => handleParamChange('genre', genre.value)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${genreFilter === genre.value ? 'text-violet-400 bg-violet-500/5 font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="truncate">{genre.label}</span>
                                            {genreFilter === genre.value && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={classificationRef}>
                            <button
                                onClick={() => {
                                    setIsClassificationOpen(!isClassificationOpen);
                                    setIsGenreOpen(false);
                                }}
                                className={`w-full flex items-center justify-between bg-black/40 hover:bg-black/60 border rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer ${isClassificationOpen ? 'border-violet-500/40 text-white' : 'border-white/5 text-neutral-400'
                                    }`}
                            >
                                <span className="truncate">{classificationFilter === 'all' ? 'Clasificaciones' : currentClassificationLabel}</span>
                                <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] text-neutral-500 transition-transform duration-300 ${isClassificationOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isClassificationOpen && (
                                <div className="absolute left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto bg-[#0d0d14]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 scrollbar-none">
                                    <button
                                        onClick={() => handleParamChange('classification', 'all')}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${classificationFilter === 'all' ? 'text-violet-400 bg-violet-500/5 font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                                            }`}
                                    >
                                        <span>Todas</span>
                                        {classificationFilter === 'all' && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                                    </button>
                                    {AVAILABLE_CLASSIFICATIONS.map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => handleParamChange('classification', item.value)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${classificationFilter === item.value ? 'text-violet-400 bg-violet-500/5 font-bold' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                                                }`}
                                        >
                                            <span>{item.label}</span>
                                            {classificationFilter === item.value && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center relative z-10">
                    {paginatedMovies.length > 0 ? (
                        <div className="flex flex-col gap-16">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                                {paginatedMovies.map((movie) => (
                                    <div
                                        key={movie.id}
                                        onClick={() => navigate(`/movies/${movie.id}`)}
                                        className="group relative cursor-pointer aspect-2/3 bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 hover:border-violet-500/40 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.2)] will-change-transform"
                                    >
                                        <Images
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            isRound="rounded-none"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
                                        />

                                        <div className="absolute inset-0 bg-linear-to-t from-[#07070a] via-[#07070a]/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />

                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-black text-violet-400 tracking-wider uppercase">
                                            {movie.classification}
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                            <h2 className="text-lg lg:text-xl font-bold tracking-tight text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors duration-300">
                                                {movie.title}
                                            </h2>

                                            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate max-w-[70%]">
                                                    {formatGenres(movie.genres)}
                                                </span>
                                                <span className="text-[10px] font-medium text-neutral-500">
                                                    {getYear(movie.release_date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                                        disabled={safeCurrentPage === 1}
                                        className="cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center bg-white/2 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-white/2 disabled:hover:text-neutral-400 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                                    </button>

                                    <div className="flex items-center bg-white/2 border border-white/5 px-4 h-10 rounded-xl text-xs font-bold tracking-widest text-neutral-500 select-none">
                                        <span className="text-white font-black">{safeCurrentPage}</span>
                                        <span className="mx-2 text-neutral-700">/</span>
                                        <span>{totalPages}</span>
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                                        disabled={safeCurrentPage === totalPages}
                                        className="cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center bg-white/2 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-white/2 disabled:hover:text-neutral-400 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 mb-6 rounded-2xl border border-white/5 bg-white/2 flex items-center justify-center text-neutral-600">
                                <FontAwesomeIcon icon={faSliders} className="text-xl" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Sin resultados</h2>
                            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                                Modifica los filtros de búsqueda o categoría para encontrar lo que buscas.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Movies;