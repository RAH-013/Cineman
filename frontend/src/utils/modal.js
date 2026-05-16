import Swal from "sweetalert2"

export const SwalCustom = ({
    icon = "success",
    message = "Mensaje por defecto",
    autoclose = false,
    onConfirmAction = null,
    callback = null,
    input = false,
    inputPlaceholder = "",
    inputUpperCase = false,
    inputValidator = null
} = {}) => {
    Swal.fire({
        icon,
        html: `<h1 class="text-xl font-bold text-gray-100 text-center mb-2">${message}</h1>`,
        input: input ? "text" : undefined,
        inputPlaceholder,
        inputValidator,

        inputAttributes: inputUpperCase ? {
            autocapitalize: "characters",
            style: "text-transform: uppercase;"
        } : {},

        didOpen: () => {
            if (input && inputUpperCase) {
                const inputEl = Swal.getInput();
                if (inputEl) {
                    inputEl.addEventListener("input", (e) => {
                        e.target.value = e.target.value.toUpperCase();
                    });
                }
            }
        },

        timer: autoclose ? 3000 : undefined,
        timerProgressBar: autoclose,
        reverseButtons: true,
        showConfirmButton: !autoclose,
        showCancelButton: input || !autoclose,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        background: "rgba(0, 0, 0, 0.8)",
    }).then((result) => {
        if (result.isConfirmed && onConfirmAction) onConfirmAction(result.value);
        if (callback) callback(result);
    });
};