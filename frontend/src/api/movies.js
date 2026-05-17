import apiAxios from "./axios";

export const apiGetMovies = async () => {
    try {
        const response = await apiAxios.get('/movies/active')
        return response.data;
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

export const apiGetMovie = async (id) => {
    try {
        const { data } = await apiAxios.get('/movies/', {
            params: { id }
        })

        return data
    } catch (error) {
        console.error("Error al obtener la película:", error)
        throw error
    }
}