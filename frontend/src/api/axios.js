import axios from "axios";

const apiAxios = axios.create({
    baseURL: "/api",
    withCredentials: true,
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