import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProductsPage from "../pages/ProductsPage";
import ProductPage from "../pages/ProductPage";
import ScenariosPage from "../pages/ScenariosPage";
import ReportsPage from "../pages/ReportsPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";
import MainLayout from "../components/layout/MainLayout";

import { ROUTES } from "./routes";
import CalculatorPage from "../pages/CalculatorPage";
import { ProtectedRoute } from "../components/routing/ProtectedRoute";
import HelpPage from "../pages/HelpPage";
import HelpMetricPage from "../pages/HelpMetricPage";

export default function AppRouter() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to={ROUTES.PRODUCTS} replace />}
            />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>                
                    <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                    <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
                    <Route path={ROUTES.PRODUCT} element={<ProductPage />} />
                    <Route path={ROUTES.CALCULATOR} element={<CalculatorPage />} />
                    <Route path={ROUTES.SCENARIOS} element={<ScenariosPage />} />
                    <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
                    <Route path={ROUTES.HELP} element={<HelpPage />} />
                    <Route path={ROUTES.METRIC_HELP} element={<HelpMetricPage />} />
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
