import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useUser";

import Loader from "../layouts/Loader";

export function PrivateRoute({ children }) {
    const { user, loading } = useUser();

    if (loading) return <Loader />;
    if (!user) return <Navigate to="/auth" replace />;

    return children ?? <Outlet />;
}

export function RoleGuard({ role: requiredRole = "admin" }) {
    const { user, loading } = useUser();

    if (loading) return <Loader />;

    if (!user || user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}