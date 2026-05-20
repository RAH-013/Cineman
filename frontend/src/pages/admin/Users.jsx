import React, { useState, useEffect, useMemo } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faTrash,
    faSearch,
    faUsers,
    faUserShield,
    faUserTie,
    faUser,
    faPeopleArrows
} from "@fortawesome/free-solid-svg-icons"

import {
    apiGetUsers,
    apiGetUserProfile,
    apiChangeUserRole,
    apiUserDelete
} from "../../api/users"
import { SwalCustom, showToast } from "../../utils/modal"

import AdminPanel from "../../layouts/AdminPanel"
import AdminTable from "../../layouts/AdminTable"
import Loader from "../../layouts/Loader"
import ProfileImage from "../../components/ProfileImage"

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedRole, setSelectedRole] = useState(null)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const res = await apiGetUsers()
            if (res?.data) setUsers(res.data)
        } catch (error) {
            showToast("error", "Error al cargar los usuarios")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [])

    const handleOpenPanel = async (user) => {
        try {
            const res = await apiGetUserProfile(user.id)
            setSelectedUser({
                id: user.id,
                role: user.role,
                email: user.email,
                ...res.data,
                name: user.name,
                lastname: user.lastname,
                phone: user.phone
            })
            setSelectedRole(user.role)
            setIsPanelOpen(true)
        } catch (error) {
            showToast("error", error.message || "Error al obtener perfil")
        }
    }

    const handleClosePanel = () => {
        setIsPanelOpen(false)
        setTimeout(() => {
            setSelectedUser(null)
            setSelectedRole(null)
        }, 300)
    }

    const handleDelete = async (user) => {
        SwalCustom({
            icon: "warning",
            message: `¿Estás seguro de que deseas eliminar al usuario ${user.email}?`,
            callback: async (result) => {
                if (result.isConfirmed) {
                    try {
                        await apiUserDelete(user.id)
                        showToast("success", "Usuario eliminado")
                        fetchUsers()
                    } catch (error) {
                        showToast("error", error.message || "Error al eliminar usuario")
                    }
                }
            }
        })
    }

    const handleSaveRole = async (e) => {
        e.preventDefault()

        if (!selectedUser) return

        if (selectedUser.role === selectedRole) {
            handleClosePanel()
            return
        }

        try {
            await apiChangeUserRole(selectedUser.id, selectedRole)
            showToast("success", "Rol actualizado correctamente")
            fetchUsers()
            handleClosePanel()
        } catch (error) {
            showToast("error", error.message || "Error al cambiar rol")
        }
    }

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users
        const query = searchQuery.toLowerCase()
        return users.filter(u =>
            u.email?.toLowerCase().includes(query) ||
            u.name?.toLowerCase().includes(query) ||
            u.lastname?.toLowerCase().includes(query)
        )
    }, [users, searchQuery])

    const columns = useMemo(() => [
        {
            title: 'Email',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <ProfileImage user={user} icon={true} />
                    </div>
                    <span className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors truncate max-w-50">
                        {user.email}
                    </span>
                </div>
            )
        },
        {
            title: 'Rol',
            render: (user) => {
                const roleColors = {
                    admin: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
                    manager: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
                    user: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                }
                const colorClass = roleColors[user.role] || 'bg-white/5 border-white/10 text-gray-400'

                return (

                    <span className={`inline-block text-[15px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${colorClass}`}>
                        {user.role}
                    </span>
                )
            }
        },
        {
            title: 'Nombre Completo',
            render: (user) => (
                <span title={`${user.name || "---"} ${user.lastname || ""}`.trim()} className="text-sm font-medium text-gray-300 block truncate max-w-37.5">
                    {user.name || "---"} {user.lastname || ""}
                </span>
            )
        },
        {
            title: 'Teléfono',
            render: (user) => (
                <span className="text-sm font-medium text-gray-300 block truncate max-w-37.5">
                    {user.phone || "---"}
                </span>
            )
        },
        {
            title: 'Acciones',
            className: 'text-right',
            render: (user) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenPanel(user)} className="cursor-pointer w-9 h-9 rounded-lg bg-white/5 hover:bg-violet-600/20 text-gray-400 hover:text-violet-400 transition-all border border-white/5 hover:border-violet-500/30">
                        <FontAwesomeIcon icon={faPeopleArrows} className="text-xs" />
                    </button>
                    <button onClick={() => handleDelete(user)} className="cursor-pointer w-9 h-9 rounded-lg bg-white/5 hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/30">
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                </div>
            )
        }
    ], [users])

    if (loading) return <div className="flex h-screen bg-[#0a0a0f] items-center justify-center"><Loader /></div>

    return (
        <div className="h-screen bg-[#0a0a0f] text-white p-6 lg:p-10 font-sans selection:bg-violet-600 flex flex-col">
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Gestor de Usuarios</h1>
                    </div>
                </div>

                <div className="flex flex-col flex-1 min-h-0 bg-white/2 border border-white/5 rounded-3xl backdrop-blur-md shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/1 rounded-t-3xl shrink-0">
                        <div className="flex items-center gap-2 text-gray-400">
                            <FontAwesomeIcon icon={faSearch} className="text-xs" />
                            <span className="text-xs font-bold uppercase tracking-widest">Buscar usuario:</span>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                autoComplete='off'
                                placeholder="Buscar"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <AdminTable columns={columns} data={filteredUsers} />
                </div>
            </div>

            <AdminPanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                title="Gestión de Rol"
                formId="user-profile-form"
            >
                {selectedUser && (
                    <form
                        id="user-profile-form"
                        onSubmit={handleSaveRole}
                        className="space-y-8"
                    >
                        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
                            <div className="min-w-0 border-b border-white/5 pb-4">
                                <h3 className="text-xl font-black uppercase text-white truncate mb-1">
                                    {selectedUser.name || "Sin nombre"} {selectedUser.lastname || ""}
                                </h3>
                                <p className="text-sm font-medium text-gray-400 truncate">
                                    {selectedUser.email}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500 mb-3">
                                    Asignar Privilegios
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('user')}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${selectedRole === 'user'
                                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                            : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faUser} className="text-lg" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">User</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('manager')}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${selectedRole === 'manager'
                                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                            : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faUserTie} className="text-lg" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Manager</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('admin')}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${selectedRole === 'admin'
                                            ? 'bg-violet-500/10 border-violet-500/50 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                                            : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faUserShield} className="text-lg" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Admin</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </AdminPanel>
        </div>
    )
}