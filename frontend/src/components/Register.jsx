import { useState, useRef, useEffect } from "react"
import { apiCreate } from "../api/auth"
import { SwalCustom } from "../utils/modal"

import InputField from "../layouts/InputField"
import Swal from "sweetalert2"

function Register({ callback }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const validatePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)

    const isFormValid =
        email &&
        password &&
        confirmPassword &&
        validateEmail(email) &&
        validatePassword(password) &&
        password === confirmPassword

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isFormValid) return

        const { success, data, error } = await apiCreate({
            email,
            password
        })

        if (!success) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: error?.message || "Registro Fallido",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            })
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
            <InputField
                type="email"
                label="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                alert={email && !validateEmail(email)}
            />

            <InputField
                type="password"
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                alert={password && !validatePassword(password)}
            />

            <InputField
                type="password"
                label="Confirma Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                alert={confirmPassword && confirmPassword !== password}
            />

            {confirmPassword && confirmPassword !== password && (
                <span className="text-yellow-400 text-sm -mt-2">
                    Las contraseñas no coinciden
                </span>
            )}

            <button
                type="submit"
                disabled={!isFormValid}
                className={`rounded-lg py-3 font-semibold transition
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