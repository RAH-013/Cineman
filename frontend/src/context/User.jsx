import { createContext, useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { apiLogout } from "../api/auth"
import { apiMe } from "../api/users"

export const UserContext = createContext(null)

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()

    const refreshUser = useCallback(async () => {
        const flag = sessionStorage.getItem("cineman")

        if (!flag) {
            setUser(null)
            setLoading(false)
            return
        }

        setLoading(true)

        try {
            const { success, data, error } = await apiMe()

            if (success && data) {
                setUser({
                    ...data,
                    avatarVersion: Date.now()
                })
            } else {
                setUser(null)
                console.error(
                    "Error al obtener usuario:",
                    error || "Desconocido"
                )
            }

        } catch (err) {

            setUser(null)

            console.error(
                "Error de red o excepción:",
                err
            )

        } finally {

            setLoading(false)
        }

    }, [])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    const login = async () => {
        sessionStorage.setItem("cineman", true)
        await refreshUser()
    }

    const logout = async () => {

        try {

            await apiLogout()

        } catch (err) {

            console.error(
                "Error al cerrar sesión:",
                err
            )

        } finally {

            sessionStorage.removeItem("cineman")

            setUser(null)

            navigate("/")
        }
    }

    return (
        <UserContext.Provider
            value={{
                user,
                loading,
                refreshUser,
                login,
                logout
            }}
        >
            {children}
        </UserContext.Provider>
    )
}