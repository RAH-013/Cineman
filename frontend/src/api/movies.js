import apiAxios from "./axios";

export const apiGetMovies = async () => {
    try {
        const { data } = await apiAxios.get('/movies');
        return data;
    } catch (error) {
        console.error("Error al obtener películas:", error);
        throw error;
    }
};

export const apiGetActiveMovies = async () => {
    try {
        const { data } = await apiAxios.get('/movies/active');
        return data;
    } catch (error) {
        console.error("Error al obtener películas:", error);
        throw error;
    }
};

export const apiGetMovie = async (id) => {
    try {
        const { data } = await apiAxios.get('/movies/', {
            params: { id }
        });
        return data;
    } catch (error) {
        console.error("Error al obtener la película:", error);
        throw error;
    }
};

export const apiCreateMovie = async (formData) => {
    try {
        const { data } = await apiAxios.post('/movies', formData);
        return data;
    } catch (error) {
        console.error("Error al crear la película:", error);
        throw error;
    }
};

export const apiUpdateMovie = async (formData) => {
    try {
        const { data } = await apiAxios.put('/movies', formData);
        return data;
    } catch (error) {
        console.error("Error al actualizar la película:", error);
        throw error;
    }
};

export const apiDeleteMovie = async (id) => {
    try {
        const { data } = await apiAxios.delete('/movies/', {
            params: { id }
        });
        return data;
    } catch (error) {
        console.error("Error al eliminar la película:", error);
        throw error;
    }
};