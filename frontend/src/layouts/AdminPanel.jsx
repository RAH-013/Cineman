import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"

export default function AdminPanel({ isOpen, onClose, title, children, formId }) {
    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`absolute top-0 right-0 h-full w-full max-w-xl bg-[#0a0a0f] shadow-2xl border-l border-white/10 transition-transform duration-500 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="p-8 pb-6 border-b border-white/5 flex items-center justify-between shrink-0">
                    <h2 className="text-2xl font-black uppercase tracking-tight">
                        {title}
                    </h2>
                    <button type="button" onClick={onClose} className="cursor-pointer w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
                    {children}
                </div>

                <div className="p-8 border-t border-white/5 shrink-0 bg-black/40 backdrop-blur-md flex gap-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all text-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form={formId}
                        className="cursor-pointer flex-1 px-6 py-4 rounded-xl bg-violet-600 font-bold text-sm uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 text-white"
                    >
                        Guardar
                    </button>
                </div>

            </div>
        </div>
    )
}