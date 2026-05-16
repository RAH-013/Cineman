import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy } from "react";
import { PrivateRoute, RoleGuard } from "./PrivateRoutes";
import { UserProvider } from "../context/User";

import Main from "../layouts/Main";

const Home = lazy(() => import("../pages/Home"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Auth = lazy(() => import("../pages/Auth"));

const AdminHome = lazy(() => import("../pages/admin/Home"));

export default function AppRouter() {
    return (
        <BrowserRouter>
            <UserProvider>
                <Routes>
                    {/* ruta pública */}
                    <Route path="/auth" element={<Auth />} />

                    {/* layout público */}
                    <Route element={<Main />}>
                        <Route path="/" element={<Home />} />
                    </Route>

                    {/* rutas privadas */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<Main />}>
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Route>

                    {/* rutas admin */}
                    <Route element={<RoleGuard role="admin" />}>
                        <Route element={<Main />}>
                            <Route path="/admin" element={<AdminHome />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </UserProvider>
        </BrowserRouter>
    );
}