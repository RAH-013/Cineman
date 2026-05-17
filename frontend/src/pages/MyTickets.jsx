import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faTicketSimple,
    faCalendarDays,
    faClock,
    faLocationDot,
    faCouch,
    faBan,
    faCircleCheck,
    faHistory,
    faHandSparkles
} from "@fortawesome/free-solid-svg-icons"

import Loader from '../layouts/Loader'
import Images from '../layouts/Images'

import { apiGetMyTickets } from '../api/tickets'

function MyTickets() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)

    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        loadTickets()
    }, [])

    const loadTickets = async () => {
        setLoading(true)
        try {
            const response = await apiGetMyTickets()
            setTickets(response.data || [])
        } catch (error) {
            console.error("Error al cargar los boletos:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatDateTime = (dateString) => {
        const d = new Date(dateString.replace(' ', 'T'))
        const date = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
        const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        return { date, time }
    }

    const isNewlyPurchased = (purchasedAt) => {
        if (!purchasedAt) return false;
        const purchaseDate = new Date(purchasedAt.replace(' ', 'T'));
        const diffInMinutes = (currentTime - purchaseDate) / (1000 * 60);
        return diffInMinutes < 2;
    }

    const upcomingTickets = tickets.filter(t => {
        const startTime = new Date(t.start_time.replace(' ', 'T'))
        return t.status === 'paid' && startTime >= currentTime
    }).sort((a, b) => new Date(a.start_time.replace(' ', 'T')) - new Date(b.start_time.replace(' ', 'T')))

    const pastTickets = tickets.filter(t => {
        const startTime = new Date(t.start_time.replace(' ', 'T'))
        return t.status === 'paid' && startTime < currentTime
    }).sort((a, b) => new Date(b.start_time.replace(' ', 'T')) - new Date(a.start_time.replace(' ', 'T')))

    const expiredTickets = tickets.filter(t =>
        t.status === 'expired' || t.status === 'cancelled'
    ).sort((a, b) => new Date(b.start_time.replace(' ', 'T')) - new Date(a.start_time.replace(' ', 'T')))


    const TicketCard = ({ ticket, type }) => {
        const { date, time } = formatDateTime(ticket.start_time)

        const isUpcoming = type === 'upcoming'
        const isExpired = type === 'expired'

        const isNew = isUpcoming && isNewlyPurchased(ticket.purchased_at);

        let borderStyle = 'border-white/10 hover:border-white/30 opacity-80'; // Default (Past)

        if (isNew) {
            borderStyle = 'border-[#8B5CF6] shadow-[0_0_25px_rgba(139,92,246,0.6)] animate-pulse hover:animate-none relative scale-[1.02] transform z-10 bg-[#8B5CF6]/10';
        } else if (isUpcoming) {
            borderStyle = 'border-[#8B5CF6]/30 hover:border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.1)]';
        } else if (isExpired) {
            borderStyle = 'border-red-500/20 opacity-60 grayscale';
        }

        const statusIcon = isUpcoming
            ? <FontAwesomeIcon icon={faCircleCheck} className="text-[#8B5CF6]" />
            : isExpired
                ? <FontAwesomeIcon icon={faBan} className="text-red-400" />
                : <FontAwesomeIcon icon={faHistory} className="text-gray-400" />

        const statusText = isUpcoming
            ? 'Activo'
            : isExpired
                ? 'Expirado / Cancelado'
                : 'Finalizada'

        return (
            <div className={`relative flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white/5 border backdrop-blur-sm transition-all duration-500 group ${borderStyle}`}>
                {isNew && (
                    <div className="absolute -top-3 -right-3 bg-linear-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(139,92,246,0.5)] z-20 flex items-center gap-1">
                        <FontAwesomeIcon icon={faHandSparkles} />
                        ¡Recién comprado!
                    </div>
                )}

                <div className="w-24 sm:w-32 shrink-0 aspect-2/3 rounded-xl overflow-hidden relative">
                    <Images
                        src={ticket.poster_url}
                        alt={ticket.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
                </div>

                <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
                    <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                                {statusIcon}
                                <span className={isUpcoming ? 'text-[#8B5CF6]' : isExpired ? 'text-red-400' : 'text-gray-400'}>
                                    {statusText}
                                </span>
                            </span>
                            <span className="text-xs font-bold text-gray-500 tracking-widest">
                                ID: {ticket.id.split('-')[0]}
                            </span>
                        </div>

                        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3 truncate">
                            {ticket.title}
                        </h3>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-300">
                                <FontAwesomeIcon icon={faCalendarDays} className="text-[#8B5CF6] w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <FontAwesomeIcon icon={faClock} className="text-[#8B5CF6] w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <FontAwesomeIcon icon={faLocationDot} className="text-[#8B5CF6] w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Sala {ticket.room}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <FontAwesomeIcon icon={faCouch} className="text-[#8B5CF6] w-4" />
                                <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${isNew ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-[#8B5CF6]/20 border-[#8B5CF6]/30'}`}>
                                    {ticket.seat_row}-{ticket.seat_number}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            Comprado: {formatDateTime(ticket.purchased_at).time}
                        </span>
                        <span className="text-lg font-black text-white">
                            ${ticket.total_price}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <Loader />
        )
    }

    return (
        <div className="relative w-full min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden pt-24 pb-20 selection:bg-[#8B5CF6] selection:text-white">
            <div className="fixed inset-0 z-0 bg-[#0a0a0f] overflow-hidden pointer-events-none select-none">
                <div className="absolute top-0 right-1/4 w-150 h-150 bg-[#8B5CF6]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-120 h-120 bg-[#8B5CF6]/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-12">
                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="w-14 h-14 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20 shadow-[inner_0_0_15px_rgba(139,92,246,0.2)]">
                        <FontAwesomeIcon icon={faTicketSimple} className="text-2xl text-[#8B5CF6]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-1">
                            Mis Boletos
                        </h1>
                    </div>
                </div>

                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/10 text-center backdrop-blur-md">
                        <FontAwesomeIcon icon={faTicketSimple} className="text-6xl text-gray-600 mb-6" />
                        <p className="text-xl font-black uppercase text-white mb-2 tracking-widest">
                            Aún no tienes boletos
                        </p>
                        <p className="text-sm text-gray-400 tracking-wider">
                            Tus compras aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {upcomingTickets.length > 0 && (
                            <section>
                                <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-[#8B5CF6] rounded-full shadow-[0_0_10px_rgba(139,92,246,0.6)]"></span>
                                    Próximas Funciones
                                    <span className="bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs px-2 py-1 rounded-md ml-2 border border-[#8B5CF6]/30">
                                        {upcomingTickets.length}
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {upcomingTickets.map(ticket => (
                                        <TicketCard key={ticket.id} ticket={ticket} type="upcoming" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {pastTickets.length > 0 && (
                            <section>
                                <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-white/20 rounded-full"></span>
                                    Historial
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {pastTickets.map(ticket => (
                                        <TicketCard key={ticket.id} ticket={ticket} type="past" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {expiredTickets.length > 0 && (
                            <section>
                                <h2 className="text-xl font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-red-500/20 rounded-full"></span>
                                    Cancelados / Expirados
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {expiredTickets.map(ticket => (
                                        <TicketCard key={ticket.id} ticket={ticket} type="expired" />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyTickets