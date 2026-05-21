import apiAxios from "./axios";

export const apiGetShowtimes = async () => {
    try {
        const { data } = await apiAxios.get('/showtimes/all');
        return data;
    } catch (error) {
        console.error("Error al obtener funciones:", error);
        throw error;
    }
};

export const apiGetShowtimeById = async (id) => {
    try {
        const { data } = await apiAxios.get('/showtimes', {
            params: { id }
        });

        return data;
    } catch (error) {
        console.error("Error al obtener función:", error);
        throw error;
    }
};

export const apiGetShowtimesByMovie = async (movieId) => {
    try {
        const { data } = await apiAxios.get('/showtimes/movie', {
            params: { movie_id: movieId }
        });

        return data;
    } catch (error) {
        console.error("Error al obtener funciones por película:", error);
        throw error;
    }
};

export const apiCreateShowtime = async (showtime) => {
    try {
        const { data } = await apiAxios.post('/showtimes', showtime);
        return data;
    } catch (error) {
        console.error("Error al crear función:", error);
        throw error;
    }
};

export const apiUpdateShowtime = async (id, showtime) => {
    try {
        const { data } = await apiAxios.put('/showtimes', {
            id,
            ...showtime
        });

        return data;
    } catch (error) {
        console.error("Error al actualizar función:", error);
        throw error;
    }
};

export const apiDeleteShowtime = async (id) => {
    try {
        const { data } = await apiAxios.delete('/showtimes', {
            params: { id }
        });

        return data;
    } catch (error) {
        console.error("Error al eliminar función:", error);
        throw error;
    }
};