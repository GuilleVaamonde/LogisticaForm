import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { EnvioForm } from "@/components/EnvioForm";
import { EnviosTable } from "@/components/EnviosTable";
import { AppHeader } from "@/components/AppHeader";
import { EnvioFilters } from "@/components/EnvioFilters";
import { Truck, FileSpreadsheet, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DashboardPage() {
  const { user } = useAuth();
  const [envios, setEnvios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    departamento: "",
    motivo: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: ""
  });

  const buildQueryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });
    return query.toString();
  };

  const fetchEnvios = async (filterParams = filters) => {
    try {
      const queryString = buildQueryString(filterParams);
      const [enviosRes, countRes] = await Promise.all([
        axios.get(`${API}/envios?limit=20${queryString ? '&' + queryString : ''}`),
        axios.get(`${API}/envios/count?${queryString}`)
      ]);
      
      setEnvios(enviosRes.data);
      setTotalCount(countRes.data.count);
    } catch (error) {
      console.error("Error fetching envios:", error);
      toast.error("Error al cargar los envíos");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depRes, motivosRes] = await Promise.all([
          axios.get(`${API}/departamentos`),
          axios.get(`${API}/motivos`)
        ]);
        
        setDepartamentos(depRes.data.departamentos);
        setMotivos(motivosRes.data.motivos);
        await fetchEnvios();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/envios`, formData);
      setEnvios(prev => [response.data, ...prev.slice(0, 19)]);
      setTotalCount(prev => prev + 1);
      toast.success("Envío registrado exitosamente", {
        description: `Ticket: ${response.data.ticket}`
      });
      return response.data;
    } catch (error) {
      console.error("Error creating envio:", error);
      const message = error.response?.data?.detail || "Error al registrar el envío";
      toast.error(message);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (envioId) => {
    try {
      await axios.delete(`${API}/envios/${envioId}`);
      setEnvios(prev => prev.filter(e => e.id !== envioId));
      setTotalCount(prev => prev - 1);
      toast.success("Envío eliminado");
    } catch (error) {
      console.error("Error deleting envio:", error);
      toast.error("Error al eliminar el envío");
    }
  };

  const handleExportSingle = async (envioId, ticket) => {
    try {
      const response = await axios.get(`${API}/envios/${envioId}/excel`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `envio_${ticket}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Excel descargado");
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Error al exportar el Excel");
    }
  };

  const handleExportAll = async () => {
    try {
      const queryString = buildQueryString(filters);
      const response = await axios.get(`${API}/envios/export/excel?${queryString}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `envios.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Excel descargado");
    } catch (error) {
      console.error("Error exporting all:", error);
      const message = error.response?.status === 404 
        ? "No hay envíos para exportar" 
        : "Error al exportar el Excel";
      toast.error(message);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchEnvios(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      departamento: "",
      motivo: "",
      estado: "",
      fecha_desde: "",
      fecha_hasta: ""
    };
    setFilters(emptyFilters);
    fetchEnvios(emptyFilters);
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard-page">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-sm" data-testid="form-section">
              <div className="h-1 bg-[#FF0000]"></div>
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#FF0000] rounded-sm flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Nuevo Envío
                    </h2>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Registro de cliente
                    </p>
                  </div>
                </div>
                
                <EnvioForm 
                  departamentos={departamentos}
                  motivos={motivos}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  onExportSingle={handleExportSingle}
                />
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-sm" data-testid="table-section">
              <div className="h-1 bg-[#FF0000]"></div>
              <div className="border-b border-slate-100 p-4 md:p-6 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Registros
                      </h2>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        {totalCount} envíos totales
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      variant="outline"
                      className="rounded-sm border-slate-200 hover:bg-slate-100"
                      data-testid="toggle-filters-btn"
                    >
                      <Filter className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Filtros
                    </Button>
                    <Button
                      onClick={handleExportAll}
                      variant="outline"
                      className="rounded-sm border-slate-200 hover:bg-slate-100 text-slate-700"
                      disabled={totalCount === 0}
                      data-testid="export-all-btn"
                    >
                      <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Excel
                    </Button>
                  </div>
                </div>
                
                {showFilters && (
                  <EnvioFilters
                    filters={filters}
                    departamentos={departamentos}
                    motivos={motivos}
                    onChange={handleFilterChange}
                    onClear={handleClearFilters}
                  />
                )}
              </div>
              
              <div className="p-4 md:p-6 overflow-x-auto">
                <EnviosTable 
                  envios={envios}
                  loading={loading}
                  onDelete={handleDelete}
                  onExport={handleExportSingle}
                  showActions={true}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
