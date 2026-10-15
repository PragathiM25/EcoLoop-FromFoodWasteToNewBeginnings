import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";
import SupplierDashboard from "./pages/SupplierDashboard";
import RecipientDashboard from "./pages/RecipientDashboard";
import RecoveryDashboard from "./pages/RecoveryDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";

function ProtectedRoute({ role, children }) {
  const { currentRole } = useApp();
  if (!currentRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { currentRole } = useApp();

  return (
    <Routes>
      <Route path="/" element={currentRole ? <Navigate to={`/dashboard/${currentRole}`} replace /> : <Welcome />} />
      <Route element={<Layout />}>
        <Route path="/dashboard/supplier" element={<ProtectedRoute role="supplier"><SupplierDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/recipient" element={<ProtectedRoute role="recipient"><RecipientDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/recovery" element={<ProtectedRoute role="recovery"><RecoveryDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/delivery" element={<ProtectedRoute role="delivery"><DeliveryDashboard /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
