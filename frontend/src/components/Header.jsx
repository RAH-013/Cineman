import { useState } from "react"

import { Link, useLocation } from "react-router-dom"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import {
    faChevronLeft,
    faChevronRight,
    faFilm,
    faHouse,
    faTicket
} from "@fortawesome/free-solid-svg-icons"

import UserOptions from "./UserOptions"

import Images from "../layouts/Images"

function Header() {
    const [collapsed, setCollapsed] = useState(true)

    const { pathname } = useLocation()

    const links = [
        {
            label: "Inicio",
            path: "/",
            icon: faHouse
        },
        {
            label: "Películas",
            path: "/movies",
            icon: faFilm
        },
        {
            label: "Mis Boletos",
            path: "/tickets/my",
            icon: faTicket
        }
    ]

    return (
        <>
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={`cursor-pointer fixed top-5 z-35 flex items-center justify-center w-15 h-10 rounded-2xl bg-neutral-800/90 backdrop-blur-xl text-neutral-400 transition-[left,background-color,color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-neutral-900 hover:text-white hover:scale-105 ${collapsed ? "left-22" : "left-57"
                    }`}
            >
                <FontAwesomeIcon
                    icon={collapsed ? faChevronRight : faChevronLeft}
                    className="transition-transform duration-500"
                />
            </button>

            <aside
                className={`flex flex-col z-40 justify-between h-screen border-r border-white/10 bg-[rgba(10,10,15)] backdrop-blur-3xl transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width] ${collapsed ? "w-25" : "w-65"}`}
            >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_40%)]" />

                <div className="relative flex flex-col h-full">
                    <div className="flex items-center gap-3 p-5">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-2xl" />

                            <Images
                                src="/Logo.png"
                                alt="Cineman"
                                width="56px"
                                height="56px"
                                objectFit="contain"
                            />
                        </div>

                        <div
                            className={`overflow-hidden transition-all duration-300 ${collapsed
                                ? "max-w-0 opacity-0 translate-x-2"
                                : "max-w-50 opacity-100 translate-x-0"
                                }`}
                        >
                            <h1 className="whitespace-nowrap text-xl font-black tracking-wider text-white">
                                CINEMAN
                            </h1>
                        </div>
                    </div>

                    <nav className="mt-6 flex flex-col gap-4 px-4">
                        {links.map(({ label, path, icon }) => {
                            const active = path === "/"
                                ? location.pathname === "/"
                                : location.pathname.startsWith(path);

                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`group flex items-center rounded-2xl px-4 py-4 transition-all duration-300 ${collapsed
                                        ? "justify-center"
                                        : "justify-start gap-4"
                                        } ${active
                                            ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                            : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <FontAwesomeIcon
                                        icon={icon}
                                        className="shrink-0 text-lg transition-transform duration-300 group-hover:scale-110"
                                    />

                                    <span
                                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed
                                            ? "max-w-0 opacity-0 translate-x-2"
                                            : "max-w-40 opacity-100 translate-x-0"
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="mt-auto">
                        <UserOptions collapsed={collapsed} />
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Header