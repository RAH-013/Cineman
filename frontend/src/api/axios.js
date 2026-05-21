import axios from "axios";
import rateLimit from "axios-rate-limit";

const baseAxios = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

const apiAxios = rateLimit(baseAxios, {
    maxRequests: 3,
    perMilliseconds: 1000
});

apiAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error?.response?.data?.message;

        if (message === "API connection failed") {
            console.warn("Fallo de conexión con el API");
            window.location.href = "/";
        }

        return Promise.reject(error);
    },
);

export default apiAxios;