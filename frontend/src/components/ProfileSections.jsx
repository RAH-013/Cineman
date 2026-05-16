import { useContext, useState, useCallback } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUserGear } from "@fortawesome/free-solid-svg-icons"

import { SwalCustom } from "../utils/modal"
import { UserContext } from "../context/User"
import { apiUpdate, apiDelete } from "../api/users"

import InputField from "../layouts/InputField"
import Loader from "../layouts/Loader"
import ProfileImage from "../components/ProfileImage"

function ProfileSections({
    loading,
    form,
    setForm,
    initialData,
    setInitialData,
    passwords,
    setPasswords,
    activeSection,
    sectionsWithChanges,
    setOpen,
    searchParams
}) {
    const { user, refreshUser, logout } = useContext(UserContext)

    const [isSaving, setIsSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const [deleteConfirm, setDeleteConfirm] = useState("")
    const safetyPhrase = "DESEO ELIMINAR MI CUENTA"

    const alertField = searchParams.get("field")
    const alertSection = searchParams.get("alert") === "1"

    const handleChange = useCallback(({ target: { name, value } }) => {
        setForm(prev => ({ ...prev, [name]: value }))
    }, [])

    const handlePasswordChange = useCallback(({ target: { name, value } }) => {
        setPasswords(prev => ({ ...prev, [name]: value }))
    }, [])

    const handleCancel = () => {
        setForm(initialData)
        setPasswords({ prevPassword: "", password: "", confirmPassword: "" })
        setIsEditing(false)
    }

    const handleApply = async () => {
        if (sectionsWithChanges.length === 0) return setIsEditing(false);

        if (passwords.password || passwords.confirmPassword) {
            if (passwords.password !== passwords.confirmPassword) {
                return SwalCustom({ icon: "error", message: "Las contraseñas nuevas no coinciden" })
            }
            if (!passwords.prevPassword) {
                return SwalCustom({ icon: "warning", message: "Ingresa tu contraseña actual para autorizar cambios de seguridad" })
            }
        }

        try {
            setIsSaving(true);
            const dataToUpdate = {
                ...form,
                ...(passwords.password && { newPassword: passwords.password, prevPassword: passwords.prevPassword })
            };

            const { success } = await apiUpdate(dataToUpdate);

            setInitialData(form)
            setPasswords({ prevPassword: "", password: "", confirmPassword: "" })
            setIsEditing(false)

            if (success && refreshUser) await refreshUser();

            SwalCustom({ icon: "success", message: "Cambios guardados correctamente", autoclose: true })
        } catch (err) {
            console.error(err)
            SwalCustom({ icon: "error", message: err.message || "Error al guardar los cambios" })
        } finally {
            setIsSaving(false);
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== safetyPhrase) {
            return SwalCustom({
                icon: "error",
                message: "Debes escribir correctamente la frase de confirmación",
                autoclose: true
            })
        }

        try {
            const { success } = await apiDelete()

            SwalCustom({
                icon: "success",
                message: "Cuenta eliminada correctamente",
                autoclose: true
            })

            if (success && logout) await logout()

        } catch (error) {
            SwalCustom({
                icon: "error",
                message: error.message || "Error al eliminar la cuenta"
            })
        }
    }

    return (
        <>
            <div className={`flex justify-between p-6 shrink-0 border-b border-neutral-800/50 z-10 bg-neutral-950 ${activeSection === "danger" ? "md:hidden" : ""}`}>
                <div className={activeSection === "danger" ? "hidden" : "flex gap-3 ml-auto"}>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="cursor-pointer px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95">
                            Modificar
                        </button>
                    ) : (
                        <>
                            <button onClick={handleCancel} className="cursor-pointer px-5 py-2 rounded-xl bg-transparent border border-transparent text-neutral-400 transition-all hover:text-white hover:bg-white/5 active:scale-95">
                                Cancelar
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={isSaving}
                                className="cursor-pointer px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? "Guardando..." : `Guardar cambios ${sectionsWithChanges.length > 0 ? `(${sectionsWithChanges.length})` : ""}`}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <Loader />
                ) : (
                    <div className="animate-fade-in h-full">

                        {activeSection === "account" && (
                            <div className="max-w-2xl mx-auto space-y-4 p-6 md:p-8">
                                <InputField name="email" label="Correo electrónico" value={form.email || ""} disabled />
                                <div className="pt-4 border-t border-neutral-800 space-y-4">
                                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Seguridad</p>
                                    <InputField type="password" name="prevPassword" label="Contraseña actual" value={passwords.prevPassword} onChange={handlePasswordChange} disabled={!isEditing} />
                                    <InputField type="password" name="password" label="Nueva contraseña" value={passwords.password} onChange={handlePasswordChange} disabled={!isEditing} alert={alertSection || alertField === "password"} />
                                    <InputField type="password" name="confirmPassword" label="Confirmar contraseña" value={passwords.confirmPassword} onChange={handlePasswordChange} disabled={!isEditing} alert={alertSection || alertField === "confirmPassword"} />
                                </div>
                            </div>
                        )}

                        {activeSection === "profile" && (
                            <div className="w-full h-full flex flex-col bg-neutral-950">
                                <div className="relative w-full shrink-0">
                                    <div className="h-40 w-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a,#312e81,#6d28d9,#a855f7)] opacity-90"></div>
                                        <div className="absolute inset-0 opacity-20 bg-[url('/carbon-fibre.png')] mix-blend-overlay"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-neutral-950 to-transparent"></div>
                                    </div>

                                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-20">
                                        <div className="relative p-1 rounded-full">
                                            <div className="w-24 h-24 md:w-30 md:h-30 rounded-full border-4 md:border-[6px] border-neutral-950 bg-neutral-900 overflow-hidden shadow-2xl">
                                                <ProfileImage user={user} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 pt-16 px-6">
                                    <div className="max-w-3xl mx-auto">
                                        <div className="space-y-6 md:space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                                <InputField
                                                    name="name"
                                                    label="Nombre"
                                                    value={form.name || ""}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    alert={alertSection || alertField === "name"}
                                                />
                                                <InputField
                                                    name="lastname"
                                                    label="Apellido"
                                                    value={form.lastname || ""}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    alert={alertSection || alertField === "lastname"}
                                                />
                                            </div>

                                            <div className="pt-2">
                                                <InputField
                                                    name="phone"
                                                    type="phone"
                                                    label="Teléfono"
                                                    value={form.phone || ""}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    alert={alertSection || alertField === "phoneNumber"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "danger" && (
                            <div className="max-w-2xl mx-auto p-4 md:p-8 w-full animate-fade-in">
                                <div className="bg-black/30 rounded-xl p-5 border border-white/5 mb-8">
                                    <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                                        Esta acción <strong className="text-white">eliminará tu cuenta permanentemente</strong>, junto con todos tus datos.
                                        <span className="block mt-2 text-red-400 font-medium">Esta acción no se puede deshacer.</span>
                                    </p>

                                    <div className="flex flex-wrap items-center gap-2 p-3 bg-red-500/5 rounded-lg border border-red-500/20 text-sm text-neutral-300">
                                        <span>Escribe</span>
                                        <span className="px-2 py-1 bg-red-500/20 rounded text-red-400 font-mono font-bold select-all tracking-wider">
                                            {safetyPhrase}
                                        </span>
                                        <span>para confirmar.</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <InputField
                                        name="deleteConfirm"
                                        label="Frase de confirmación"
                                        value={deleteConfirm}
                                        onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
                                    />

                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirm !== safetyPhrase}
                                        className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 
                                                    ${deleteConfirm === safetyPhrase
                                                ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] active:scale-95 cursor-pointer border border-red-400/50"
                                                : "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-70"
                                            }`}
                                    >
                                        <span>Eliminar cuenta permanentemente</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default ProfileSections