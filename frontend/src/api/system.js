import apiAxios from "./axios";

const downloadFile = async (response) => {
    let filename = 'backup.sql.gz';
    let blobData = response.data;

    if (response.data instanceof Blob && response.data.type === 'application/json') {
        try {
            const text = await response.data.text();
            const jsonData = JSON.parse(text);

            if (jsonData.file) {
                filename = jsonData.file.split('/').pop();
            }
        } catch (e) {
            console.error("Error al procesar el JSON de respuesta:", e);
        }
    } else {
        const disposition = response.headers['content-disposition'];

        if (disposition) {
            const match = disposition.match(/filename="?([^";]+)"?/);

            if (match?.[1]) {
                filename = match[1].split('/').pop().trim();
            }
        }
    }

    const blob = blobData instanceof Blob
        ? blobData
        : new Blob([blobData], { type: 'application/gzip' });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
};

export const apiGetLastBackup = async () => {
    try {
        const response = await apiAxios.get(
            '/system/last-backup',
            {
                responseType: 'blob'
            }
        );
        downloadFile(response);
    } catch (error) {
        console.error(
            "Error al obtener el ultimo backup:",
            error
        );
        throw error;
    }
};

export const apiGetNewBackup = async () => {
    try {
        const response = await apiAxios.get(
            '/system/new-backup',
            {
                responseType: 'blob'
            }
        );
        downloadFile(response);
    } catch (error) {
        console.error(
            "Error al obtener un nuevo backup:",
            error
        );
        throw error;
    }
};

export const apiSetBackup = async () => {
    try {
        const { data } = await apiAxios.post("/system/restore-backup");
        return data;
    } catch (error) {
        console.error(
            "Error al restaurar el ultimo backup:",
            error
        );
        throw error;
    }
}

export const apiUsersSeeds = async () => {
    try {
        const { data } = await apiAxios.post("/system/users-seed");
        return data;
    } catch (error) {
        console.error(
            "Error al obtener un nuevo backup:",
            error
        );
        throw error;
    }
}

export const apiGetLogs = async () => {
    try {
        const response = await apiAxios.get("/system/logs");
        return response.data;
    } catch (error) {
        console.error("Error al obtener los logs:", error);
        throw error.response?.data || error;
    }
};