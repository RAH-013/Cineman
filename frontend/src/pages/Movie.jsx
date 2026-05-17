import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGetMovie } from '../api/movies';
import { apiGetShowtimesByMovie } from '../api/showtimes';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCalendar,
    faFilm,
    faArrowLeft,
    faClapperboard,
    faTicketSimple,
    faLocationDot
} from "@fortawesome/free-solid-svg-icons";

import Loader from '../layouts/Loader';
import Images from '../layouts/Images';

const formatGenres = (genresString) => {
    if (!genresString) return '';
    return genresString.split(',').map(g => g.trim().charAt(0).toUpperCase() + g.trim().slice(1)).join(', ');
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return utcDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

function Movie() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const movieRes = await apiGetMovie(id);

                if (movieRes && movieRes.success) {
                    setData(movieRes.data);
                }

                const showtimesRes = await apiGetShowtimesByMovie(id);
                if (showtimesRes && showtimesRes.success) {
                    setShowtimes(showtimesRes.data || []);
                } else {
                    setShowtimes([]);
                }
            } catch (error) {
                console.error("Error al cargar datos:", error);
                setShowtimes([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const groupedShowtimes = useMemo(() => {
        if (!showtimes || !showtimes.length) return {};

        return showtimes.reduce((acc, st) => {
            const dateObj = new Date(st.start_time);
            const dateKey = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const cinemaName = st.cinema_name || st.cinema?.name || 'Cine Principal';

            if (!acc[dateKey]) acc[dateKey] = {};
            if (!acc[dateKey][cinemaName]) acc[dateKey][cinemaName] = [];

            acc[dateKey][cinemaName].push({ id: st.id, time: timeStr, ...st });

            return acc;
        }, {});
    }, [showtimes]);

    useEffect(() => {
        const availableDates = Object.keys(groupedShowtimes);
        if (availableDates.length > 0 && !selectedDate) {
            setSelectedDate(availableDates[0]);
        }
    }, [groupedShowtimes, selectedDate]);

    if (isLoading || !data) {
        return <div className="flex items-center justify-center w-full h-screen bg-[#0a0a0f]"><Loader /></div>;
    }

    const availableDates = Object.keys(groupedShowtimes);

    return (
        <div className="relative w-full min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden selection:bg-[#8B5CF6] selection:text-white pb-16">

            <div className="fixed inset-0 z-0 bg-[#0a0a0f] overflow-hidden pointer-events-none select-none">
                <Images
                    src={data.poster_url}
                    alt=""
                    className="w-full h-full object-cover opacity-15 blur-3xl scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-[#0a0a0f]/80" />
                <div className="absolute top-0 right-0 w-125 h-125 bg-[#8B5CF6]/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 flex flex-col lg:flex-row gap-12">

                <div className="w-full max-w-sm lg:w-[320px] mx-auto lg:mx-0 lg:sticky lg:top-16 lg:h-fit shrink-0">
                    <div className="relative group perspective-1000">
                        <div className="absolute -inset-4 bg-linear-to-b from-[#8B5CF6]/30 to-[#f3e8ff]/5 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <Images
                            src={data.poster_url}
                            alt={data.title}
                            className="relative w-full rounded-3xl object-cover shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10"
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0">

                    <button
                        onClick={() => navigate(-1)}
                        className="cursor-pointer w-fit flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 backdrop-blur-md mb-8 group transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-gray-400 group-hover:text-[#8B5CF6] group-hover:-translate-x-1 transition-all" />
                        <span className="text-xs font-black tracking-widest uppercase text-gray-300 group-hover:text-white transition-colors">Volver</span>
                    </button>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight leading-[1.05] mb-6 text-transparent bg-clip-text bg-linear-to-r from-white via-gray-100 to-violet-300">
                        {data.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 mb-10">
                        <span className="px-4 py-1.5 bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-black rounded-full tracking-widest uppercase shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                            {data.classification}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        <div className="flex items-center text-gray-300 text-sm font-bold tracking-widest uppercase">
                            <FontAwesomeIcon icon={faClock} className="mr-2.5 w-4 h-4 text-[#8B5CF6]" />
                            {data.duration_minutes} Min
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                            {formatGenres(data.genres)}
                        </span>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-sm font-black mb-5 flex items-center text-[#8B5CF6] tracking-widest uppercase">
                            <FontAwesomeIcon icon={faFilm} className="w-4 h-4 mr-3" />
                            Sinopsis
                        </h2>
                        <p className="text-gray-300 text-lg leading-relaxed font-medium max-w-4xl">
                            {data.synopsis || "Sinopsis no disponible."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16 max-w-2xl">
                        <div className="bg-white/2 border border-white/5 rounded-2xl p-5 flex items-center gap-5 hover:bg-white/4 hover:border-white/10 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faClapperboard} className="text-[#8B5CF6] w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Director</span>
                                <span className="text-sm font-bold text-gray-200">{data.director || "Desconocido"}</span>
                            </div>
                        </div>
                        <div className="bg-white/2 border border-white/5 rounded-2xl p-5 flex items-center gap-5 hover:bg-white/4 hover:border-white/10 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faCalendar} className="text-[#8B5CF6] w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Estreno</span>
                                <span className="text-sm font-bold text-gray-200 capitalize">{formatDate(data.release_date)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col relative pt-12 border-t border-white/10">
                        <div className="absolute top-0 left-0 w-32 h-px bg-linear-to-r from-[#8B5CF6] to-transparent"></div>

                        <h3 className="text-2xl font-black mb-10 flex items-center text-white tracking-widest uppercase">
                            <FontAwesomeIcon icon={faTicketSimple} className="w-6 h-6 mr-4 text-[#8B5CF6]" />
                            Horarios
                        </h3>

                        {availableDates.length > 0 ? (
                            <div className="flex flex-col gap-10">

                                <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                    {availableDates.map(date => (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            className={`snap-start shrink-0 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 border cursor-pointer ${selectedDate === date
                                                ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-[0_10px_30px_-10px_rgba(139,92,246,0.6)] transform scale-105'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-[#8B5CF6]/40'
                                                }`}
                                        >
                                            {date}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {Object.entries(groupedShowtimes[selectedDate] || {}).map(([cinema, times]) => (
                                        <div key={cinema} className="flex flex-col bg-white/2 p-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm hover:border-[#8B5CF6]/30 hover:bg-white/3 transition-all duration-300">
                                            <h4 className="text-sm font-black text-violet-300 mb-6 flex items-center tracking-widest uppercase">
                                                <FontAwesomeIcon icon={faLocationDot} className="mr-3 text-[#8B5CF6] w-3.5 h-3.5" />
                                                {cinema}
                                            </h4>

                                            <div className="flex flex-wrap gap-3">
                                                {times.map(st => (
                                                    <button
                                                        key={st.id}
                                                        onClick={() => navigate(`/tickets/${st.id}`)}
                                                        className="px-5 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl hover:bg-[#8B5CF6] hover:border-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:-translate-y-1 transition-all duration-300 font-bold text-sm text-gray-300 hover:text-white cursor-pointer active:scale-95 tracking-wider"
                                                    >
                                                        {st.time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/2 rounded-3xl border border-dashed border-white/10 text-center backdrop-blur-md">
                                <div className="w-20 h-20 mb-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20 shadow-[inner_0_0_15px_rgba(139,92,246,0.2)]">
                                    <FontAwesomeIcon icon={faTicketSimple} className="w-8 h-8 text-[#8B5CF6]/50" />
                                </div>
                                <p className="text-white text-xl font-black mb-3 tracking-wide uppercase">Cartelera Vacía</p>
                                <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                                    No hay horarios programados para esta película. Vuelve a revisar más tarde.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Movie;