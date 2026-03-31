import React, { useEffect, useMemo } from "react";
import { Route, Routes, HashRouter, Navigate, Outlet } from "react-router-dom";
import { AboutPage } from "../pages/about/AboutPage";
import { ActionDetailPage } from "../pages/action-detail/ActionDetailPage";
import { HomePage } from "../pages/home/HomePage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { useAppContext } from "../contexts/app-context";

export const Router: React.FC = React.memo(() => {
    const { isInitialized, isAdmin, hasSettingsAccess, reload } = useAppContext();

    const isAuthorized = useMemo(
        () => !isInitialized || isAdmin || hasSettingsAccess,
        [isInitialized, isAdmin, hasSettingsAccess]
    );

    useEffect(() => {
        if (isInitialized) return;
        reload();
    }, [reload, isInitialized]);

    return isInitialized ? (
        <HashRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route element={<ProtectedRoute isAuthorized={isAuthorized} />}>
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/actions">
                        <Route path="new" element={<ActionDetailPage mode="new" />} />
                        <Route path="edit/:id" element={<ActionDetailPage mode="edit" />} />
                        <Route path="clone/:id" element={<ActionDetailPage mode="clone" />} />
                    </Route>
                </Route>
            </Routes>
        </HashRouter>
    ) : (
        <h3>Loading...</h3>
    );
});

export const defaultIcon = import.meta.env.BASE_URL + "icon-small.png";
export const defaultTitle = "Homepage App";

function ProtectedRoute({ isAuthorized }: { isAuthorized: boolean }) {
    if (!isAuthorized) {
        return <Navigate to="/" replace />; // Redirect to homepage or login
    }
    return <Outlet />;
}
