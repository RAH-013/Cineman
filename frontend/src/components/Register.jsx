import { useState } from "react"
import { apiCreate } from "../api/auth"
import { SwalCustom, showToast } from "../utils/modal"

import InputField from "../layouts/InputField"

function Register({ callback }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const hasLetter = (password) => /[A-Za-z]/.test(password)
    const hasNumber = (password) => /\d/.test(password)
    const hasMinLength = (password) => password.length >= 8

    const validatePassword = (password) =>
        hasLetter(password) && hasNumber(password) && hasMinLength(password)

    const emailError = email && !validateEmail(email)
    const passwordError = password && !validatePassword(password)
    const confirmPasswordError = confirmPassword && password !== confirmPassword

    const isFormValid =
        email &&
        password &&
        confirmPassword &&
        validateEmail(email) &&
        validatePassword(password) &&
        password === confirmPassword

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isFormValid) {
            showToast("error", "Por favor, rellena el formulario correctamente.")
            return
        }

        const { success, data, error } = await apiCreate({
            email,
            password
        })

        if (!success) {
            showToast("error", error?.message || "Registro Fallido")
            return
        }

        SwalCustom({
            icon: "success",
            message: "¡Registro exitoso!",
            autoclose: true,
            callback: () => callback("login")
        })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <InputField
                    type="email"
                    label="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    alert={emailError}
                />
                {emailError && (
                    <span className="text-yellow-400 text-xs px-1">
                        El formato del correo no es válido
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <InputField
                    type="password"
                    label="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    alert={passwordError}
                />
                {password && (
                    <div className="text-xs px-1 flex flex-col gap-0.5">
                        {!hasMinLength(password) && (
                            <span className="text-yellow-400">• Debe tener al menos 8 caracteres.</span>
                        )}
                        {!hasLetter(password) && (
                            <span className="text-yellow-400">• Debe contener al menos una letra.</span>
                        )}
                        {!hasNumber(password) && (
                            <span className="text-yellow-400">• Debe contener al menos un número.</span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <InputField
                    type="password"
                    label="Confirma Contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    alert={confirmPasswordError}
                />
                {confirmPasswordError && (
                    <span className="text-yellow-400 text-xs px-1">
                        Las contraseñas no coinciden
                    </span>
                )}
            </div>

            <button
                type="submit"
                disabled={!isFormValid}
                className={`rounded-lg py-3 font-semibold transition mt-2
                    ${isFormValid
                        ? "bg-violet-700 hover:bg-violet-800 cursor-pointer text-white shadow-lg"
                        : "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50"
                    }`}
            >
                Registrarse
            </button>
        </form>
    )
}

export default Register