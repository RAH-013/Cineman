import Swal from "sweetalert2"

export const SwalCustom = ({
    icon = "success",
    message = "Mensaje por defecto",
    autoclose = false,
    confirmButtonText = "Aceptar",
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

        timer: autoclose ? 1500 : undefined,
        timerProgressBar: autoclose,
        reverseButtons: true,
        showConfirmButton: !autoclose,
        showCancelButton: input || !autoclose,
        confirmButtonText: confirmButtonText,
        cancelButtonText: "Cancelar",
        background: "rgba(0, 0, 0, 0.8)",
    }).then((result) => {
        if (result.isConfirmed && onConfirmAction) onConfirmAction(result.value);
        if (callback) callback(result);
    });
};

export const showToast = (icon, title) => {
    Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: icon,
        title: title,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        background: "rgba(10, 10, 15, 0.95)",
        color: "#fff",
        customClass: {
            popup: 'border border-white/10 backdrop-blur-md'
        }
    })
}