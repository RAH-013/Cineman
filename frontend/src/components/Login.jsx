import { useContext, useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { apiAuth } from "../api/auth"
import { UserContext } from "../context/User"
import { SwalCustom, showToast } from "../utils/modal"

import InputField from "../layouts/InputField"

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const { login } = useContext(UserContext)

    const isFormValid = email && password

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isFormValid) return

        const { success, data, error } = await apiAuth({
            email,
            password
        })

        if (!success) {
            showToast("error", error?.message || "Autenticación Fallida")
            return
        }

        login()

        SwalCustom({
            icon: "success",
            message: "Autenticación exitosa",
            autoclose: true,
            callback: () => navigate("/")
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
                name="email"
                autoComplete={true}
                type="email"
                label="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
                name="password"
                autoComplete={true}
                type="password"
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                type="submit"
                disabled={!isFormValid}
                className={`rounded-lg py-3 font-semibold transition
                    ${isFormValid
                        ? "bg-violet-700 hover:bg-violet-800 cursor-pointer text-white shadow-lg"
                        : "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50"
                    }`}
            >
                Iniciar Sesión
            </button>
        </form>
    )
}

export default Login