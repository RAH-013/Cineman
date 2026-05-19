import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faClock, faLocationDot, faCouch, faBan, faCircleCheck, faHistory, faHandSparkles } from "@fortawesome/free-solid-svg-icons";
import Images from '../layouts/Images';
import { formatDateTime, isNewlyPurchased } from '../utils/ticket';

export default function TicketCard({ ticket, type, currentTime, onClick }) {
    const { date, time } = formatDateTime(ticket.start_time);
    const isUpcoming = type === 'upcoming';
    const isExpired = type === 'expired';
    const isNew = isUpcoming && isNewlyPurchased(ticket.purchased_at, currentTime);

    const [isPulsing, setIsPulsing] = useState(isNew);

    useEffect(() => {
        if (isNew) {
            const timer = setTimeout(() => setIsPulsing(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isNew]);

    let borderStyle = 'border-white/10 hover:border-white/30 opacity-80 cursor-pointer';

    if (isNew) {
        borderStyle = `border-[#8B5CF6] shadow-[0_0_25px_rgba(139,92,246,0.6)] ${isPulsing ? 'animate-pulse' : ''} hover:animate-none relative scale-[1.02] transform z-10 bg-[#8B5CF6]/10 cursor-pointer`;
    } else if (isUpcoming) {
        borderStyle = 'border-[#8B5CF6]/30 hover:border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.1)] cursor-pointer';
    } else if (isExpired) {
        borderStyle = 'border-red-500/20 opacity-60 grayscale cursor-pointer';
    }

    const statusIcon = isUpcoming ? <FontAwesomeIcon icon={faCircleCheck} className="text-[#8B5CF6]" />
        : isExpired ? <FontAwesomeIcon icon={faBan} className="text-red-400" />
            : <FontAwesomeIcon icon={faHistory} className="text-gray-400" />;

    const statusText = isUpcoming ? 'Activo' : isExpired ? 'Expirado / Cancelado' : 'Finalizada';

    return (
        <div onClick={() => onClick(ticket)} className={`relative flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white/5 border backdrop-blur-sm transition-all duration-500 group ${borderStyle}`}>
            {isNew && (
                <div className="absolute -top-3 -right-3 bg-linear-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(139,92,246,0.5)] z-20 flex items-center gap-1">
                    <FontAwesomeIcon icon={faHandSparkles} /> ¡Recién comprado!
                </div>
            )}

            <div className="w-24 sm:w-32 shrink-0 aspect-2/3 rounded-xl overflow-hidden relative">
                <Images src={ticket.poster_url} alt={ticket.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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

                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3 truncate">{ticket.title}</h3>

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
                        Comprado: {formatDateTime(ticket.purchased_at).date}
                    </span>
                    <span className="text-lg font-black text-white">${ticket.total_price}</span>
                </div>
            </div>
        </div>
    );
}