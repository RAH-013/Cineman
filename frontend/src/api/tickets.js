import apiAxios from "./axios";

export const apiGetMyTickets = async () => {
    try {
        const { data } = await apiAxios.get('/tickets/me');

        return data;
    } catch (error) {
        console.error("Error al obtener tickets:", error);
        throw error;
    }
};

export const apiGetOccupiedSeats = async (showtime_id) => {
    try {
        const { data } = await apiAxios.get(
            '/tickets',
            {
                params: {
                    showtime_id
                }
            }
        );

        return data;
    } catch (error) {
        console.error("Error al obtener asientos ocupados:", error);
        throw error;
    }
};

export const apiCreateTicket = async (ticket) => {
    try {
        const { data } = await apiAxios.post(
            '/tickets',
            ticket
        );

        return data;
    } catch (error) {
        console.error("Error al crear ticket:", error);
        throw error;
    }
};

export const apiPayTicket = async (id) => {
    try {
        const { data } = await apiAxios.patch(
            '/tickets/pay',
            { id }
        );

        return data;
    } catch (error) {
        console.error("Error al pagar ticket:", error);
        throw error;
    }
};

export const apiCancelTicket = async (id) => {
    try {
        const { data } = await apiAxios.patch(
            '/tickets/cancel',
            { id }
        );

        return data;
    } catch (error) {
        console.error("Error al cancelar ticket:", error);
        throw error;
    }
};