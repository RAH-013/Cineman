import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicketSimple } from "@fortawesome/free-solid-svg-icons";

import Loader from '../layouts/Loader';
import { useTickets } from '../hooks/useTickets';
import TicketCard from '../components/TicketCard';
import TicketDetail from '../components/TicketDetail';

export default function MyTickets() {
    const { loading, upcomingTickets, pastTickets, expiredTickets, currentTime, totalTickets } = useTickets();
    const [selectedTicket, setSelectedTicket] = useState(null);

    if (loading) return <Loader />;

    if (selectedTicket) {
        return <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />;
    }

    return (
        <div className="relative w-full min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden pt-24 pb-20 selection:bg-[#8B5CF6] selection:text-white">
            <div className="fixed inset-0 z-0 bg-[#0a0a0f] overflow-hidden pointer-events-none select-none">
                <div className="absolute top-0 right-1/4 w-37.5 h-37.5 bg-[#8B5CF6]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-30 h-30 bg-[#8B5CF6]/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-12">
                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="w-14 h-14 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20 shadow-[inner_0_0_15px_rgba(139,92,246,0.2)]">
                        <FontAwesomeIcon icon={faTicketSimple} className="text-2xl text-[#8B5CF6]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-1">Mis Boletos</h1>
                    </div>
                </div>

                {totalTickets === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center backdrop-blur-md">
                        <FontAwesomeIcon icon={faTicketSimple} className="text-6xl text-gray-600 mb-6" />
                        <p className="text-xl font-black uppercase text-white mb-2 tracking-widest">Aún no tienes boletos</p>
                        <p className="text-sm text-gray-400 tracking-wider">Tus compras aparecerán aquí.</p>
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
                                        <TicketCard key={ticket.id} ticket={ticket} type="upcoming" currentTime={currentTime} onClick={setSelectedTicket} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {pastTickets.length > 0 && (
                            <section>
                                <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-white/20 rounded-full"></span> Historial
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {pastTickets.map(ticket => (
                                        <TicketCard key={ticket.id} ticket={ticket} type="past" currentTime={currentTime} onClick={setSelectedTicket} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {expiredTickets.length > 0 && (
                            <section>
                                <h2 className="text-xl font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-red-500/20 rounded-full"></span> Cancelados / Expirados
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {expiredTickets.map(ticket => (
                                        <TicketCard key={ticket.id} ticket={ticket} type="expired" currentTime={currentTime} onClick={setSelectedTicket} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}