import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import Images from '../layouts/Images';
import { formatDateTime } from '../utils/ticket';

export default function TicketDetail({ ticket, onClose }) {
    if (!ticket) return null;

    const { date, time } = formatDateTime(ticket.start_time);

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col w-screen h-screen overflow-hidden selection:bg-[#8B5CF6] selection:text-white animate-in fade-in duration-500">
            <div className="w-full p-6 md:p-8 shrink-0 flex items-start z-20">
                <button
                    onClick={onClose}
                    className="group flex items-center gap-3 text-white/80 hover:text-white transition-all uppercase tracking-widest text-xs font-black backdrop-blur-md bg-white/5 px-5 py-3 rounded-full border border-white/10 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
                    Volver a mis boletos
                </button>
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-16 pb-12 flex items-center justify-center relative z-10 min-h-0">
                <div className="w-full max-w-4xl bg-[#12121a] rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row shadow-2xl items-stretch overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="flex-1 flex flex-col justify-between p-8 md:p-10 z-10 relative">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-8">
                                {ticket.title}
                            </h2>

                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6 text-left">
                                <div className="flex flex-col">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] font-bold mb-1">Fecha</p>
                                    <p className="text-lg md:text-xl font-black text-white">{date}</p>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] font-bold mb-1">Hora</p>
                                    <p className="text-lg md:text-xl font-black text-white">{time}</p>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] font-bold mb-1">Sala</p>
                                    <p className="text-lg md:text-xl font-black text-[#8B5CF6]">{ticket.room}</p>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] font-bold mb-1">Asiento</p>
                                    <div className="inline-flex items-center">
                                        <p className="text-lg md:text-xl font-black text-[#8B5CF6] px-3 py-1 rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                                            {ticket.seat_row}-{ticket.seat_number}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2 mb-1">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-[#8B5CF6]" /> Total Pagado
                                </p>
                                <p className="text-3xl font-black text-white leading-none">
                                    ${ticket.total_price}
                                </p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-[10px] font-mono tracking-widest text-gray-600 uppercase">
                                    REF: {ticket.id}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block w-px border-r-2 border-dashed border-[#0a0a0f] my-8 shrink-0 z-10 relative">
                        <div className="absolute -top-8 -left-3 w-6 h-6 bg-[#0a0a0f] rounded-full border-b border-white/10"></div>
                        <div className="absolute -bottom-8 -left-3 w-6 h-6 bg-[#0a0a0f] rounded-full border-t border-white/10"></div>
                    </div>
                    <div className="md:hidden h-px border-b-2 border-dashed border-[#0a0a0f] mx-8 shrink-0 z-10 relative">
                        <div className="absolute -left-8 -top-3 w-6 h-6 bg-[#0a0a0f] rounded-full border-r border-white/10"></div>
                        <div className="absolute -right-8 -top-3 w-6 h-6 bg-[#0a0a0f] rounded-full border-l border-white/10"></div>
                    </div>

                    <div className="w-full md:w-[35%] shrink-0 p-4 md:p-6 flex items-center justify-center z-10">
                        <div className="w-full aspect-2/3 md:h-full relative rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5">
                            <Images src={ticket.poster_url} alt={ticket.title} className="w-full h-full object-cover" />
                            {/* Sombra interna para fusionar la imagen con el estilo oscuro */}
                            <div className="absolute inset-0 bg-linear-to-t from-[#12121a]/80 via-transparent to-transparent"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}