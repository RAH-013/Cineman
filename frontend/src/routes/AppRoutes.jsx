import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy } from "react";
import { PrivateRoute, RoleGuard } from "./PrivateRoutes";
import { UserProvider } from "../context/User";

import Main from "../layouts/Main";

const Home = lazy(() => import("../pages/Home"));
const Movies = lazy(() => import("../pages/Movies"));
const Movie = lazy(() => import("../pages/Movie"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Auth = lazy(() => import("../pages/Auth"));

// Requieren Inicio de Sesión
const Profile = lazy(() => import("../pages/Profile"));
const Tickets = lazy(() => import("../pages/Tickets"));
const MyTickets = lazy(() => import("../pages/MyTickets"));

// Manager
const ManagerShowtimes = lazy(() => import("../pages/manager/Showtimes"));

// Admin
const AdminUsers = lazy(() => import("../pages/admin/Users"));
const AdminLogs = lazy(() => import("../pages/admin/Logs"));

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
                        <Route path="/movies" element={<Movies />} />
                        <Route path="/movies/:id" element={<Movie />} />
                    </Route>

                    {/* rutas privadas */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<Main />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/tickets/:id" element={<Tickets />} />
                            <Route path="/tickets/my" element={<MyTickets />} />
                        </Route>
                    </Route>

                    <Route element={<RoleGuard roles={["admin", "manager"]} />}>
                        <Route element={<Main />}>
                            <Route path="/showtimes" element={<ManagerShowtimes />} />
                        </Route>
                    </Route>

                    <Route element={<RoleGuard role="admin" />}>
                        <Route element={<Main />}>
                            <Route path="/users" element={<AdminUsers />} />
                            <Route path="/logs" element={<AdminLogs />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </UserProvider>
        </BrowserRouter>
    );
}