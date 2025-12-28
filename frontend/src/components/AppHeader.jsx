import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, LogOut, Users, MessageSquare, LayoutDashboard, Bike } from "lucide-react";

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon }) => (
    <Link to={to}>
      <Button
        variant="ghost"
        className={`rounded-sm text-sm ${isActive(to) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
      >
        <Icon className="w-4 h-4 mr-2" strokeWidth={1.5} />
        {children}
      </Button>
    </Link>
  );

  return (
    <header className="bg-white border-b border-slate-200" data-testid="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#C91A25] rounded-sm flex items-center justify-center">
                <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  Sistema de Envíos
                </h1>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Uruguay
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {(user?.rol === "admin" || user?.rol === "agente") && (
                <NavLink to="/" icon={LayoutDashboard}>
                  Dashboard
                </NavLink>
              )}
              {user?.rol === "admin" && (
                <>
                  <NavLink to="/usuarios" icon={Users}>
                    Usuarios
                  </NavLink>
                  <NavLink to="/mensajes" icon={MessageSquare}>
                    Mensajes
                  </NavLink>
                </>
              )}
              {user?.rol === "repartidor" && (
                <NavLink to="/repartidor" icon={Bike}>
                  Mis Envíos
                </NavLink>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-500">{user?.nombre}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${
                user?.rol === 'admin' 
                  ? 'bg-red-50 text-red-700' 
                  : user?.rol === 'agente'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-amber-50 text-amber-700'
              }`}>
                {user?.rol}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="rounded-sm text-slate-600 hover:text-red-600 hover:bg-red-50"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
