import apiAxios from "./axios";

export const apiSendChatMessage = async (message) => {
    try {
        const { data } = await apiAxios.post('/chat/message', {
            message
        });

        return data;
    } catch (error) {
        console.error('Error al enviar mensaje al chat:', error);
        throw error;
    }
};