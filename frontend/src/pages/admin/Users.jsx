import { useState, useMemo } from "react";
import {
    apiGetUsers,
    apiGetUserProfile,
    apiChangeUserRole,
    apiUserDelete
} from "../../api/users";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faTrash, faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { SwalCustom } from "../../utils/modal";

import InputField from "../../layouts/InputField";
import GenericDataManager from "../../components/GenericDataManager"

function Users() {
    const [selectedUser, setSelectedUser] = useState(null);

    const columns = useMemo(() => [
        {
            header: "Email",
            accessorFn: row => row.email
        },
        {
            header: "Rol",
            accessorFn: row => row.role,
            cell: ({ row }) => {
                const role = row.original.role;
                return (
                    <span className={`text-xs tracking-wider uppercase font-bold ${role === "admin" ? "text-blue-400" : "text-zinc-400"
                        }`}>
                        {role}
                    </span>
                );
            }
        },
        {
            header: "Verificado",
            accessorFn: row => row.isEmailVerified,
            cell: ({ row }) => {
                const verified = row.original.isEmailVerified;
                return (
                    <span className={`text-sm font-medium ${verified ? "text-green-400" : "text-zinc-500"
                        }`}>
                        {verified ? "Verificado" : "No verificado"}
                    </span>
                );
            }
        },
        {
            header: "Nombre",
            accessorFn: row => row.profile?.name || "-"
        },
        {
            header: "Apellido",
            accessorFn: row => row.profile?.lastname || "-"
        }
    ], []);

    const getActions = (table) => [
        {
            label: <FontAwesomeIcon icon={faAddressCard} />,
            className: "p-2 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 cursor-pointer",
            onClick: async (user) => {
                try {
                    const res = await apiGetUserProfile(user.id);
                    setSelectedUser({
                        id: user.id,
                        role: user.role,
                        ...res.data,
                        name: user.profile?.name,
                        lastname: user.profile?.lastname
                    });
                } catch (error) {
                    SwalCustom({ icon: "error", message: error.message || "Error al obtener perfil" });
                }
            }
        },
        {
            label: <FontAwesomeIcon icon={faTrash} />,
            className: "p-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer",
            onClick: async (user) => {
                const text = user.profile?.name?.length > 10 ? "USUARIO" : user.profile?.name;
                const phrase = text.trim().toUpperCase();

                const confirmText = await new Promise((resolve) => {
                    SwalCustom({
                        icon: "warning",
                        message: `Escribe el nombre para confirmar esta acción`,
                        input: true,
                        inputPlaceholder: phrase,
                        inputUpperCase: true,
                        callback: (result) => resolve(result.value || "")
                    });
                });

                if (confirmText !== phrase) return;

                try {
                    await apiUserDelete(user.id);
                    SwalCustom({ icon: "success", message: "Usuario eliminado correctamente", autoclose: true });
                    table.handleRefresh();
                } catch (error) {
                    SwalCustom({ icon: "error", message: error.message || "Error al eliminar usuario" });
                }
            }
        }
    ];

    const renderUserDetail = ({ item, onBack, table }) => {
        const handleToggleRole = async () => {
            const newRole = item.role === "admin" ? "customer" : "admin";
            const confirm = await new Promise((resolve) => {
                SwalCustom({
                    icon: "warning",
                    message: `¿Cambiar rol a "${newRole}"?`,
                    callback: (result) => resolve(result.isConfirmed)
                });
            });

            if (!confirm) return;

            try {
                await apiChangeUserRole(item.id, newRole);
                setSelectedUser(prev => ({ ...prev, role: newRole }));
                table.handleRefresh();
                SwalCustom({ icon: "success", message: "Rol actualizado", autoclose: true });
            } catch (error) {
                SwalCustom({ icon: "error", message: error.message || "Error al cambiar rol" });
            }
        };

        return (
            <div className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <button onClick={onBack} className="flex items-center gap-2 px-2 py-1 text-red-700 cursor-pointer rounded hover:bg-neutral-700">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Volver
                </button>

                <div className="flex items-center justify-between gap-4">
                    <h2
                        className="text-xl font-bold truncate max-w-62.5 sm:max-w-sm md:max-w-md"
                        title={`${item.name} ${item.lastname}`}
                    >
                        {item.name} {item.lastname}
                    </h2>
                    <button
                        onClick={handleToggleRole}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${item.role === "admin" ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                            }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
                        {item.role}
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <InputField name="city" label="Ciudad" value={item.city || "---"} disabled />
                    <InputField name="country" label="País" value={item.country || "---"} disabled />
                    <InputField name="street" label="Calle" value={item.street || "---"} disabled />
                    <InputField name="state" label="Estado" value={item.state || "---"} disabled />
                    <InputField name="postalCode" label="Código Postal" value={item.postalCode || "---"} disabled />
                    <InputField name="phoneNumber" label="Número de Teléfono" value={item.phoneNumber || "---"} disabled />
                    <InputField name="municipality" label="Municipio" value={item.municipality || "---"} disabled />
                    <InputField name="interiorNumber" label="Número Interior" value={item.interiorNumber || "---"} disabled />
                    <InputField name="exteriorNumber" label="Número Exterior" value={item.exteriorNumber || "---"} disabled />
                    <InputField name="neighborhood" label="Colonia" value={item.neighborhood || "---"} disabled />
                </div>
            </div>
        );
    };

    return (
        <GenericDataManager
            apiFetch={apiGetUsers}
            columns={columns}
            getActions={getActions}
            selectedItem={selectedUser}
            onClearSelection={() => setSelectedUser(null)}
            renderDetail={renderUserDetail}
            searchPlaceholder="Buscar usuario..."
        />
    );
}

export default Users;