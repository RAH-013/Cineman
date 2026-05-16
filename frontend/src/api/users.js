import apiAxios from "./axios";

export const apiGetUsers = async (options) => {
    try {
        const response = await apiAxios.get('/users/all', {
            params: options
        })

        return response.data;
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

export const apiMe = async () => {
    try {
        const response = await apiAxios.get("/users/get");
        return response.data;
    } catch (error) {
        console.error("Error en obtener información personal:", error);
        return error.response.data
    }
};

export const apiMeProfile = async () => {
    try {
        const response = await apiAxios.get("/users/get");
        return response.data;
    } catch (error) {
        console.error("Error en obtener información personal:", error);
        return error.response.data
    }
};

export const apiUpdate = async ({ name, lastname, phone, password }) => {
    try {
        const response = await apiAxios.put('/users', { name, lastname, phone, password });
        return response.data;
    } catch (error) {
        console.error("Error en actualizar usuario:", error);
    }
};

export const apiDelete = async () => {
    try {
        const response = await apiAxios.delete('/users');
        return response.data;
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
    }
}

export const apiGetUserProfile = async (id) => {
    try {
        const response = await apiAxios.get(`/users/profile/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error en obtener información del usuario:", error);
        throw error.response?.data || error;
    }
};

export const apiChangeUserRole = async (id, role) => {
    try {
        const response = await apiAxios.put(`/users/profile/${id}/${role}`);
        return response.data;
    } catch (error) {
        console.error("Error al cambiar rol del usuario:", error);
        throw error.response?.data || error;
    }
};

export const apiUserDelete = async (id) => {
    try {
        const response = await apiAxios.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        throw error.response?.data || error;
    }
};