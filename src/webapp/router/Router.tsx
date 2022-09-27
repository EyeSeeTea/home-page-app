import React from "react";
import { Route, Routes, HashRouter } from "react-router-dom";
import {} from "react-router-dom";
import { AboutPage } from "../pages/about/AboutPage";
import { ActionDetailPage } from "../pages/action-detail/ActionDetailPage";
import { HomePage } from "../pages/home/HomePage";
import { SettingsPage } from "../pages/settings/SettingsPage";

export const Router: React.FC = React.memo(() => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/actions">
                    <Route path="new" element={<ActionDetailPage mode="new" />} />
                    <Route path="edit/:id" element={<ActionDetailPage mode="edit" />} />
                    <Route path="clone/:id" element={<ActionDetailPage mode="clone" />} />
                </Route>

                <Route path="/" element={<HomePage />} />
            </Routes>
        </HashRouter>
    );
});
