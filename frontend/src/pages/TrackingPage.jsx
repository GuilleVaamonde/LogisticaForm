import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Package, MapPin, Phone, User, Clock, CheckCircle, Truck, FileText } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_cliente-form/artifacts/ypgu3n9v_image.png";

export default function TrackingPage() {
  const { ticket } = useParams();
  const [envio, setEnvio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnvio = async () => {
      try {
        const response = await axios.get(`${API}/tracking/${ticket}`);
        setEnvio(response.data);
      } catch (err) {
        console.error("Error fetching tracking:", err);
        setError(err.response?.status === 404 
          ? "No se encontró el envío con ese ticket" 
          : "Error al cargar la información");
      } finally {
        setLoading(false);
      }
    };

    if (ticket) {
      fetchEnvio();
    }
  }, [ticket]);

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case "Ingresada":
        return { 
          icon: FileText, 
          color: "text-slate-500", 
          bg: "bg-slate-100",
          description: "Tu pedido ha sido registrado y está siendo procesado"
        };
      case "Asignado a courier":
        return { 
          icon: Truck, 
          color: "text-amber-500", 
          bg: "bg-amber-50",
          description: "Un repartidor está en camino con tu pedido"
        };
      case "Entregado":
        return { 
          icon: CheckCircle, 
          color: "text-emerald-500", 
          bg: "bg-emerald-50",
          description: "Tu pedido ha sido entregado exitosamente"
        };
      default:
        return { 
          icon: Package, 
          color: "text-slate-500", 
          bg: "bg-slate-100",
          description: ""
        };
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-UY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-slate-500">Cargando información...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full text-center">
          <img src={LOGO_URL} alt="Getnet" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Seguimiento de Envío</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const estadoInfo = getEstadoInfo(envio.estado);
  const EstadoIcon = estadoInfo.icon;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="tracking-page">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center gap-3">
          <img src={LOGO_URL} alt="Getnet" className="w-8 h-8" />
          <div className="text-center">
            <h1 className="text-base font-bold text-slate-900">Seguimiento de Envío</h1>
            <p className="text-xs text-[#FF0000] font-semibold">GETNET</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Ticket Info */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-4">
          <div className="h-1 bg-[#FF0000]"></div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Ticket</p>
                <p className="text-lg font-mono font-bold text-slate-900">{envio.ticket}</p>
              </div>
              <div className={`p-3 rounded-full ${estadoInfo.bg}`}>
                <EstadoIcon className={`w-6 h-6 ${estadoInfo.color}`} strokeWidth={2} />
              </div>
            </div>
            
            {/* Estado actual */}
            <div className={`p-4 rounded-lg ${estadoInfo.bg} mb-4`}>
              <p className={`text-sm font-bold ${estadoInfo.color} mb-1`}>
                {envio.estado}
              </p>
              <p className="text-sm text-slate-600">
                {estadoInfo.description}
              </p>
            </div>

            {/* Destino */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {envio.calle} {envio.numero}
                    {envio.apto && `, ${envio.apto}`}
                  </p>
                  <p className="text-xs text-slate-500">{envio.departamento}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-slate-700">{envio.contacto}</p>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-slate-500">
                  Registrado: {formatDate(envio.fecha_carga)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de estados */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Historial
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {envio.historial_estados.map((h, index) => {
                const info = getEstadoInfo(h.estado);
                const Icon = info.icon;
                const isLast = index === envio.historial_estados.length - 1;
                
                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${info.bg}`}>
                        <Icon className={`w-4 h-4 ${info.color}`} strokeWidth={2} />
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-slate-900">{h.estado}</p>
                      <p className="text-xs text-slate-500">{formatDate(h.fecha)}</p>
                      {h.receptor_nombre && (
                        <p className="text-xs text-slate-600 mt-1">
                          Recibido por: {h.receptor_nombre}
                        </p>
                      )}
                      {h.imagen_url && (
                        <img 
                          src={h.imagen_url} 
                          alt="Foto de entrega" 
                          className="mt-2 rounded-lg max-w-full h-auto max-h-48 object-cover border border-slate-200"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Powered by Getnet Uruguay
          </p>
        </div>
      </main>
    </div>
  );
}
