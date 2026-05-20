import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faDownload,
    faDatabase,
    faServer,
    faUsersCog,
    faTerminal,
    faTrashAlt
} from "@fortawesome/free-solid-svg-icons"

import { apiGetLastBackup, apiGetNewBackup, apiSetBackup, apiUsersSeeds } from '../../api/system'
import Loader from "../../layouts/Loader"

export default function System() {
    const [loading, setLoading] = useState(false)
    const [logs, setLogs] = useState([
        { type: 'system', text: 'System diagnostics initialized... Ready.' }
    ])
    const terminalEndRef = useRef(null)

    // Desplazar la terminal automáticamente al final con cada nuevo log
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const addLog = (text, type = 'output') => {
        const time = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, { time, text, type }])
    }

    const clearTerminal = () => {
        setLogs([{ type: 'system', text: 'Terminal cleared. Waiting for actions...' }])
    }

    const handleAction = async (actionName, apiCall) => {
        if (loading) return
        try {
            setLoading(true)
            addLog(`cineman-server:~$ ./run_script.sh --action=${actionName}`, 'command')

            const res = await apiCall()

            // Si la API retorna un objeto estructurado con mensajes u outputs
            if (res?.message) addLog(`SUCCESS: ${res.message}`, 'success')
            if (res?.output) addLog(res.output, 'output')

            // Si es una descarga de archivo directa y no retorna payload estructurado
            if (!res?.message && !res?.output) {
                addLog('Script ejecutado correctamente. Proceso finalizado.', 'success')
            }
        } catch (error) {
            addLog(`ERROR: ${error.message || 'Fallo en la ejecución del script del backend.'}`, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative h-screen bg-[#07070a] text-white p-6 lg:p-10 font-sans selection:bg-violet-600 flex flex-col overflow-hidden">

            {/* Efectos ambientales de fondo */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-125 h-125 bg-violet-600/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 bg-blue-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full h-full flex flex-col gap-8">

                {/* Cabecera */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b border-white/5 pb-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5 text-violet-400 font-bold text-xs uppercase tracking-[0.25em]">
                            <FontAwesomeIcon icon={faServer} className="text-sm" />
                            <span>Core Engine</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400 mt-1">
                            Consola del Sistema
                        </h1>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                    {/* Sección Izquierda: Controles / Botones */}
                    <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
                        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500 mb-2 flex items-center gap-2">
                            Scripts Disponibles
                        </h2>

                        {/* Tarjeta: Descargar Último Backup */}
                        <button
                            onClick={() => handleAction('get_last_backup', apiGetLastBackup)}
                            disabled={loading}
                            className="group flex items-center gap-4 p-5 bg-white/2 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/30 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-violet-400 transition-colors">
                                <FontAwesomeIcon icon={faDownload} className="text-lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wide text-gray-200 group-hover:text-white mb-0.5">Último Backup</h3>
                                <p className="text-xs text-gray-500 truncate">Descarga el último respaldo generado en el servidor.</p>
                            </div>
                        </button>

                        {/* Tarjeta: Descargar Nuevo Backup */}
                        <button
                            onClick={() => handleAction('generate_new_backup', apiGetNewBackup)}
                            disabled={loading}
                            className="group flex items-center gap-4 p-5 bg-white/2 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/30 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-violet-400 transition-colors">
                                <FontAwesomeIcon icon={faDatabase} className="text-lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wide text-gray-200 group-hover:text-white mb-0.5">Generar Nuevo Backup</h3>
                                <p className="text-xs text-gray-500 truncate">Fuerza la creación instantánea de un snapshot actual.</p>
                            </div>
                        </button>

                        {/* Tarjeta: Aplicar Último Backup */}
                        <button
                            onClick={() => handleAction('restore_last_backup', apiSetBackup)}
                            disabled={loading}
                            className="group flex items-center gap-4 p-5 bg-white/2 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-blue-400 transition-colors">
                                <FontAwesomeIcon icon={faServer} className="text-lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wide text-gray-200 group-hover:text-white mb-0.5">Restaurar Sistema</h3>
                                <p className="text-xs text-gray-500 truncate">Aplica el último backup sobre la base de datos actual.</p>
                            </div>
                        </button>

                        {/* Tarjeta: Generar Users Seed */}
                        <button
                            onClick={() => handleAction('run_users_seeds', apiUsersSeeds)}
                            disabled={loading}
                            className="group flex items-center gap-4 p-5 bg-white/2 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-emerald-400 transition-colors">
                                <FontAwesomeIcon icon={faUsersCog} className="text-lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wide text-gray-200 group-hover:text-white mb-0.5">Alimentar Semillas</h3>
                                <p className="text-xs text-gray-500 truncate">Inserta datos de prueba simulados para usuarios base.</p>
                            </div>
                        </button>

                        {/* Loader global para acciones pendientes */}
                        {loading && (
                            <div className="flex items-center justify-center p-4 bg-white/1 border border-dashed border-white/5 rounded-2xl mt-2 animate-pulse">
                                <Loader />
                            </div>
                        )}
                    </div>

                    {/* Sección Derecha: Terminal Linux de Respuestas */}
                    <div className="lg:col-span-7 flex flex-col bg-[#020204] border border-white/10 rounded-3xl shadow-2xl overflow-hidden min-h-87.5 lg:min-h-0 relative">

                        {/* Barra Superior Terminal */}
                        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/60 border-b border-white/5 select-none shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                                <span className="text-xs font-mono text-gray-500 ml-2 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTerminal} className="text-[10px]" />
                                    bash — system@cineman-api
                                </span>
                            </div>

                            {/* Botón borrar terminal */}
                            <button
                                onClick={clearTerminal}
                                title="Limpiar Consola"
                                className="text-gray-500 hover:text-white transition-colors cursor-pointer w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center"
                            >
                                <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                            </button>
                        </div>

                        {/* Cuerpo de la Terminal */}
                        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs leading-relaxed space-y-2 selection:bg-neutral-800 scrollbar-thin">
                            {logs.map((log, index) => {
                                if (log.type === 'command') {
                                    return (
                                        <div key={index} className="text-violet-400 font-bold pt-2">
                                            {log.time && <span className="text-gray-600 mr-2 select-none">[{log.time}]</span>}
                                            {log.text}
                                        </div>
                                    )
                                }
                                if (log.type === 'success') {
                                    return (
                                        <div key={index} className="text-emerald-400 pl-4 bg-emerald-500/5 py-1 border-l-2 border-emerald-500/30">
                                            {log.text}
                                        </div>
                                    )
                                }
                                if (log.type === 'error') {
                                    return (
                                        <div key={index} className="text-red-400 pl-4 bg-red-500/5 py-1 border-l-2 border-red-500/30">
                                            {log.text}
                                        </div>
                                    )
                                }
                                if (log.type === 'system') {
                                    return (
                                        <div key={index} className="text-blue-400/80 italic select-none">
                                            {log.text}
                                        </div>
                                    )
                                }
                                // Output Crudo de scripts
                                return (
                                    <pre key={index} className="text-gray-400 pl-4 whitespace-pre-wrap font-mono text-[11px] overflow-x-auto bg-white/1 p-2 rounded border border-white/2">
                                        {log.text}
                                    </pre>
                                )
                            })}

                            {/* Cursor intermitente simulado al final */}
                            {!loading && (
                                <div className="flex items-center gap-1.5 text-gray-600 pt-1">
                                    <span>cineman-server:~$</span>
                                    <span className="w-1.5 h-3.5 bg-gray-500 animate-[pulse_1s_infinite]" />
                                </div>
                            )}

                            <div ref={terminalEndRef} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}