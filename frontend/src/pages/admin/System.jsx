import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faDownload,
    faDatabase,
    faServer,
    faUsersCog,
    faTerminal,
    faTrashAlt,
    faEye,
    faHistory
} from "@fortawesome/free-solid-svg-icons"

import {
    apiGetLastBackup,
    apiGetNewBackup,
    apiSetBackup,
    apiUsersSeeds,
    apiGetLogs,
    apiGetServerHtop
} from '../../api/system'
import Loader from "../../layouts/Loader"

export default function System() {
    const [loading, setLoading] = useState(false)
    const [logsPage, setLogsPage] = useState(1)
    const [hasMoreLogs, setHasMoreLogs] = useState(false)
    const [logs, setLogs] = useState([
        { type: 'system', text: 'Sistema inicializado... Esperando acción.' }
    ])
    const terminalEndRef = useRef(null)

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const addLog = (text, type = 'output') => {
        const time = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, { time, text, type }])
    }

    const clearTerminal = () => {
        setLogs([{ type: 'system', text: 'Terminal limpiada. Esperando acciones...' }])
        setHasMoreLogs(false)
        setLogsPage(1)
    }

    const handleAction = async (actionName, apiCall) => {
        if (loading) return
        try {
            setLoading(true)
            addLog(`cineman:~$ ${actionName}`, 'command')
            const res = await apiCall()
            if (res?.message) addLog(`SUCCESS: ${res.message}`, 'success')
            if (res?.output) addLog(res.output, 'output')
            if (!res?.message && !res?.output) {
                addLog('Script ejecutado correctamente. Proceso finalizado.', 'success')
            }
        } catch (error) {
            addLog(`ERROR: ${error.message || 'Fallo en la ejecución del script.'}`, 'error')
        } finally {
            setLoading(false)
        }
    }

    const streamLogsData = (newDbLogs, isFirstPage) => {
        let index = 0;

        const interval = setInterval(() => {
            if (index < newDbLogs.length) {
                const nextLog = newDbLogs[index];

                setLogs(prev => {
                    if (isFirstPage && index === 0) {
                        const baseLogs = prev.filter(l => l.type !== 'db_log');
                        return [...baseLogs, nextLog];
                    }
                    return [...prev, nextLog];
                });
                index++;
            } else {
                clearInterval(interval);
                setLoading(false);
            }
        }, 45);
    }

    const handleMonitorLogs = async (page = 1) => {
        if (loading) return
        try {
            setLoading(true)
            const limit = 20
            const offset = (page - 1) * limit

            addLog(`cineman:~$ getLogs --offset=${offset} --limit=${limit}`, 'command')

            const res = await apiGetLogs({ params: { limit, offset } })

            if (res?.success && res?.data && res.data.length > 0) {
                const formattedDbLogs = res.data.map(log => ({
                    type: 'db_log',
                    data: {
                        severity: log.status_code >= 400 ? 'critical' : 'info',
                        method: log.method || '',
                        status_code: log.status_code,
                        endpoint: log.route || log.url || '',
                        action: log.action || 'AUDIT',
                        message: log.message || 'Request executed',
                        user_role: log.user_role || 'user',
                        ip_address: log.ip_address,
                        created_at: log.created_at
                    }
                }))

                streamLogsData(formattedDbLogs, page === 1);
                setLogsPage(page)

                const totalCargados = offset + res.data.length
                setHasMoreLogs(totalCargados < (res.count || 0))
            } else {
                addLog('No se encontraron más registros de logs en la base de datos.', 'system')
                setHasMoreLogs(false)
                setLoading(false)
            }
        } catch (error) {
            addLog(`ERROR: No se pudo establecer conexión con el recolector de logs.`, 'error')
            setHasMoreLogs(false)
            setLoading(false)
        }
    }

    const renderDbLogLine = (logData, index) => {
        const {
            severity, method, status_code, endpoint,
            action, message, user_role, ip_address, created_at
        } = logData

        const severityColors = {
            info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            critical: 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse'
        }

        const methodColors = {
            GET: 'text-emerald-400',
            POST: 'text-cyan-400',
            PUT: 'text-amber-400',
            DELETE: 'text-red-400'
        }

        const statusCodeColor = status_code >= 500 ? 'text-red-500 font-bold' : status_code >= 400 ? 'text-amber-500' : 'text-emerald-500'
        const roleColor = user_role === 'admin' ? 'text-violet-400' : user_role === 'manager' ? 'text-blue-400' : 'text-gray-400'

        return (
            <div
                key={index}
                className="p-3 bg-white/1 border border-white/3 rounded-xl font-mono text-[11px] space-y-1.5 hover:bg-white/3 transition-colors duration-150 animate-in fade-in slide-in-from-top-1 ease-out"
            >
                <div className="flex flex-wrap items-center gap-2 text-gray-500">
                    <span className="text-gray-600">[{created_at}]</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${severityColors[severity] || 'text-gray-400'}`}>
                        {severity}
                    </span>
                    {method && (
                        <span className={`font-black ${methodColors[method] || 'text-white'}`}>
                            {method}
                        </span>
                    )}
                    {endpoint && <span className="text-gray-300 truncate max-w-62.5">{endpoint}</span>}
                    {status_code && (
                        <span className={`bg-black/40 px-1.5 py-0.5 rounded border border-white/5 ${statusCodeColor}`}>
                            Status: {status_code}
                        </span>
                    )}
                </div>
                <div className="text-gray-300 pl-2 border-l border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <span className="text-violet-400 font-bold mr-1">[{action}]</span>
                        <span className="text-neutral-400">{message}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 flex items-center gap-2 shrink-0">
                        {user_role && (
                            <span className={`uppercase font-bold ${roleColor}`}>
                                • {user_role}
                            </span>
                        )}
                        {ip_address && <span>• IP: {ip_address}</span>}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-screen bg-[#07070a] text-white p-6 lg:p-10 font-sans selection:bg-violet-600 flex flex-col overflow-hidden">

            <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-125 h-125 bg-violet-600/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 bg-blue-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full h-full flex flex-col gap-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b border-white/5 pb-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5 text-violet-400 font-bold text-xs uppercase tracking-[0.25em]">
                            <FontAwesomeIcon icon={faServer} className="text-sm" />
                            <span>Consola</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400 mt-1">
                            Sistema
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                    <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">

                        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500 mb-1 flex items-center gap-2">
                            Auditoría
                        </h2>

                        <button
                            onClick={() => handleMonitorLogs(1)}
                            disabled={loading}
                            className="group flex items-center gap-4 p-5 bg-linear-to-r from-violet-600/10 to-transparent hover:from-violet-600/20 border border-violet-500/20 hover:border-violet-500/40 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-[0_0_25px_rgba(139,92,246,0.05)]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-400 group-hover:scale-105 transition-transform">
                                <FontAwesomeIcon icon={faEye} className="text-lg animate-pulse" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wide text-violet-300 group-hover:text-white mb-0.5">Monitorear Logs</h3>
                                <p className="text-xs text-gray-400 truncate">Inspecciona y lee la trazabilidad completa del servidor.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('server_htop', apiGetServerHtop)}
                            disabled={loading}
                            className="group flex items-center gap-4 p-5 bg-white/2 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-cyan-400 transition-colors">
                                <FontAwesomeIcon icon={faTerminal} className="text-lg" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wide text-gray-200 group-hover:text-white mb-0.5">
                                    Server HTOP
                                </h3>

                                <p className="text-xs text-gray-500 truncate">
                                    Monitorea CPU, RAM, disco y procesos activos del servidor.
                                </p>
                            </div>
                        </button>

                        <div className="w-full h-px bg-white/5 my-2" />

                        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500 mb-1 flex items-center gap-2">
                            Scripts
                        </h2>

                        <button
                            onClick={() => handleAction('get_last_backup', apiGetLastBackup)}
                            disabled={loading}
                            className="group flex items-center gap-4 p-5 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-white transition-colors">
                                <FontAwesomeIcon icon={faDownload} className="text-lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wide text-gray-200 group-hover:text-white mb-0.5">Último Backup</h3>
                                <p className="text-xs text-gray-500 truncate">Descarga el último respaldo generado en el servidor.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('generate_new_backup', apiGetNewBackup)}
                            disabled={loading}
                            className="group flex items-center gap-4 p-5 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-white transition-colors">
                                <FontAwesomeIcon icon={faDatabase} className="text-lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wide text-gray-200 group-hover:text-white mb-0.5">Generar Nuevo Backup</h3>
                                <p className="text-xs text-gray-500 truncate">Descarga un nuevo backup generado al momento.</p>
                            </div>
                        </button>

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

                        <button
                            onClick={() => handleAction('run_users_seeds', apiUsersSeeds)}
                            disabled={loading}
                            className="group flex items-center gap-4 p-5 bg-white/2 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-2xl text-left transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-emerald-400 transition-colors">
                                <FontAwesomeIcon icon={faUsersCog} className="text-lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm uppercase tracking-wide text-gray-200 group-hover:text-white mb-0.5">Crear usuarios</h3>
                                <p className="text-xs text-gray-500 truncate">Inserta datos del staff en el sistema.</p>
                            </div>
                        </button>

                        {loading && (
                            <div className="flex items-center justify-center p-4 bg-white/1 border border-dashed border-white/5 rounded-2xl mt-2">
                                <Loader />
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-7 flex flex-col bg-[#020204] border border-white/10 rounded-3xl shadow-2xl overflow-hidden min-h-100 lg:min-h-0 relative">

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

                            <button
                                onClick={clearTerminal}
                                title="Limpiar Consola"
                                className="text-gray-500 hover:text-white transition-colors cursor-pointer w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center"
                            >
                                <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                            </button>
                        </div>

                        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs leading-relaxed space-y-2 selection:bg-neutral-800 scrollbar-thin">

                            {hasMoreLogs && (
                                <div className="flex justify-center pb-3 border-b border-white/3">
                                    <button
                                        onClick={() => handleMonitorLogs(logsPage + 1)}
                                        disabled={loading}
                                        className="font-mono text-[10px] text-neutral-500 hover:text-violet-400 bg-white/2 border border-white/5 hover:border-violet-500/30 px-4 py-1.5 rounded-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                                    >
                                        <FontAwesomeIcon icon={faHistory} className="text-[9px]" />
                                        [ CARGAR TRACE LOGS ANTERIORES ]
                                    </button>
                                </div>
                            )}

                            {logs.map((log, index) => {
                                if (log.type === 'db_log') {
                                    return renderDbLogLine(log.data, index)
                                }
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
                                return (
                                    <pre key={index} className="text-gray-400 pl-4 whitespace-pre-wrap font-mono text-[11px] bg-white/1 p-2 rounded border border-white/2">
                                        {log.text}
                                    </pre>
                                )
                            })}

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
} System