import { useContext, useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faArrowRightFromBracket,
    faArrowRightLong,
    faUser,
    faXmark
} from "@fortawesome/free-solid-svg-icons"

import { UserContext } from "../context/User"
import { SwalCustom } from "../utils/modal"

import Menu from "../layouts/Menu"
import ProfileImage from "../components/ProfileImage"

function UserOptions({ collapsed }) {
    const { user, loading, logout } = useContext(UserContext)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const { pathname } = useLocation()

    useEffect(() => {
        if (!menuOpen) return
        const isMobile = window.matchMedia("(max-width: 768px)").matches
        if (isMobile) return

        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false)
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        )

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            )
        }
    }, [menuOpen])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="w-14 h-14 rounded-3xl bg-white/5 animate-pulse" />
            </div>
        )
    }

    return (
        <div
            ref={menuRef}
            className="flex p-4"
        >
            {user ? (
                <>
                    <button
                        type="button"
                        onClick={() =>
                            setMenuOpen((prev) => !prev)
                        }
                        className={`
                            w-full
                            group relative
                            flex items-center
                            overflow-hidden
                            rounded-3xl
                            backdrop-blur-xl
                            transition-all
                            duration-300
                            ease-out
                            active:scale-95

                            ${collapsed
                                ? `
                                    justify-center
                                    w-14 h-14
                                `
                                : `
                                    justify-start gap-3
                                    w-full
                                    px-3 py-3
                                    border border-white/10
                                    bg-white/4                      
                                    hover:border-violet-500/40
                                    /10
                                    hover:shadow-xl
                                    hover:shadow-violet-600/10
                                `
                            }
                        `}
                    >
                        <div className="absolute inset-0 opacity-0 bg-linear-to-br from-violet-500/20 to-fuchsia-500/10 transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="relative shrink-0 w-12 h-12 overflow-hidden rounded-2xl">
                            <ProfileImage user={user} />
                        </div>

                        <div
                            className={`
                                overflow-hidden
                                transition-all
                                duration-300

                                ${collapsed
                                    ? `
                                        max-w-0
                                        opacity-0
                                        translate-x-2
                                    `
                                    : `
                                        max-w-40
                                        opacity-100
                                        translate-x-0
                                    `
                                }
                            `}
                        >
                            <div className="flex flex-col items-start">
                                <span className="whitespace-nowrap text-sm font-semibold text-white">
                                    {user.name || "¡Bienvenid@!"}
                                </span>

                                <span className="max-w-32 truncate text-xs text-neutral-500">
                                    {user.email}
                                </span>
                            </div>
                        </div>
                    </button>

                    <Menu
                        open={menuOpen}
                        className={collapsed ? "left-30" : "left-70"}
                        onClose={() =>
                            setMenuOpen(false)
                        }
                    >
                        <button
                            onClick={() =>
                                setMenuOpen(false)
                            }
                            className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 rounded-2xl bg-white/4 text-neutral-500 transition-all duration-300 hover:bg-white/8 hover:text-white hover:rotate-90"
                        >
                            <FontAwesomeIcon
                                icon={faXmark}
                            />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-28 h-28 rounded-full bg-violet-500/20 blur-3xl" />

                                <div className="relative shrink-0 w-20 h-20 overflow-hidden rounded-2xl">
                                    <ProfileImage user={user} />
                                </div>
                            </div>

                            <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">
                                ¡Hola
                                {user.name
                                    ? `, ${user.name}`
                                    : ""}
                                !
                            </h3>

                            <span className="mt-2 max-w-60 truncate text-sm text-neutral-500">
                                {user.email}
                            </span>
                        </div>

                        <div className="mt-8 flex flex-col gap-3">
                            <Link
                                to="/profile"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                                className={`
                                    group flex items-center justify-between rounded-2xl px-5 py-4 backdrop-blur-xl transition-all duration-300

                                    ${pathname.startsWith("/profile")
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                        : "border border-white/5 bg-white/3 text-neutral-300 hover:border-violet-500/20 hover:bg-white/6 hover:text-white"
                                    }
                                `}
                            >
                                <span className="font-medium">
                                    Perfil
                                </span>

                                <FontAwesomeIcon
                                    icon={
                                        faArrowRightLong
                                    }
                                    className="text-sm opacity-70 transition-all duration-300 group-hover:translate-x-1"
                                />
                            </Link>

                            {
                                (user.role === "admin" || user.role === "manager") && (
                                    <Link
                                        to="/showtimes"
                                        onClick={() =>
                                            setMenuOpen(
                                                false
                                            )
                                        }
                                        className={`
                                            group flex items-center justify-between rounded-2xl px-5 py-4 backdrop-blur-xl transition-all duration-300

                                            ${pathname.startsWith("/showtimes")
                                                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                                : "border border-white/5 bg-white/3 text-neutral-300 hover:border-violet-500/20 hover:bg-white/6 hover:text-white"
                                            }
                                        `}
                                    >
                                        <span className="font-medium">
                                            Funciones
                                        </span>

                                        <FontAwesomeIcon
                                            icon={
                                                faArrowRightLong
                                            }
                                            className="text-sm opacity-70 transition-all duration-300 group-hover:translate-x-1"
                                        />
                                    </Link>
                                )
                            }

                            {user.role ===
                                "admin" && (
                                    <>
                                        <Link
                                            to="/users"
                                            onClick={() =>
                                                setMenuOpen(
                                                    false
                                                )
                                            }
                                            className={`
                                            group flex items-center justify-between rounded-2xl px-5 py-4 backdrop-blur-xl transition-all duration-300

                                            ${pathname.startsWith("/admin")
                                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                                    : "border border-white/5 bg-white/3 text-neutral-300 hover:border-violet-500/20 hover:bg-white/6 hover:text-white"
                                                }
                                        `}
                                        >
                                            <span className="font-medium">
                                                Usuarios
                                            </span>

                                            <FontAwesomeIcon
                                                icon={
                                                    faArrowRightLong
                                                }
                                                className="text-sm opacity-70 transition-all duration-300 group-hover:translate-x-1"
                                            />
                                        </Link>

                                        <Link
                                            to="/logs"
                                            onClick={() =>
                                                setMenuOpen(
                                                    false
                                                )
                                            }
                                            className={`
                                            group flex items-center justify-between rounded-2xl px-5 py-4 backdrop-blur-xl transition-all duration-300

                                            ${pathname.startsWith("/admin")
                                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                                    : "border border-white/5 bg-white/3 text-neutral-300 hover:border-violet-500/20 hover:bg-white/6 hover:text-white"
                                                }
                                        `}
                                        >
                                            <span className="font-medium">
                                                Logs
                                            </span>

                                            <FontAwesomeIcon
                                                icon={
                                                    faArrowRightLong
                                                }
                                                className="text-sm opacity-70 transition-all duration-300 group-hover:translate-x-1"
                                            />
                                        </Link>
                                    </>
                                )
                            }

                            <button
                                onClick={() => {
                                    setMenuOpen(false)

                                    SwalCustom({
                                        icon: "warning",
                                        message:
                                            "¿Deseas cerrar sesión?",
                                        onConfirmAction:
                                            logout
                                    })
                                }}
                                className="group flex items-center justify-between rounded-2xl border border-red-500/10 bg-red-500/10 px-5 py-4 text-red-400 transition-all duration-300 hover:border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
                            >
                                <span className="font-medium">
                                    Cerrar sesión
                                </span>

                                <FontAwesomeIcon
                                    icon={
                                        faArrowRightFromBracket
                                    }
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </button>
                        </div>
                    </Menu>
                </>
            ) : (
                <Link
                    to="/auth"
                    className={`w-full bg-cyan-800 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20 group flex items-center rounded-2xl px-4 py-4 transition-all duration-300 ${collapsed
                        ? "justify-center"
                        : "justify-start gap-4"
                        }`}
                >
                    <FontAwesomeIcon
                        icon={faUser}
                        className="shrink-0 text-lg transition-transform duration-300 group-hover:scale-110"
                    />

                    <span
                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed
                            ? "max-w-0 opacity-0 translate-x-2"
                            : "max-w-40 opacity-100 translate-x-0"
                            }`}
                    >
                        Iniciar Sesión
                    </span>
                </Link>
            )}
        </div>
    )
}

export default UserOptions