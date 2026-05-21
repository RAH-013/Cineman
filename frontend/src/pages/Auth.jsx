import { useState } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"

import Login from "../components/Login"
import Register from "../components/Register"
import Images from "../layouts/Images"

function Auth() {
    const [mode, setMode] = useState("login")
    const isLogin = mode === "login"

    return (
        <div className="min-h-screen w-full flex bg-[#050505] text-white overflow-hidden">
            <Link
                to="/"
                className="fixed top-5 left-5 z-50 flex items-center gap-2 bg-white/5 px-4 py-2 text-sm backdrop-blur-lg transition-all duration-300 hover:bg-white/10 hover:text-violet-400 cursor-pointer"
            >
                <FontAwesomeIcon icon={faArrowLeft} />

                <span className="hidden md:block">
                    Volver
                </span>
            </Link>

            <section className="bg-[url('/patterns/carbon-fibre.png')] hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-r border-white/10 bg-linear-to-br from-violet-950 via-black to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_60%)]" />

                <div className="relative z-10 flex flex-col items-center gap-6 text-center px-10">
                    <Images
                        src="/Logo.png"
                        alt="Cineman"
                        width="160px"
                        height="160px"
                        objectFit="contain"
                    />

                    <div className="space-y-3">
                        <h1 className="text-5xl font-black tracking-tight">
                            CINEMAN
                        </h1>

                        <p className="max-w-md text-lg text-neutral-400 leading-relaxed">
                            Compra boletos, explora estrenos
                            y vive el cine como un superhéroe.
                        </p>
                    </div>
                </div>
            </section>

            <section className="flex flex-1 items-center justify-center">
                <div className="w-full min-h-screen md:min-h-auto md:max-w-md md:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl shadow-violet-950/20 flex flex-col justify-center">
                    <div className="mb-8 flex flex-col items-center gap-4">
                        <div className="lg:hidden">
                            <Images
                                src="/Logo.png"
                                alt="Cineman"
                                width="90px"
                                height="90px"
                                objectFit="contain"
                            />
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">
                                {
                                    isLogin
                                        ? "Bienvenido de nuevo"
                                        : "Crear cuenta"
                                }
                            </h2>

                            <p className="text-sm text-neutral-400">
                                {
                                    isLogin
                                        ? "Accede a tu experiencia Cineman"
                                        : "Únete y compra boletos fácilmente"
                                }
                            </p>
                        </div>
                    </div>

                    {
                        isLogin
                            ? <Login />
                            : <Register callback={setMode} />
                    }

                    <div className="mt-6 text-center text-sm text-neutral-400">
                        {
                            isLogin
                                ? "¿No tienes cuenta?"
                                : "¿Ya tienes cuenta?"
                        }

                        <button
                            onClick={() =>
                                setMode(
                                    isLogin
                                        ? "register"
                                        : "login"
                                )
                            }
                            className="ml-2 font-semibold text-violet-400 transition hover:text-violet-300 cursor-pointer"
                        >
                            {
                                isLogin
                                    ? "Crear cuenta"
                                    : "Iniciar sesión"
                            }
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Auth