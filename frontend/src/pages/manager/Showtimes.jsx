import React, { useState, useEffect, useMemo } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faPen, faTrash, faFilter, faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { apiGetShowtimes, apiDeleteShowtime } from "../../api/showtimes"
import { apiGetActiveMovies } from "../../api/movies"
import { SwalCustom, showToast } from "../../utils/modal"

import ShowtimesForm from "../../components/ShowtimesForm"
import AdminPanel from "../../layouts/AdminPanel"
import Images from "../../layouts/Images"
import Loader from "../../layouts/Loader"
import AdminTable from "../../layouts/AdminTable"

export default function Showtimes() {
    const [showtimes, setShowtimes] = useState([])
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    // Controles para el Panel
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [selectedShowtime, setSelectedShowtime] = useState(null)

    const fetchAllData = async () => {
        try {
            setLoading(true)
            const stRes = await apiGetShowtimes()
            const mvRes = await apiGetActiveMovies()

            if (stRes?.success) setShowtimes(stRes.data)
            if (mvRes?.success) setMovies(mvRes.data)
        } catch (error) {
            showToast("error", "Error al cargar los datos")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAllData() }, [])

    const handleOpenPanel = (st = null) => {
        setSelectedShowtime(st)
        setIsPanelOpen(true)
    }

    const handleClosePanel = () => {
        setIsPanelOpen(false)
        setTimeout(() => setSelectedShowtime(null), 300)
    }

    const handleDelete = (id) => {
        SwalCustom({
            icon: "warning",
            message: "¿Eliminar función? Esta acción no se puede deshacer.",
            callback: async (result) => {
                if (result.isConfirmed) {
                    try {
                        const res = await apiDeleteShowtime(id)
                        if (res?.success) {
                            showToast("success", "Función eliminada")
                            fetchAllData()
                        } else {
                            showToast("error", "Error al eliminar la función")
                        }
                    } catch (error) {
                        showToast("error", "Ocurrió un error al eliminar")
                    }
                }
            }
        })
    }

    const filteredShowtimes = filter === 'active' ? showtimes.filter(st => st.is_active) : showtimes

    const columns = useMemo(() => [
        {
            title: 'Película',
            render: (st) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-14 rounded-md overflow-hidden shrink-0 border border-white/10">
                        <Images src={st.poster_url} alt='poster' isRound='' />
                    </div>
                    <span className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">
                        {st.title}
                    </span>
                </div>
            )
        },
        {
            title: 'Detalles de Sala',
            render: (st) => (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-300 text-sm font-bold">
                        <FontAwesomeIcon icon={faLocationDot} className="text-violet-500/50 text-xs" />
                        Sala {st.room}
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[10px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded uppercase tracking-wider">{st.format}</span>
                        <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase tracking-wider">{st.language}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Fecha y Hora',
            render: (st) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-gray-200">
                        {new Date(st.start_time).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(st.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hs
                    </span>
                </div>
            )
        },
        {
            title: 'Disponibilidad',
            render: (st) => {
                const seats = st.available_seats
                const isLow = seats <= 10
                const isMedium = seats > 10 && seats <= 25

                let containerColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                let dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"

                if (isLow) {
                    containerColor = "bg-red-500/10 border-red-500/20 text-red-400"
                    dotColor = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"
                } else if (isMedium) {
                    containerColor = "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                    dotColor = "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"
                }

                return (
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] font-black uppercase tracking-wider ${containerColor}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                        {seats} {seats === 1 ? 'Libre' : 'Libres'}
                    </div>
                )
            }
        },
        {
            title: 'Estado',
            render: (st) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${st.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {st.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                </div>
            )
        },
        {
            title: 'Acciones',
            className: 'text-right',
            render: (st) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenPanel(st)} className="cursor-pointer w-9 h-9 rounded-lg bg-white/5 hover:bg-violet-600/20 text-gray-400 hover:text-violet-400 transition-all border border-white/5 hover:border-violet-500/30">
                        <FontAwesomeIcon icon={faPen} className="text-xs" />
                    </button>
                    <button onClick={() => handleDelete(st.id)} className="cursor-pointer w-9 h-9 rounded-lg bg-white/5 hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/30">
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                </div>
            )
        }
    ], [showtimes])

    if (loading) return <div className="flex h-screen bg-[#0a0a0f] items-center justify-center"><Loader /></div>

    return (
        <div className="h-screen bg-[#0a0a0f] text-white p-6 lg:p-10 font-sans selection:bg-violet-600 flex flex-col">
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6 overflow-hidden">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Gestor de Funciones</h1>
                    </div>
                    <button
                        onClick={() => handleOpenPanel()}
                        className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-600/20 active:scale-95"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Nueva Función
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

                    <AdminTable columns={columns} data={filteredShowtimes} />
                </div>
            </div>

            <AdminPanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                title={selectedShowtime ? 'Editar Función' : 'Nueva Función'}
                formId="showtimesAdminForm"
            >
                <ShowtimesForm
                    formId="showtimesAdminForm"
                    initialData={selectedShowtime}
                    movies={movies}
                    onSuccess={() => {
                        handleClosePanel()
                        fetchAllData()
                    }}
                />
            </AdminPanel>

        </div>
    )
}