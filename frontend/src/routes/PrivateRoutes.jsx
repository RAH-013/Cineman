import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useUser";

import Loader from "../layouts/Loader";

export function PrivateRoute({ children }) {
    const { user, loading } = useUser();

    if (loading) return <Loader />;
    if (!user) return <Navigate to="/auth?alert=true" replace />;

    return children ?? <Outlet />;
}

export function RoleGuard({ role, roles }) {
    const { user, loading } = useUser();

    if (loading) return <Loader />;

    const allowedRoles = roles ?? [role ?? "admin"];

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}