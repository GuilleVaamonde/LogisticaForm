import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Trash2, MapPin, Phone, Clock, Link, Check, Image, X, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useState } from "react";

const FRONTEND_URL = window.location.origin;

export const EnviosTable = ({ envios, loading, onDelete, onExport, showActions = true }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedEnvio, setSelectedEnvio] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

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

  const getMotivoColor = (motivo) => {
    switch (motivo) {
      case 'Entrega':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Retiro':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Retiro y Entrega':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Ingresada':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Asignado a courier':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Entregado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'No entregado':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
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

  const getDeliveryImage = (envio) => {
    if (!envio.historial_estados) return null;
    const entregado = envio.historial_estados.find(h => h.estado === "Entregado" && h.imagen_url);
    return entregado?.imagen_url || null;
  };

  const getReceptorInfo = (envio) => {
    if (!envio.historial_estados) return null;
    const entregado = envio.historial_estados.find(h => h.estado === "Entregado");
    if (entregado) {
      return {
        nombre: entregado.receptor_nombre,
        cedula: entregado.receptor_cedula,
        fecha: entregado.fecha
      };
    }
    return null;
  };

  const openImageModal = (envio) => {
    setSelectedEnvio(envio);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-3" data-testid="table-loading">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 skeleton rounded-sm"></div>
        ))}
      </div>
    );
  }

  if (envios.length === 0) {
    return (
      <div className="empty-state" data-testid="table-empty">
        <MapPin className="w-12 h-12 mx-auto text-slate-300 mb-4" strokeWidth={1} />
        <p className="text-slate-500 font-medium">No hay envíos registrados</p>
        <p className="text-sm text-slate-400 mt-1">
          Los nuevos registros aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[500px]" data-testid="envios-table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3">
                Ticket
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3">
                Estado
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3">
                Contacto
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3 hidden md:table-cell">
                Dirección
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3 hidden lg:table-cell">
                Creado por
              </TableHead>
              {showActions && (
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3 text-right">
                  Acciones
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {envios.map((envio) => {
              const hasImage = getDeliveryImage(envio);
              
              return (
                <TableRow 
                  key={envio.id} 
                  className="table-row-hover border-b border-slate-100"
                  data-testid={`envio-row-${envio.id}`}
                >
                  <TableCell className="py-3">
                    <span className="font-mono font-semibold text-sm text-slate-900 ticket-display">
                      {envio.ticket}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" strokeWidth={1.5} />
                      <span className="text-xs text-slate-500">{formatDate(envio.fecha_carga)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border rounded-sm ${getEstadoColor(envio.estado)}`}>
                        {envio.estado}
                      </span>
                      {hasImage && (
                        <span className="inline-flex items-center text-emerald-600" title="Tiene foto">
                          <Image className="w-4 h-4" strokeWidth={1.5} />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{envio.contacto}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" strokeWidth={1.5} />
                        <span className="text-xs text-slate-500">{envio.telefono}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 hidden md:table-cell">
                    <div>
                      <p className="text-sm text-slate-700">
                        {envio.calle} {envio.numero}
                        {envio.apto && `, ${envio.apto}`}
                      </p>
                      <p className="text-xs text-slate-500">{envio.departamento}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 hidden lg:table-cell">
                    <div>
                      <p className="text-sm text-slate-700">{envio.creado_por_nombre || '-'}</p>
                      <p className="text-xs text-slate-400">{envio.motivo}</p>
                    </div>
                  </TableCell>
                  {showActions && (
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Details / Image Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openImageModal(envio)}
                          className={`h-8 w-8 p-0 ${hasImage ? 'hover:bg-emerald-50 hover:text-emerald-600' : 'hover:bg-slate-100'}`}
                          title={hasImage ? "Ver foto de entrega" : "Ver detalles"}
                          data-testid={`view-details-btn-${envio.id}`}
                        >
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onExport(envio.id, envio.ticket)}
                          className="h-8 w-8 p-0 hover:bg-slate-100"
                          title="Descargar Excel"
                          data-testid={`export-btn-${envio.id}`}
                        >
                          <Download className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(envio.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Eliminar"
                          data-testid={`delete-btn-${envio.id}`}
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Image/Details Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Detalles del Envío
            </DialogTitle>
          </DialogHeader>
          
          {selectedEnvio && (
            <div className="space-y-4">
              {/* Ticket Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Ticket</p>
                  <p className="text-lg font-mono font-bold text-slate-900">{selectedEnvio.ticket}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border rounded-sm ${getEstadoColor(selectedEnvio.estado)}`}>
                  {selectedEnvio.estado}
                </span>
              </div>

              {/* Address */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedEnvio.calle} {selectedEnvio.numero}
                      {selectedEnvio.apto && `, ${selectedEnvio.apto}`}
                    </p>
                    <p className="text-xs text-slate-500">{selectedEnvio.departamento}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200">
                  <Phone className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm text-slate-700">{selectedEnvio.contacto}</p>
                    <p className="text-xs text-slate-500">{selectedEnvio.telefono}</p>
                  </div>
                </div>
              </div>

              {/* Receptor Info (if delivered) */}
              {getReceptorInfo(selectedEnvio) && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                    Datos de Entrega
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-emerald-900">
                      <span className="font-medium">Recibido por:</span> {getReceptorInfo(selectedEnvio).nombre}
                    </p>
                    <p className="text-sm text-emerald-900">
                      <span className="font-medium">Cédula:</span> {getReceptorInfo(selectedEnvio).cedula}
                    </p>
                    <p className="text-xs text-emerald-700">
                      {formatDate(getReceptorInfo(selectedEnvio).fecha)}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery Image */}
              {getDeliveryImage(selectedEnvio) ? (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Foto de Entrega
                  </p>
                  <img 
                    src={getDeliveryImage(selectedEnvio)} 
                    alt="Foto de entrega" 
                    className="w-full h-auto max-h-80 object-contain rounded-lg border border-slate-200 bg-slate-100"
                  />
                </div>
              ) : selectedEnvio.estado === "Entregado" ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-200">
                  <Image className="w-10 h-10 mx-auto text-slate-300 mb-2" strokeWidth={1} />
                  <p className="text-sm text-slate-500">No hay foto de entrega</p>
                </div>
              ) : null}

              {/* Comments */}
              {selectedEnvio.comentarios && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Comentarios
                  </p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedEnvio.comentarios}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
