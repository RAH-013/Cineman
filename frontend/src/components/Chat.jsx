import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import {
    faTrash,
    faXmark,
    faPaperPlane,
    faArrowUpRightFromSquare
} from "@fortawesome/free-solid-svg-icons"

function Chat({ chat }) {
    const navigate = useNavigate()
    const {
        isOpen,
        loading,
        input,
        messages,
        messagesEndRef,
        setInput,
        closeChat,
        sendMessage,
        handleKeyDown,
        clearChat
    } = chat

    if (!isOpen) return null

    const handleActionClick = (action) => {
        sendMessage(action.value)
    }

    const renderMessageText = (messageObj) => {
        const text = messageObj.text
        const showtimesData = messageObj.data?.showtimes || []
        const lines = text.split('\n')
        let currentShowtimeIndex = 0

        return lines.map((line, index) => {
            if (line.trim().startsWith('🎬')) {
                const showtimeInfo = showtimesData[currentShowtimeIndex]
                currentShowtimeIndex++

                if (showtimeInfo && showtimeInfo.id) {
                    return (
                        <Link
                            key={index}
                            to={`/tickets/${showtimeInfo.id}`}
                            className='my-1.5 flex w-full items-center justify-between rounded-xl border border-purple-500/15 bg-purple-500/5 px-4 py-3 text-left transition hover:border-purple-500/40 hover:bg-purple-500/10 active:scale-[0.99] no-underline'
                        >
                            <div className='flex items-center gap-3'>
                                <span className='text-sm text-purple-400'>🎬</span>
                                <span className='text-sm font-medium text-white/90'>{line.replace('🎬', '').trim()}</span>
                            </div>
                            <span className='rounded bg-purple-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-purple-900/30'>
                                Elegir
                            </span>
                        </Link>
                    )
                }
            }
            return <div key={index} className="min-h-4 text-sm text-white/90 leading-relaxed">{line}</div>
        })
    }

    return (
        <div className='select-text fixed inset-0 z-999 flex h-screen w-screen flex-col overflow-hidden bg-[#0f0f0f]/95 backdrop-blur-xl'>
            <div className='flex items-center justify-between border-b border-white/10 bg-white/2 px-6 py-4 shadow-sm'>
                <div className='flex items-center gap-3'>
                    <div className='relative'>
                        <img src='/Chat.png' alt='Cineman' className='h-10 w-10 rounded-full border border-white/10 object-cover shadow-lg' />
                        <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-purple-500 ring-2 ring-[#0f0f0f]' />
                    </div>
                    <div>
                        <h2 className='text-sm font-bold tracking-wide text-white'>Cineman</h2>
                        <p className='text-xs font-medium text-white/40'>Asistente virtual</p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={clearChat}
                        title="Limpiar historial"
                        className='cursor-pointer flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-red-500/10 hover:text-red-400'
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-[16px]" />
                    </button>
                    <button
                        onClick={closeChat}
                        title="Cerrar chat"
                        className='cursor-pointer flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white'
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-[20px]" />
                    </button>
                </div>
            </div>

            <div className='flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10'>
                <div className='mx-auto flex max-w-2xl flex-col gap-4'>
                    {messages.map(message => (
                        <div key={message.id} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'user'
                                ? 'rounded-br-sm bg-purple-600 text-white shadow-purple-900/20'
                                : 'rounded-bl-sm border border-white/5 bg-white/6 shadow-black/20'
                                }`}>

                                <div className="whitespace-pre-wrap">
                                    {message.sender === 'user' ? message.text : renderMessageText(message)}
                                </div>

                                {message.url && (
                                    <Link
                                        to={message.url}
                                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-purple-500/20 px-3 py-2 text-xs font-medium text-purple-200 transition hover:bg-purple-500/30 no-underline"
                                    >
                                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[12px]" />
                                        Ver detalles de la película
                                    </Link>
                                )}

                                {message.actions && message.actions.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {message.actions
                                            .filter(action => action.value !== 'comprar boletos')
                                            .map((action, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleActionClick(action)}
                                                    className="cursor-pointer rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100 transition hover:bg-purple-600 hover:text-white"
                                                >
                                                    {action.label}
                                                </button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className='flex justify-start'>
                            <div className='flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/5 bg-white/6 px-4 py-4 shadow-sm'>
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400"></span>
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '150ms' }}></span>
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className='border-t border-white/10 bg-[#0f0f0f] p-4 sm:p-6'>
                <div className='mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-white/10 bg-white/4 p-2 shadow-inner focus-within:border-purple-500/50 focus-within:bg-white/6 transition-all'>
                    <textarea
                        rows={1}
                        value={input}
                        placeholder='Escribe un mensaje...'
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className='max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none'
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className='cursor-pointer mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-900/20 transition hover:scale-105 hover:bg-purple-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
                <div className='mx-auto mt-2 max-w-2xl text-center'>
                    <p className='text-[10px] text-white/30'>Cineman puede cometer errores. Verifica la disponibilidad en taquilla.</p>
                </div>
            </div>
        </div>
    )
}

export default Chat