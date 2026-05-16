import apiAxios from "./axios";
import { jwtDecode } from "jwt-decode";

export const apiAuth = async ({ email, password }) => {
    try {
        const response = await apiAxios.post("/users/login", { email, password });
        return response.data;
    } catch (error) {
        console.error("Error en autenticación:", error);
        return error.response.data
    }
};

export const apiLogout = async () => {
    try {
        const response = await apiAxios.post("/users/logout");
        return response.data;
    } catch (error) {
        console.error("Error en obtener información personal:", error);
        return error.response.data
    }
};

export const apiCreate = async ({ email, password }) => {
    try {
        const response = await apiAxios.post('/users', { email, password });
        return response.data;
    } catch (error) {
        console.error("Error al crear usuario:", error);
    }
}