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
const ManagerMovies = lazy(() => import("../pages/manager/Movies"));
const ManagerShowtimes = lazy(() => import("../pages/manager/Showtimes"));

// Admin
const AdminUsers = lazy(() => import("../pages/admin/Users"));
const AdminSystem = lazy(() => import("../pages/admin/System"));

export default function AppRouter() {
    return (
        <BrowserRouter>
            <UserProvider>
                <Routes>
                    <Route path="/auth" element={<Auth />} />

                    <Route element={<Main />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/movies" element={<Movies />} />
                        <Route path="/movies/:id" element={<Movie />} />
                    </Route>

                    <Route element={<PrivateRoute />}>
                        <Route element={<Main />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/tickets/:id" element={<Tickets />} />
                            <Route path="/tickets/my" element={<MyTickets />} />
                        </Route>
                    </Route>

                    <Route element={<RoleGuard role="manager" />}>
                        <Route element={<Main />}>
                            <Route path="/manager/showtimes" element={<ManagerShowtimes />} />
                            <Route path="/manager/movies" element={<ManagerMovies />} />
                        </Route>
                    </Route>

                    <Route element={<RoleGuard role="admin" />}>
                        <Route element={<Main />}>
                            <Route path="/admin/users" element={<AdminUsers />} />
                            <Route path="/admin/system" element={<AdminSystem />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </UserProvider>
        </BrowserRouter>
    );
}