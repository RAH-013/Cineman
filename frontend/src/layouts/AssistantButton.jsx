import React from 'react'
import { useLocation } from 'react-router-dom'
import Images from './Images'
import Chat from '../components/Chat'
import useChat from '../hooks/useChat'

function AssistantButton() {
    const { pathname } = useLocation()
    const chat = useChat()

    if (!['/', '/movies', '/tickets/my'].includes(pathname)) return null

    return (
        <>
            <Chat chat={chat} />
            <div className='fixed bottom-6 right-6 z-50 group'>
                <div className='absolute inset-0 rounded-full bg-cyan-500 opacity-20 transition-all duration-300 group-hover:animate-ping' />
                <button onClick={chat.toggleChat} aria-label='Abrir asistente virtual de Cineman' className='relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/95 shadow-[0_15px_35px_rgba(31,41,55,0.4)] transition-all duration-300 hover:-rotate-6 hover:scale-110'>
                    <div className='absolute inset-0 rounded-full border border-slate-700' />
                    <div className='flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-800/80 backdrop-blur-sm transition-colors duration-300 group-hover:bg-slate-700/80'>
                        <Images src='/Chat.png' alt='Asistente Cineman' width='36px' className='transition-transform duration-300 group-hover:scale-110' />
                    </div>
                    <span className='absolute bottom-1 right-1 flex h-4 w-4'>
                        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75' />
                        <span className='relative m-auto inline-flex h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-slate-900' />
                    </span>
                </button>
            </div>
        </>
    )
}

export default AssistantButton