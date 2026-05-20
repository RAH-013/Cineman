import apiAxios from "./axios";

const downloadFile = (response) => {
    const blob = new Blob(
        [response.data],
        {
            type: 'application/gzip'
        }
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    const disposition =
        response.headers['content-disposition'];

    let filename = 'backup.sql.gz';

    if (disposition) {
        const match =
            disposition.match(/filename="(.+)"/);

        if (match?.[1]) {
            filename = match[1];
        }
    }

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
            '/system/lastBackup',
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
            '/system/newBackup',
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
        const { data } = await apiAxios.post("/system/restoreBackup");
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
        const { data } = await apiAxios.post("/system/usersSeed");
        return data;
    } catch (error) {
        console.error(
            "Error al obtener un nuevo backup:",
            error
        );
        throw error;
    }
}