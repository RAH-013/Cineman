import { useEffect, useRef, useState } from 'react'
import { apiSendChatMessage } from '../api/chat'
import { safeUUID } from "../utils/uuid"

function useChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState('')

    const [messages, setMessages] = useState(() => {
        const savedMessages = sessionStorage.getItem('cineman_chat')
        if (savedMessages) {
            return JSON.parse(savedMessages)
        }
        return [
            {
                id: safeUUID(),
                sender: 'assistant',
                text: 'Hola 👋 Soy Cineman. ¿Qué película quieres ver hoy?'
            }
        ]
    })

    const messagesEndRef = useRef(null)
    useEffect(() => {
        sessionStorage.setItem('cineman_chat', JSON.stringify(messages))
    }, [messages])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const openChat = () => setIsOpen(true)
    const closeChat = () => setIsOpen(false)
    const toggleChat = () => setIsOpen(prev => !prev)

    const addMessage = (sender, text, extra = {}) => {
        setMessages(prev => [
            ...prev,
            { id: safeUUID(), sender, text, ...extra }
        ])
    }

    const sendMessage = async (customMessage = null) => {
        const textToSend = customMessage || input.trim()
        if (!textToSend || loading) return

        addMessage('user', textToSend)
        setInput('')
        setLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 700))
            const response = await apiSendChatMessage(textToSend)

            addMessage('assistant', response?.message || 'No pude responder eso 😢', {
                type: response?.type || 'text',
                data: response?.data || null,
                url: response?.data?.url || null,
                actions: response?.data?.actions || []
            })
        } catch (error) {
            addMessage('assistant', 'Ocurrió un error al conectar con Cineman 😢')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            await sendMessage()
        }
    }

    const clearChat = () => {
        const defaultMessage = [
            {
                id: safeUUID(),
                sender: 'assistant',
                text: 'Hola 👋 Soy Cineman. ¿Qué película quieres ver hoy?'
            }
        ]
        setMessages(defaultMessage)
    }

    return {
        isOpen,
        loading,
        input,
        messages,
        messagesEndRef,
        setInput,
        openChat,
        closeChat,
        toggleChat,
        sendMessage,
        handleKeyDown,
        clearChat
    }
}

export default useChat