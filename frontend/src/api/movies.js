import apiAxios from "./axios";

export const apiGetMovies = async () => {
    try {
        const response = await apiAxios.get('/movies/active')
        return response.data;
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}