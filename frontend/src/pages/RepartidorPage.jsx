import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { EnvioFilters } from "@/components/EnvioFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bike, Filter, PackageCheck, Truck, Loader2, MapPin, Phone, Clock, Camera, X, Link, Check } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const FRONTEND_URL = window.location.origin;

export default function RepartidorPage() {
  const { user } = useAuth();
  const [envios, setEnvios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [filters, setFilters] = useState({
    departamento: "",
    motivo: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: ""
  });
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [receptorData, setReceptorData] = useState({ nombre: "", cedula: "" });
  const [noEntregadoComentario, setNoEntregadoComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

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
      const response = await axios.get(`${API}/envios?limit=50${queryString ? '&' + queryString : ''}`);
      setEnvios(response.data);
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

  const copyTrackingLink = async (ticket, envioId) => {
    const link = `${FRONTEND_URL}/rastreo/${ticket}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(envioId);
      toast.success("Link copiado", {
        description: `Rastreo de ${ticket}`
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(envioId);
      toast.success("Link copiado");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const openAsignarModal = (envio) => {
    setSelectedEnvio(envio);
    setModalAction("asignar");
    setShowModal(true);
  };

  const openEntregarModal = (envio) => {
    setSelectedEnvio(envio);
    setModalAction("entregar");
    setReceptorData({ nombre: "", cedula: "" });
    setSelectedImage(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openNoEntregadoModal = (envio) => {
    setSelectedEnvio(envio);
    setModalAction("no_entregado");
    setNoEntregadoComentario("");
    setSelectedImage(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagen muy grande. Máximo 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async () => {
    if (!selectedImage || !selectedEnvio) return null;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      
      const response = await axios.post(
        `${API}/envios/${selectedEnvio.id}/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      return response.data.imagen_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCambiarEstado = async () => {
    if (!selectedEnvio) return;

    if (modalAction === "entregar") {
      if (!receptorData.nombre.trim() || !receptorData.cedula.trim()) {
        toast.error("Complete nombre y cédula del receptor");
        return;
      }
    }

    setSubmitting(true);
    try {
      let imagenUrl = null;
      
      // Upload image if selected (for entregar action)
      if (modalAction === "entregar" && selectedImage) {
        imagenUrl = await uploadImage();
      }

      let nuevoEstado;
      if (modalAction === "asignar") {
        nuevoEstado = "Asignado a courier";
      } else if (modalAction === "entregar") {
        nuevoEstado = "Entregado";
      } else if (modalAction === "no_entregado") {
        nuevoEstado = "No entregado";
      }
      
      const payload = {
        nuevo_estado: nuevoEstado,
        ...(modalAction === "entregar" && {
          receptor_nombre: receptorData.nombre,
          receptor_cedula: receptorData.cedula,
          imagen_url: imagenUrl
        })
      };

      const response = await axios.patch(`${API}/envios/${selectedEnvio.id}/estado`, payload);
      
      setEnvios(prev => prev.map(e => 
        e.id === selectedEnvio.id ? response.data : e
      ));

      let message;
      if (modalAction === "asignar") {
        message = "Envío asignado. Se notificará al cliente por WhatsApp.";
      } else if (modalAction === "entregar") {
        message = "Envío entregado. Se notificará al cliente por WhatsApp.";
      } else if (modalAction === "no_entregado") {
        message = "Envío marcado como no entregado. Se notificará al cliente.";
      }
      
      toast.success(message);
      setShowModal(false);
      setSelectedEnvio(null);
      setReceptorData({ nombre: "", cedula: "" });
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error changing status:", error);
      const message = error.response?.data?.detail || "Error al cambiar estado";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Ingresada":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Asignado a courier":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Entregado":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "No entregado":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="repartidor-page">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white border border-slate-200 rounded-sm">
          <div className="h-1 bg-[#FF0000]"></div>
          
          <div className="border-b border-slate-100 p-3 sm:p-6 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF0000] rounded-sm flex items-center justify-center flex-shrink-0">
                  <Bike className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Panel de Repartidor
                  </h1>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    {user?.nombre}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="rounded-sm border-slate-200 hover:bg-slate-100"
                data-testid="toggle-filters-btn"
              >
                <Filter className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Filtros
              </Button>
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

          <div className="p-2 sm:p-4 md:p-6">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Cargando...</div>
            ) : envios.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto text-slate-300 mb-4" strokeWidth={1} />
                <p className="text-slate-500 font-medium">No hay envíos</p>
                <p className="text-sm text-slate-400 mt-1">
                  Ajuste los filtros para ver más resultados
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] sm:h-[600px]">
                {/* Mobile Cards View */}
                <div className="block lg:hidden space-y-3">
                  {envios.map((envio) => (
                    <div 
                      key={envio.id}
                      className="bg-white border border-slate-200 rounded-lg p-4"
                      data-testid={`envio-card-${envio.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="font-mono font-bold text-slate-900">
                            {envio.ticket}
                          </span>
                          <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-medium border rounded-sm ${getEstadoColor(envio.estado)}`}>
                            {envio.estado}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                          <div>
                            <p className="font-medium text-slate-700">
                              {envio.calle} {envio.numero}{envio.apto && `, ${envio.apto}`}
                            </p>
                            <p className="text-xs text-slate-500">{envio.departamento}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                          <span className="text-slate-600">{envio.contacto} - {envio.telefono}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                          <span className="text-xs text-slate-500">{formatDate(envio.fecha_carga)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col gap-2">
                        {/* Copy Link Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyTrackingLink(envio.ticket, envio.id)}
                          className={`rounded-sm w-full ${copiedId === envio.id ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200'}`}
                          data-testid={`copy-link-card-${envio.id}`}
                        >
                          {copiedId === envio.id ? (
                            <>
                              <Check className="w-4 h-4 mr-2" strokeWidth={2} />
                              Link Copiado
                            </>
                          ) : (
                            <>
                              <Link className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              Copiar Link de Rastreo
                            </>
                          )}
                        </Button>
                        
                        {/* Action Buttons */}
                        {envio.estado === "Ingresada" && (
                          <Button
                            size="sm"
                            onClick={() => openAsignarModal(envio)}
                            className="rounded-sm bg-amber-500 hover:bg-amber-600 text-white w-full"
                            data-testid={`asignar-btn-${envio.id}`}
                          >
                            <Truck className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            Retirar Paquete
                          </Button>
                        )}
                        {envio.estado === "Asignado a courier" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openEntregarModal(envio)}
                              className="rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white w-full"
                              data-testid={`entregar-btn-${envio.id}`}
                            >
                              <PackageCheck className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              Marcar Entregado
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openNoEntregadoModal(envio)}
                              className="rounded-sm border-red-300 text-red-600 hover:bg-red-50 w-full"
                              data-testid={`no-entregar-btn-${envio.id}`}
                            >
                              <X className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              No Entregado
                            </Button>
                          </>
                        )}
                        {envio.estado === "Entregado" && (
                          <span className="text-sm text-emerald-600 font-medium text-center py-2">
                            ✓ Completado
                          </span>
                        )}
                        {envio.estado === "No entregado" && (
                          <Button
                            size="sm"
                            onClick={() => openAsignarModal(envio)}
                            className="rounded-sm bg-amber-500 hover:bg-amber-600 text-white w-full"
                            data-testid={`reintentar-btn-${envio.id}`}
                          >
                            <Truck className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            Reintentar Entrega
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <Table className="hidden lg:table">
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Ticket
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Estado
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Destino
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">
                        Contacto
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">
                        Motivo
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {envios.map((envio) => (
                      <TableRow 
                        key={envio.id} 
                        className="border-b border-slate-100"
                        data-testid={`envio-row-${envio.id}`}
                      >
                        <TableCell>
                          <span className="font-mono font-semibold text-sm text-slate-900">
                            {envio.ticket}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" strokeWidth={1.5} />
                            <span className="text-xs text-slate-500">
                              {formatDate(envio.fecha_carga)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-sm ${getEstadoColor(envio.estado)}`}>
                            {envio.estado}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-slate-700 font-medium">
                              {envio.calle} {envio.numero}
                              {envio.apto && `, ${envio.apto}`}
                            </p>
                            <p className="text-xs text-slate-500">{envio.departamento}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <p className="text-sm text-slate-700">{envio.contacto}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" strokeWidth={1.5} />
                              <span className="text-xs text-slate-500">{envio.telefono}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-slate-600">{envio.motivo}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyTrackingLink(envio.ticket, envio.id)}
                              className={`h-8 w-8 p-0 ${copiedId === envio.id ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-blue-50 hover:text-blue-600'}`}
                              title="Copiar link de rastreo"
                              data-testid={`copy-link-btn-${envio.id}`}
                            >
                              {copiedId === envio.id ? (
                                <Check className="w-4 h-4" strokeWidth={2} />
                              ) : (
                                <Link className="w-4 h-4" strokeWidth={1.5} />
                              )}
                            </Button>
                            {envio.estado === "Ingresada" && (
                              <Button
                                size="sm"
                                onClick={() => openAsignarModal(envio)}
                                className="rounded-sm bg-amber-500 hover:bg-amber-600 text-white"
                                data-testid={`asignar-btn-${envio.id}`}
                              >
                                <Truck className="w-4 h-4 mr-1" strokeWidth={1.5} />
                                Retirar
                              </Button>
                            )}
                            {envio.estado === "Asignado a courier" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => openEntregarModal(envio)}
                                  className="rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white"
                                  data-testid={`entregar-btn-${envio.id}`}
                                >
                                  <PackageCheck className="w-4 h-4 mr-1" strokeWidth={1.5} />
                                  Entregar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openNoEntregadoModal(envio)}
                                  className="rounded-sm border-red-300 text-red-600 hover:bg-red-50"
                                  data-testid={`no-entregar-btn-${envio.id}`}
                                >
                                  <X className="w-4 h-4 mr-1" strokeWidth={1.5} />
                                  No Entregado
                                </Button>
                              </>
                            )}
                            {envio.estado === "Entregado" && (
                              <span className="text-xs text-emerald-600 font-medium">
                                ✓ Completado
                              </span>
                            )}
                            {envio.estado === "No entregado" && (
                              <Button
                                size="sm"
                                onClick={() => openAsignarModal(envio)}
                                className="rounded-sm bg-amber-500 hover:bg-amber-600 text-white"
                                data-testid={`reintentar-btn-${envio.id}`}
                              >
                                <Truck className="w-4 h-4 mr-1" strokeWidth={1.5} />
                                Reintentar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </div>
      </main>

      {/* Estado Change Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {modalAction === "asignar" && "Confirmar Retiro"}
              {modalAction === "entregar" && "Confirmar Entrega"}
              {modalAction === "no_entregado" && "Confirmar No Entregado"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {selectedEnvio && (
                <>Ticket: <span className="font-mono font-semibold">{selectedEnvio.ticket}</span></>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEnvio && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 sm:p-4 rounded-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-700">
                  {selectedEnvio.calle} {selectedEnvio.numero}
                  {selectedEnvio.apto && `, ${selectedEnvio.apto}`}
                </p>
                <p className="text-xs text-slate-500 mt-1">{selectedEnvio.departamento}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-600">{selectedEnvio.contacto}</span>
                  <span className="text-xs text-slate-500">{selectedEnvio.telefono}</span>
                </div>
              </div>

              {modalAction === "asignar" && (
                <p className="text-sm text-slate-600">
                  Al confirmar, el cliente recibirá un mensaje con link de rastreo.
                </p>
              )}

              {modalAction === "entregar" && (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    Complete los datos de quien recibe el paquete:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                        Nombre del Receptor *
                      </Label>
                      <Input
                        data-testid="receptor-nombre"
                        value={receptorData.nombre}
                        onChange={(e) => setReceptorData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Nombre completo"
                        className="rounded-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                        Cédula de Identidad *
                      </Label>
                      <Input
                        data-testid="receptor-cedula"
                        value={receptorData.cedula}
                        onChange={(e) => setReceptorData(prev => ({ ...prev, cedula: e.target.value }))}
                        placeholder="1.234.567-8"
                        className="rounded-sm"
                      />
                    </div>
                    
                    {/* Image Upload Section */}
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                        Foto de Entrega (opcional)
                      </Label>
                      
                      {!imagePreview ? (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-slate-300 transition-colors"
                        >
                          <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" strokeWidth={1.5} />
                          <p className="text-sm text-slate-500">Toca para tomar foto o seleccionar</p>
                          <p className="text-xs text-slate-400 mt-1">Máximo 5MB</p>
                        </div>
                      ) : (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageSelect}
                        className="hidden"
                        data-testid="image-input"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="rounded-sm w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCambiarEstado}
              disabled={submitting || uploadingImage}
              className={`rounded-sm w-full sm:w-auto ${modalAction === "asignar" ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              data-testid="confirm-estado-btn"
            >
              {(submitting || uploadingImage) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadingImage ? "Subiendo imagen..." : "Procesando..."}
                </>
              ) : (
                modalAction === "asignar" ? "Confirmar Retiro" : "Confirmar Entrega"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
