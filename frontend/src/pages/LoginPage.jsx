import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Loader2, Lock, User } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Ingrese usuario y contraseña");
      return;
    }
    
    setLoading(true);
    try {
      const user = await login(username, password);
      toast.success(`Bienvenido, ${user.nombre}`);
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.detail || "Error al iniciar sesión";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
          <div className="h-1 bg-[#C91A25]"></div>
          
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-[#C91A25] rounded-sm flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Sistema de Envíos
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                Uruguay
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <Input
                    data-testid="input-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingrese su usuario"
                    className="pl-10 rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] border-slate-200"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <Input
                    data-testid="input-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    className="pl-10 rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] border-slate-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-[#C91A25] hover:bg-[#A6151E] text-white font-medium tracking-wide transition-all active:scale-[0.98]"
                data-testid="login-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Admin por defecto: admin / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
