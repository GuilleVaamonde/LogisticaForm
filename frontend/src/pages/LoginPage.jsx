import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, User } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_cliente-form/artifacts/ypgu3n9v_image.png";

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
          <div className="h-1 bg-[#FF0000]"></div>
          
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <img 
                src={LOGO_URL} 
                alt="Getnet Logo" 
                className="w-20 h-20 object-contain mb-4"
              />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                Seguimientos de envíos
              </h1>
              <p className="text-sm text-[#FF0000] font-semibold uppercase tracking-wider mt-1">
                Getnet
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
                    className="pl-10 rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000] border-slate-200"
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
                    className="pl-10 rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000] border-slate-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-[#FF0000] hover:bg-[#CC0000] text-white font-medium tracking-wide transition-all active:scale-[0.98]"
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
          </div>
        </div>
      </div>
    </div>
  );
}
