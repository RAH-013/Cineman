import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiGetMovies } from '../api/movies';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faChevronLeft,
    faChevronRight,
    faFilm
} from "@fortawesome/free-solid-svg-icons";

import Images from '../layouts/Images';
import Loader from '../layouts/Loader';

const formatGenres = (genresString) => {
    if (!genresString) return '';
    const firstGenre = genresString.split(',')[0].trim();
    return firstGenre.charAt(0).toUpperCase() + firstGenre.slice(1);
};

const getYear = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
};

function Movies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const searchQuery = searchParams.get('search') || '';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const ITEMS_PER_PAGE = 4;

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
        if (query) {
            setSearchParams({ search: query, page: '1' });
        } else {
            searchParams.delete('search');
            searchParams.set('page', '1');
            setSearchParams(searchParams);
        }
    };

    const handlePageChange = (newPage) => {
        const currentParams = Object.fromEntries([...searchParams]);
        setSearchParams({ ...currentParams, page: newPage.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genres.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
    const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

    const paginatedMovies = filteredMovies.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full min-h-screen bg-[#0a0a0f]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="relative flex flex-col w-full min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden font-sans selection:bg-violet-600 selection:text-white">

            <div className="fixed inset-0 z-0 pointer-events-none select-none">
                <div className="absolute top-[-20%] left-[10%] w-150 h-150 bg-violet-600/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-125 h-125 bg-fuchsia-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col container mx-auto max-w-360 px-6 py-12 md:px-12 md:py-20 lg:pt-24">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 text-violet-500 mb-2">
                            <FontAwesomeIcon icon={faFilm} className="w-6 h-6" />
                            <span className="text-xs font-black tracking-[0.3em] uppercase">Exhibición</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400">
                            Cartelera
                        </h1>
                    </div>

                    <div className="w-full md:w-80 relative group">
                        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent group-focus-within:via-violet-400 transition-all duration-500"></div>
                        <div className="relative flex items-center bg-white/2 hover:bg-white/4 transition-colors rounded-2xl p-1">
                            <input
                                type="text"
                                placeholder="Buscar película..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="bg-transparent text-white w-full py-3 px-5 focus:outline-none text-sm placeholder-gray-600 tracking-wider font-medium"
                            />
                            <div className="pr-5 text-gray-500 group-focus-within:text-violet-400 transition-colors">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    {filteredMovies.length > 0 ? (
                        <div className="flex flex-col gap-16">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                                {paginatedMovies.map((movie) => (
                                    <div
                                        key={movie.id}
                                        onClick={() => navigate(`/movies/${movie.id}`)}
                                        className="group relative cursor-pointer aspect-2/3 bg-white/2 rounded-3xl overflow-hidden border border-white/5 hover:border-violet-500/30 transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(139,92,246,0.15)] will-change-transform"
                                    >
                                        <Images
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            isRound="rounded-none"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
                                        />

                                        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />

                                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-black text-violet-300 tracking-[0.2em] uppercase">
                                            {movie.classification}
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                                            <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white mb-2 line-clamp-2 drop-shadow-lg group-hover:text-violet-300 transition-colors duration-300">
                                                {movie.title}
                                            </h2>

                                            <div className="flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.15em]">
                                                    {formatGenres(movie.genres)}
                                                </span>
                                                <span className="text-[10px] font-black text-violet-400 border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {getYear(movie.release_date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-12 pt-8">
                                    <button
                                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                                        disabled={safeCurrentPage === 1}
                                        className="group flex items-center gap-3 text-xs font-black tracking-[0.2em] uppercase text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                                        <span>Anterior</span>
                                    </button>

                                    <div className="flex items-center gap-3 font-medium text-sm tracking-widest text-gray-600 select-none">
                                        <span className="text-white font-bold">{safeCurrentPage}</span>
                                        <span className="w-4 h-px bg-gray-700 rounded-full"></span>
                                        <span>{totalPages}</span>
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                                        disabled={safeCurrentPage === totalPages}
                                        className="group flex items-center gap-3 text-xs font-black tracking-[0.2em] uppercase text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        <span>Siguiente</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 mb-8 rounded-full border border-white/5 bg-white/2 flex items-center justify-center shadow-inner">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-8 h-8 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-widest">Sin resultados</h2>
                            <p className="text-sm text-gray-500 max-w-sm leading-relaxed font-medium">
                                No pudimos encontrar películas que coincidan con "<span className="text-white">{searchQuery}</span>".
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Movies;