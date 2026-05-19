import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faFilm, faTicket } from "@fortawesome/free-solid-svg-icons"

import Images from '../layouts/Images'

function NotFound() {
    return (
        <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-[#030305] text-white overflow-hidden selection:bg-[#8B5CF6]/40 selection:text-white">

            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-[#8B5CF6]/15 via-[#08080c] to-[#030305]"></div>

            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-size-[40px_40px]"></div>

            <div className="absolute inset-0 bg-[url('/patterns/cartographer.png')] opacity-25 z-0 pointer-events-none"></div>

            <div className="absolute top-[15%] left-[5%] w-100 h-100 bg-[#8B5CF6]/20 rounded-full blur-[140px] mix-blend-screen pointer-events-none z-0 animate-pulse"></div>
            <div className="absolute bottom-[10%] right-[5%] w-125 h-125 bg-violet-900/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0"></div>

            <div className="absolute top-0 w-full h-1 bg-linear-to-r from-transparent via-[#8B5CF6]/50 to-transparent"></div>
            <div className="absolute bottom-0 w-full h-1 bg-linear-to-r from-transparent via-[#8B5CF6]/20 to-transparent"></div>

            <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 bg-[#0a0a0f]/80 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(139,92,246,0.05)] max-w-162.5 w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-hidden scrollbar-hide text-center group transition-all duration-700 hover:border-[#8B5CF6]/40 hover:shadow-[0_0_120px_rgba(139,92,246,0.15)]">

                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#8B5CF6]/30 rounded-tl-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#8B5CF6]/30 rounded-br-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 flex-col gap-4 opacity-20 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div key={`l-${i}`} className="w-2 h-6 rounded-xs bg-white shadow-[0_0_5px_white]"></div>
                    ))}
                </div>
                <div className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 flex-col gap-4 opacity-20 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div key={`r-${i}`} className="w-2 h-6 rounded-xs bg-white shadow-[0_0_5px_white]"></div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-3 sm:gap-4 mb-6 relative z-10 shrink-0 mt-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-12">
                        <Images src="Logo.png" alt='Cineman Logo' isRound='' className="w-full h-full object-contain drop-shadow-[0_0_4px_rgba(139,92,246,0.8)]" />
                    </div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-[0.4em] text-transparent bg-clip-text bg-linear-to-r from-white via-gray-200 to-gray-400 drop-shadow-lg pl-3">
                        CINEMAN
                    </h1>
                </div>

                <div className="relative mb-6 sm:mb-8 w-full flex justify-center items-center shrink-0">
                    <span className="absolute font-black text-[90px] sm:text-[120px] md:text-[140px] leading-none tracking-tighter text-red-500/40 translate-x-1.5 translate-y-1 z-0 blur-[1px] animate-pulse pointer-events-none">
                        404
                    </span>
                    <span className="absolute font-black text-[90px] sm:text-[120px] md:text-[140px] leading-none tracking-tighter text-cyan-500/40 -translate-x-1.5 -translate-y-1 z-0 blur-[1px] animate-pulse pointer-events-none" style={{ animationDelay: '150ms' }}>
                        404
                    </span>

                    <span className="relative block font-black text-[90px] sm:text-[120px] md:text-[140px] leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-white to-[#8B5CF6] drop-shadow-[0_10px_30px_rgba(139,92,246,0.4)] z-10">
                        404
                    </span>

                    <FontAwesomeIcon
                        icon={faFilm}
                        className="absolute text-[110px] sm:text-[140px] md:text-[170px] text-[#8B5CF6]/10 -rotate-12 z-0 transform transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110 pointer-events-none"
                    />
                </div>

                <div className="flex flex-col items-center space-y-3 sm:space-y-4 mb-8 sm:mb-10 max-w-105 relative z-10 shrink-0 px-2">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                        <FontAwesomeIcon icon={faTicket} className="text-[#8B5CF6] w-3 h-3 mr-2" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B5CF6]">
                            Error de Proyección
                        </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white drop-shadow-md">
                        Corte Inesperado
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-gray-400 leading-relaxed max-w-75 sm:max-w-none">
                        El rollo de esta película se ha perdido en el archivo. Verifica tu enlace y vuelve a nuestra cartelera principal.
                    </p>
                </div>

                <Link
                    to="/"
                    className="group/btn relative flex items-center justify-center gap-3 sm:gap-4 px-4 py-2  bg-linear-to-r from-[#6D28D9] to-[#8B5CF6] hover:from-[#7C3AED] hover:to-[#A78BFA] text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.6)] active:scale-[0.98] w-full sm:w-auto overflow-hidden z-10 shrink-0 mb-4"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="relative z-10 group-hover/btn:-translate-x-2 transition-transform duration-300" />
                    <span className="relative z-10">Volver a Cartelera</span>
                </Link>
            </div>
        </div>
    )
}

export default NotFound