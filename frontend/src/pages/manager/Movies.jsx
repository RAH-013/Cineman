import React, { useState, useEffect, useMemo } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faPen, faTrash, faFilter, faUser } from "@fortawesome/free-solid-svg-icons"
import { apiGetMovies, apiDeleteMovie } from "../../api/movies"
import { SwalCustom, showToast } from "../../utils/modal"

import MoviesForm from "../../components/MoviesForm"
import AdminPanel from "../../layouts/AdminPanel"
import Images from "../../layouts/Images"
import Loader from "../../layouts/Loader"
import AdminTable from "../../layouts/AdminTable"

export default function Movies() {
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [selectedMovie, setSelectedMovie] = useState(null)

    const fetchAllData = async () => {
        try {
            setLoading(true)
            const res = await apiGetMovies()
            if (res?.success) {
                setMovies(res.data || [])
            }
        } catch (error) {
            showToast("error", "Error al cargar las películas")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAllData() }, [])

    const handleOpenPanel = (movie = null) => {
        setSelectedMovie(movie)
        setIsPanelOpen(true)
    }

    const handleClosePanel = () => {
        setIsPanelOpen(false)
        setTimeout(() => setSelectedMovie(null), 300)
    }

    const handleDelete = (id) => {
        SwalCustom({
            icon: "warning",
            message: "¿Eliminar película? Esta acción eliminará sus funciones asociadas.",
            callback: async (result) => {
                if (result.isConfirmed) {
                    try {
                        const res = await apiDeleteMovie(id)
                        if (res?.success) {
                            showToast("success", "Película eliminada con éxito")
                            fetchAllData()
                        } else {
                            showToast("error", "Error al eliminar la película")
                        }
                    } catch (error) {
                        showToast("error", "Ocurrió un error al eliminar")
                    }
                }
            }
        })
    }

    const filteredMovies = filter === 'active' ? movies.filter(mv => mv.is_active) : movies

    const columns = useMemo(() => [
        {
            title: 'Película',
            render: (mv) => (
                <div className="flex items-center gap-4 max-w-xs">
                    <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-md">
                        <Images src={mv.poster_url} alt='poster' isRound='' />
                    </div>
                    <div className="flex flex-col min-w-0 gap-0.5">
                        <span className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors truncate">
                            {mv.title}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                            <FontAwesomeIcon icon={faUser} className="text-gray-700 text-[9px]" />
                            <span className="truncate">{mv.director}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Género',
            render: (mv) => {
                const genreList = mv.genres
                    ? (typeof mv.genres === 'string' ? mv.genres.split(',') : mv.genres)
                    : []

                const visibleGenre = genreList[0]
                const extraCount = genreList.length - 1

                return (
                    <div className="flex items-center gap-1.5">
                        {visibleGenre ? (
                            <span className="text-[12px] font-black text-violet-400 bg-violet-500/5 border border-violet-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {visibleGenre.trim().replace('_', ' ')}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-600">--</span>
                        )}
                        {extraCount > 0 && (
                            <span className="text-[12px] font-bold text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-md">
                                +{extraCount}
                            </span>
                        )}
                    </div>
                )
            }
        },
        {
            title: 'Clasificación',
            render: (mv) => {
                const cls = mv.classification || 'A'
                let clsColor = "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"

                if (['B15', 'C', 'D'].includes(cls)) {
                    clsColor = "text-red-400 bg-red-500/5 border-red-500/10"
                } else if (cls === 'B') {
                    clsColor = "text-yellow-400 bg-yellow-500/5 border-yellow-500/10"
                }

                return (
                    <span className={`inline-block text-[15px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${clsColor}`}>
                        {cls}
                    </span>
                )
            }
        },
        {
            title: 'Estado',
            render: (mv) => (
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${mv.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {mv.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                </div>
            )
        },
        {
            title: 'Acciones',
            className: 'text-right',
            render: (mv) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenPanel(mv)} className="cursor-pointer w-9 h-9 rounded-lg bg-white/5 hover:bg-violet-600/20 text-gray-400 hover:text-violet-400 transition-all border border-white/5 hover:border-violet-500/30">
                        <FontAwesomeIcon icon={faPen} className="text-xs" />
                    </button>
                    <button onClick={() => handleDelete(mv.id)} className="cursor-pointer w-9 h-9 rounded-lg bg-white/5 hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/30">
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                </div>
            )
        }
    ], [movies])

    if (loading) return <div className="flex h-screen bg-[#0a0a0f] items-center justify-center"><Loader /></div>

    return (
        <div className="h-screen bg-[#0a0a0f] text-white p-6 lg:p-10 font-sans selection:bg-violet-600 flex flex-col">
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6 overflow-hidden">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Gestor de Películas</h1>
                    </div>
                    <button
                        onClick={() => handleOpenPanel()}
                        className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-600/20 active:scale-95"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Nueva Película
                    </button>
                </div>

                <div className="flex flex-col flex-1 min-h-0 bg-white/2 border border-white/5 rounded-3xl backdrop-blur-md shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/1 rounded-t-3xl shrink-0">
                        <div className="flex items-center gap-2 text-gray-400">
                            <FontAwesomeIcon icon={faFilter} className="text-xs" />
                            <span className="text-xs font-bold uppercase tracking-widest">Filtrar por:</span>
                        </div>
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                            {['all', 'active'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`cursor-pointer px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-violet-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {f === 'all' ? 'Todas' : 'Activas'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AdminTable columns={columns} data={filteredMovies} />
                </div>
            </div>

            <AdminPanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                title={selectedMovie ? 'Editar Película' : 'Nueva Película'}
                formId="moviesAdminForm"
            >
                <MoviesForm
                    formId="moviesAdminForm"
                    initialData={selectedMovie}
                    onSuccess={() => {
                        handleClosePanel()
                        fetchAllData()
                    }}
                />
            </AdminPanel>

        </div>
    )
}