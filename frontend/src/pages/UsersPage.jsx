import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Plus, Trash2, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "agente", label: "Agente" },
  { value: "repartidor", label: "Repartidor" }
];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nombre: "",
    rol: ""
  });
  const [errors, setErrors] = useState({});

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Usuario requerido";
    if (!formData.password.trim()) newErrors.password = "Contraseña requerida";
    if (formData.password.length < 4) newErrors.password = "Mínimo 4 caracteres";
    if (!formData.nombre.trim()) newErrors.nombre = "Nombre requerido";
    if (!formData.rol) newErrors.rol = "Rol requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/users`, formData);
      setUsers(prev => [...prev, response.data]);
      toast.success("Usuario creado exitosamente");
      setShowModal(false);
      setFormData({ username: "", password: "", nombre: "", rol: "" });
    } catch (error) {
      console.error("Error creating user:", error);
      const message = error.response?.data?.detail || "Error al crear usuario";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!confirm(`¿Eliminar usuario ${username}?`)) return;

    try {
      await axios.delete(`${API}/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success("Usuario eliminado");
    } catch (error) {
      console.error("Error deleting user:", error);
      const message = error.response?.data?.detail || "Error al eliminar";
      toast.error(message);
    }
  };

  const getRolLabel = (rol) => {
    const found = ROLES.find(r => r.value === rol);
    return found ? found.label : rol;
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-200";
      case "agente":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "repartidor":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="users-page">
      <AppHeader />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-sm">
          <div className="h-1 bg-[#FF0000]"></div>
          
          <div className="border-b border-slate-100 p-6 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF0000] rounded-sm flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Gestión de Usuarios
                  </h1>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    {users.length} usuarios activos
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowModal(true)}
                className="rounded-sm bg-[#FF0000] hover:bg-[#CC0000] text-white"
                data-testid="create-user-btn"
              >
                <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Cargando...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No hay usuarios registrados
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Usuario
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nombre
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Rol
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-b border-slate-100" data-testid={`user-row-${user.id}`}>
                      <TableCell className="font-mono font-medium text-slate-900">
                        {user.username}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {user.nombre}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-sm ${getRolColor(user.rol)}`}>
                          {getRolLabel(user.rol)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={user.id === currentUser?.id}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title={user.id === currentUser?.id ? "No puedes eliminarte" : "Eliminar"}
                          data-testid={`delete-user-btn-${user.id}`}
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>

      {/* Create User Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Crear Nuevo Usuario
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Usuario *
              </Label>
              <Input
                data-testid="new-user-username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="nombre.usuario"
                className={`rounded-sm ${errors.username ? 'border-red-500' : ''}`}
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Contraseña *
              </Label>
              <Input
                data-testid="new-user-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 4 caracteres"
                className={`rounded-sm ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Nombre Completo *
              </Label>
              <Input
                data-testid="new-user-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Juan Pérez"
                className={`rounded-sm ${errors.nombre ? 'border-red-500' : ''}`}
              />
              {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Rol *
              </Label>
              <Select
                value={formData.rol}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rol: value }))}
              >
                <SelectTrigger 
                  data-testid="new-user-rol"
                  className={`rounded-sm ${errors.rol ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((rol) => (
                    <SelectItem key={rol.value} value={rol.value}>
                      {rol.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rol && <p className="text-xs text-red-500 mt-1">{errors.rol}</p>}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="rounded-sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-sm bg-[#FF0000] hover:bg-[#CC0000]"
                data-testid="submit-new-user-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Usuario"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
