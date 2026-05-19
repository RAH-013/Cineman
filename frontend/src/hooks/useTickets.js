import { useState, useEffect } from 'react';
import { apiGetMyTickets } from '../api/tickets';

export const useTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime] = useState(new Date());

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const response = await apiGetMyTickets();
            setTickets(response.data || []);
        } catch (error) {
            console.error("Error al cargar los boletos:", error);
        } finally {
            setLoading(false);
        }
    };

    const upcomingTickets = tickets.filter(t => {
        const startTime = new Date(t.start_time.replace(' ', 'T'));
        return t.status === 'paid' && startTime >= currentTime;
    }).sort((a, b) => new Date(a.start_time.replace(' ', 'T')) - new Date(b.start_time.replace(' ', 'T')));

    const pastTickets = tickets.filter(t => {
        const startTime = new Date(t.start_time.replace(' ', 'T'));
        return t.status === 'paid' && startTime < currentTime;
    }).sort((a, b) => new Date(b.start_time.replace(' ', 'T')) - new Date(a.start_time.replace(' ', 'T')));

    const expiredTickets = tickets.filter(t =>
        t.status === 'expired' || t.status === 'cancelled'
    ).sort((a, b) => new Date(b.start_time.replace(' ', 'T')) - new Date(a.start_time.replace(' ', 'T')));

    return {
        loading,
        upcomingTickets,
        pastTickets,
        expiredTickets,
        currentTime,
        totalTickets: tickets.length
    };
};