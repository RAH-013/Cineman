import { useContext, useEffect, useState, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightLong, faXmark, faCircleDot } from "@fortawesome/free-solid-svg-icons"

import { UserContext } from "../context/User"
import { apiMeProfile } from "../api/users"

import Menu from "../layouts/Menu"
import ProfileSections from "../components/ProfileSections"

const SECTIONS = [
    { id: "account", label: "Cuenta", color: "bg-blue-500", textHover: "hover:text-red-400", fields: ["email"] },
    { id: "profile", label: "Perfil", color: "bg-green-500", textHover: "hover:text-green-400", fields: ["name", "lastname", "phone"] },
];

function Profile() {
    const { user } = useContext(UserContext)
    const [searchParams, setSearchParams] = useSearchParams()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const [form, setForm] = useState({})
    const [initialData, setInitialData] = useState({})
    const [passwords, setPasswords] = useState({ prevPassword: "", password: "", confirmPassword: "" })

    const activeSection = useMemo(() => {
        const tab = searchParams.get("tab")
        const validSections = SECTIONS.map(s => s.id)
        return [...validSections, "danger"].includes(tab) ? tab : "account"
    }, [searchParams])

    const sectionsWithChanges = useMemo(() => {
        const changed = new Set();
        Object.keys(form).forEach(key => {
            if (form[key] !== initialData[key]) {
                const section = SECTIONS.find(s => s.fields?.includes(key));
                if (section) changed.add(section.id);
            }
        });
        if (passwords.password || passwords.prevPassword) changed.add("account");
        return Array.from(changed);
    }, [form, initialData, passwords]);

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            try {
                const response = await apiMeProfile()
                const data = response.data

                const merged = { ...data, ...user }

                setForm(merged)
                setInitialData(merged)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?.id])

    const handleSectionChange = (sectionId) => {
        setOpen(false)
        setSearchParams({ tab: sectionId })
    }

    if (!user) return <div className="p-10 text-gray-400 flex justify-center items-center h-screen text-xl">Inicia sesión para ver tu perfil</div>

    return (
        <main className="flex-1 flex flex-col h-full bg-neutral-950 text-white">
            <ProfileSections
                loading={loading}
                form={form}
                setForm={setForm}
                initialData={initialData}
                setInitialData={setInitialData}
                passwords={passwords}
                setPasswords={setPasswords}
                activeSection={activeSection}
                sectionsWithChanges={sectionsWithChanges}
                setOpen={setOpen}
                searchParams={searchParams}
            />

            <footer className="w-full border-t border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl px-4 md:px-6 py-4 shrink-0">
                <nav className="flex flex-wrap items-center gap-2">
                    {SECTIONS.map((section) => {
                        const hasChanges = sectionsWithChanges.includes(section.id)
                        const isActive = activeSection === section.id

                        return (
                            <button
                                key={section.id}
                                onClick={() => handleSectionChange(section.id)}
                                className={`cursor-pointer relative flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 active:scale-95 ${isActive ? "bg-white/12 border-white/10 text-white shadow-[0_0_25px_rgba(255,255,255,0.05)]" : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800/80 hover:border-neutral-700 hover:text-white"}`}
                            >
                                <div className="relative flex items-center justify-center">
                                    <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${section.color} ${isActive ? "scale-125" : ""}`} />

                                    {
                                        hasChanges && (
                                            <span className="absolute w-5 h-5 rounded-full border border-orange-400/40 animate-ping" />
                                        )
                                    }
                                </div>

                                <span className={`font-medium tracking-wide transition-all duration-300 ${isActive ? "text-white" : "text-neutral-300"}`}>
                                    {section.label}
                                </span>

                                {
                                    isActive && (
                                        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
                                    )
                                }
                            </button>
                        )
                    })}

                    <div className="ml-auto">
                        <button
                            onClick={() => handleSectionChange("danger")}
                            className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 active:scale-95 ${activeSection === "danger"
                                ? "bg-red-500/20 border-red-500/40 text-red-300 shadow-lg shadow-red-500/10"
                                : "bg-red-500/5 border-transparent text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                                }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

                            <span className="font-medium">
                                Eliminar cuenta
                            </span>
                        </button>
                    </div>
                </nav>
            </footer>
        </main>

    )
}

export default Profile