import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faArrowLeft,
    faTicketSimple,
    faClock,
    faLocationDot,
    faXmark,
    faCouch
} from "@fortawesome/free-solid-svg-icons"

import { apiGetShowtimeById } from "../api/showtimes"
import {
    apiGetOccupiedSeats,
    apiCreateTicket,
    apiCancelTicket,
    apiPayTicket
} from "../api/tickets"

import { SwalCustom, showToast } from "../utils/modal"

import Loader from "../layouts/Loader"

function Tickets() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [showtime, setShowtime] = useState(null)
    const [mySeats, setMySeats] = useState([])
    const [selectedSeats, setSelectedSeats] = useState([])
    const [occupiedSeats, setOccupiedSeats] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    const rows = ['A', 'B', 'C', 'D', 'E']
    const seatsPerRow = 10

    useEffect(() => {
        loadShowtime()
    }, [])

    const loadShowtime = async () => {
        if (!id) return
        setLoading(true)
        try {
            const [showtimeRes, occupiedRes] = await Promise.all([
                apiGetShowtimeById(id),
                apiGetOccupiedSeats(id)
            ])

            setShowtime(showtimeRes.data)

            const fetchedSeats = occupiedRes.data || []

            const myReservedSeats = fetchedSeats
                .filter(seat => seat.status === "reserved")
                .map(seat => ({
                    row: seat.seat_row,
                    number: seat.seat_number,
                    ticketId: seat.ticket_id
                }))

            const myPaidSeats = fetchedSeats
                .filter(seat => seat.status === "paid")
                .map(seat => ({
                    row: seat.seat_row,
                    number: seat.seat_number,
                    ticketId: seat.ticket_id
                }))

            const trulyOccupied = fetchedSeats.filter(
                seat => seat.status !== "reserved" && seat.status !== "paid"
            )

            setSelectedSeats(myReservedSeats)
            setMySeats(myPaidSeats)
            setOccupiedSeats(trulyOccupied)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectSeat = async (row, number) => {
        const isOccupied = occupiedSeats.some(s => s.seat_row === row && s.seat_number === number)
        const isMyPaid = mySeats.some(s => s.row === row && s.number === number)

        if (processing || isOccupied || isMyPaid) return

        const existingSeat = selectedSeats.find(s => s.row === row && s.number === number)

        try {
            setProcessing(true)

            if (existingSeat) {
                await apiCancelTicket(existingSeat.ticketId)
                setSelectedSeats(prev => prev.filter(s => s.ticketId !== existingSeat.ticketId))
            } else {
                const response = await apiCreateTicket({
                    showtime_id: id,
                    seat_row: row,
                    seat_number: number,
                    total_price: showtime.price
                })

                setSelectedSeats(prev => [...prev, { row, number, ticketId: response.id }])
            }
        } catch (error) {
            showToast("error", error?.response?.data?.message || "No se pudo procesar el asiento")
        } finally {
            setProcessing(false)
        }
    }

    const handleCancelAll = async () => {
        if (selectedSeats.length === 0) return

        try {
            setProcessing(true)
            await Promise.all(selectedSeats.map(seat => apiCancelTicket(seat.ticketId)))
            setSelectedSeats([])
        } catch (error) {
            showToast("error", "No se pudieron cancelar los asientos")
            console.error(error)
        } finally {
            setProcessing(false)
        }
    }

    const handlePayAll = async () => {
        if (selectedSeats.length === 0) return

        try {
            setProcessing(true)
            await Promise.all(selectedSeats.map(seat => apiPayTicket(seat.ticketId)))

            await SwalCustom({
                icon: 'success',
                message: 'Tus entradas han sido pagadas correctamente.',
                confirmButtonText: 'Ver mis boletos',
                onConfirmAction: () => navigate(`/tickets/my`),
                callback: () => loadShowtime()
            })

            setSelectedSeats([])
        } catch (error) {
            SwalCustom({
                icon: 'error',
                message: error?.response?.data?.message || "No se pudo completar el pago de todas las entradas",
            })
        } finally {
            setProcessing(false)
        }
    }

    const formatDateTime = (isoString) => {
        const d = new Date(isoString)
        const date = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        return { date, time }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-screen bg-[#0a0a0f]">
                <div className="flex flex-col items-center gap-4">
                    <Loader />
                    <span className="text-xs font-black tracking-[0.3em] text-[#8B5CF6] uppercase animate-pulse">Cargando Sala</span>
                </div>
            </div>
        )
    }

    if (!showtime) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-screen bg-[#0a0a0f]">
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/2 rounded-3xl border border-dashed border-white/10 text-center backdrop-blur-md max-w-md">
                    <div className="w-20 h-20 mb-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20 shadow-[inner_0_0_15px_rgba(139,92,246,0.2)]">
                        <FontAwesomeIcon icon={faTicketSimple} className="w-8 h-8 text-[#8B5CF6]/50" />
                    </div>
                    <p className="text-white text-xl font-black mb-3 tracking-wide uppercase">Función no encontrada</p>
                    <p className="text-gray-400 text-sm leading-relaxed">El enlace es incorrecto o la función ya no está disponible.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 text-xs font-black tracking-widest uppercase text-white transition-all"
                    >
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    const { date, time } = formatDateTime(showtime.start_time)
    const subtotal = selectedSeats.length * (showtime.price || 0)

    const SpinnerIcon = ({ className = "w-5 h-5" }) => (
        <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <div className="relative w-full h-full min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden selection:bg-[#8B5CF6] selection:text-white pb-20">
            <div className="fixed inset-0 z-0 bg-[#0a0a0f] overflow-hidden pointer-events-none select-none">
                <div className="absolute top-0 right-0 w-200 h-200 bg-[#8B5CF6]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-150 h-150 bg-[#8B5CF6]/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full px-4 sm:px-6 pt-20 flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
                <div className="flex-1 min-w-0 flex flex-col">
                    <button
                        onClick={() => navigate(-1)}
                        className="cursor-pointer w-fit flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 backdrop-blur-md mb-8 group transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-gray-400 group-hover:text-[#8B5CF6] group-hover:-translate-x-1 transition-all" />
                        <span className="text-xs font-black tracking-widest uppercase text-gray-300 group-hover:text-white transition-colors">Volver</span>
                    </button>

                    <div className="flex flex-col sm:flex-row gap-6 items-start mb-10 bg-white/2 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                        <div className="w-24 sm:w-32 shrink-0 relative group perspective-1000">
                            <div className="absolute -inset-2 bg-linear-to-b from-[#8B5CF6]/40 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                            <img
                                src={showtime.poster_url}
                                alt={showtime.title}
                                className="relative w-full aspect-2/3 rounded-2xl object-cover shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10"
                            />
                        </div>

                        <div className="flex flex-col pt-2 min-w-0 w-full">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-[1.05] mb-4 text-transparent bg-clip-text bg-linear-to-r from-white via-gray-100 to-violet-300 wrap-break-word">
                                {showtime.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="px-4 py-1.5 bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] text-[10px] sm:text-xs font-black rounded-full tracking-widest uppercase shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                                    Sala {showtime.room}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                                <div className="flex items-center text-gray-300 text-xs sm:text-sm font-bold tracking-widest uppercase">
                                    <FontAwesomeIcon icon={faClock} className="mr-2 w-3.5 h-3.5 text-[#8B5CF6]" />
                                    {date} • {time}
                                </div>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/20 hidden sm:block"></span>
                                <span className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-widest block sm:inline-block mt-1 sm:mt-0 w-full sm:w-auto">
                                    {showtime.language} / {showtime.format}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col relative w-full">
                        <h3 className="text-xl font-black mb-8 flex items-center text-white tracking-widest uppercase pl-2">
                            <FontAwesomeIcon icon={faLocationDot} className="w-5 h-5 mr-3 text-[#8B5CF6]" />
                            Mapa de Asientos
                        </h3>

                        <div className="w-full max-w-3xl mx-auto mb-10 flex flex-col items-center relative px-2">
                            <svg viewBox="0 0 800 120" className="w-full h-auto drop-shadow-[0_15px_30px_rgba(139,92,246,0.4)]">
                                <path d="M 0 100 Q 400 0 800 100" fill="none" stroke="#8B5CF6" strokeWidth="4" className="opacity-90" />
                                <path d="M 0 100 Q 400 0 800 100 L 800 120 L 0 120 Z" fill="url(#screenGradient)" className="opacity-40" />
                                <defs>
                                    <linearGradient id="screenGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="absolute bottom-1 md:-bottom-2 text-[8px] md:text-xs font-black uppercase tracking-[0.5em] text-[#8B5CF6]/70">
                                Pantalla
                            </span>
                        </div>

                        <div className="w-full pb-8">
                            <div className="w-full max-w-2xl mx-auto flex flex-col gap-2 sm:gap-3 px-1 sm:px-4">
                                {rows.map((row) => (
                                    <div key={row} className="flex items-center w-full gap-1 sm:gap-2 lg:gap-4 group">

                                        <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-black text-gray-600 group-hover:text-[#8B5CF6] transition-colors shrink-0">
                                            {row}
                                        </span>

                                        <div className="flex-1 grid grid-cols-10 gap-1 sm:gap-2">
                                            {Array.from({ length: seatsPerRow }).map((_, index) => {
                                                const seatNumber = index + 1
                                                const isSelected = selectedSeats.some(s => s.row === row && s.number === seatNumber)
                                                const isMyPaid = mySeats.some(s => s.row === row && s.number === seatNumber)
                                                const isOccupied = occupiedSeats.some(s => s.seat_row === row && s.seat_number === seatNumber)
                                                const isDisabled = processing || isOccupied || isMyPaid

                                                return (
                                                    <button
                                                        key={`${row}-${seatNumber}`}
                                                        onClick={() => handleSelectSeat(row, seatNumber)}
                                                        disabled={isDisabled}
                                                        className={`
                                                            w-full aspect-square rounded-t-md sm:rounded-t-lg rounded-b-xs sm:rounded-b-sm flex items-center justify-center text-[8px] sm:text-[10px] font-black transition-all duration-300 relative outline-none
                                                            ${isSelected
                                                                ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-2 border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.4)] scale-110 -translate-y-1 z-10'
                                                                : isMyPaid
                                                                    ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/50 cursor-not-allowed opacity-80'
                                                                    : isOccupied
                                                                        ? 'bg-white/2 text-gray-600/30 cursor-not-allowed border border-white/5 opacity-50 shadow-inner'
                                                                        : processing
                                                                            ? 'bg-white/2 text-gray-600/50 cursor-not-allowed border border-white/5 shadow-inner'
                                                                            : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-[#8B5CF6]/50 cursor-pointer hover:-translate-y-1'
                                                            }
                                                        `}
                                                    >
                                                        <span className={`relative z-10 leading-none ${isDisabled && !isSelected && !isMyPaid ? 'opacity-20' : ''}`}>
                                                            {seatNumber}
                                                        </span>
                                                        <div className={`absolute bottom-0.5 w-1/2 h-px sm:h-0.5 rounded-full ${isSelected || isMyPaid ? 'bg-[#8B5CF6]' : 'bg-white/10'}`}></div>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-black text-gray-600 group-hover:text-[#8B5CF6] transition-colors shrink-0">
                                            {row}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-center gap-6 sm:gap-8 border-t border-white/10 pt-6 px-4 bg-transparent">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-t-sm rounded-b-xs border border-white/10 bg-white/5"></div>
                                <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-t-sm rounded-b-xs bg-[#8B5CF6]/20 border-2 border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.4)]"></div>
                                <span className="text-[9px] sm:text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest">Seleccionados</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-t-sm rounded-b-xs bg-[#8B5CF6]/10 border border-[#8B5CF6]/50 opacity-80"></div>
                                <span className="text-[9px] sm:text-[10px] font-black text-[#8B5CF6]/80 uppercase tracking-widest">Mis Boletos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-t-sm rounded-b-xs bg-white/2 border border-white/5 opacity-50 shadow-inner"></div>
                                <span className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">Ocupado</span>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="w-1/3 max-w-100 shrink-0 sticky top-20 h-fit">
                    <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-4xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#8B5CF6] to-transparent opacity-50"></div>

                        <h2 className="text-lg font-black text-white tracking-widest uppercase mb-6 flex items-center">
                            <FontAwesomeIcon icon={faTicketSimple} className="text-[#8B5CF6] mr-3" />
                            Resumen de Compra
                        </h2>

                        <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-3 scrollbar-custom min-h-37.5">
                            {selectedSeats.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-50">
                                    <FontAwesomeIcon icon={faCouch} className="text-4xl mb-4 text-gray-500" />
                                    <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Ningún asiento<br />seleccionado</p>
                                </div>
                            ) : (
                                selectedSeats.map((seat) => (
                                    <div key={seat.ticketId} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-[#8B5CF6]/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] font-black shadow-[inner_0_0_10px_rgba(139,92,246,0.2)]">
                                                {seat.row}{seat.number}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">Boleto General</span>
                                                <span className="text-sm font-bold text-white">${showtime.price}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSelectSeat(seat.row, seat.number)}
                                            disabled={processing}
                                            className="w-8 h-8 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                                            title="Remover asiento"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-6 border-t border-white/10 mt-auto shrink-0">
                            <div className="flex justify-between items-end mb-8 gap-4">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 truncate">Total a pagar</span>
                                    <span className="text-sm font-bold text-gray-400">{selectedSeats.length} {selectedSeats.length === 1 ? 'entrada' : 'entradas'}</span>
                                </div>
                                <span className="text-3xl sm:text-4xl font-black text-white leading-none">${subtotal}</span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handlePayAll}
                                    disabled={processing || selectedSeats.length === 0}
                                    className="relative w-full h-14 flex justify-center items-center rounded-xl bg-[#8B5CF6] text-white text-xs font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all shadow-[0_10px_30px_-10px_rgba(139,92,246,0.6)] border border-[#8B5CF6] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#8B5CF6] active:scale-[0.98]"
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <SpinnerIcon className="text-white w-4 h-4" />
                                            <span>Procesando</span>
                                        </div>
                                    ) : (
                                        'Confirmar Pago'
                                    )}
                                </button>

                                <button
                                    onClick={handleCancelAll}
                                    disabled={processing || selectedSeats.length === 0}
                                    className="w-full h-12 flex justify-center items-center rounded-xl border border-white/10 bg-transparent text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {processing ? '...' : 'Cancelar Selección'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Tickets