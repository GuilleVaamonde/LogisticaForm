import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import UsersPage from "@/pages/UsersPage";
import RepartidorPage from "@/pages/RepartidorPage";
import MessagesPage from "@/pages/MessagesPage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirect based on role
    if (user.rol === "repartidor") {
      return <Navigate to="/repartidor" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.rol === "repartidor" ? "/repartidor" : "/"} replace /> : <LoginPage />
      } />
      
      <Route path="/" element={
        <ProtectedRoute allowedRoles={["admin", "agente"]}>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/usuarios" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <UsersPage />
        </ProtectedRoute>
      } />
      
      <Route path="/repartidor" element={
        <ProtectedRoute allowedRoles={["repartidor"]}>
          <RepartidorPage />
        </ProtectedRoute>
      } />
      
      <Route path="/mensajes" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <MessagesPage />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
