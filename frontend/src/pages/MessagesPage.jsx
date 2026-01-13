import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, Phone, CheckCircle, XCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API}/messages?limit=100`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Error al cargar mensajes");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

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

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Asignado a courier":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Entregado":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="messages-page">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-sm">
          <div className="h-1 bg-[#FF0000]"></div>
          
          <div className="border-b border-slate-100 p-6 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF0000] rounded-sm flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Log de Mensajes WhatsApp
                </h1>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  {messages.length} mensajes registrados (simulados)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Cargando...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" strokeWidth={1} />
                <p className="text-slate-500 font-medium">No hay mensajes</p>
                <p className="text-sm text-slate-400 mt-1">
                  Los mensajes aparecerán cuando cambien los estados de los envíos
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Fecha
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Ticket
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Teléfono
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Estado
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Mensaje
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                        Enviado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.id} className="border-b border-slate-100">
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" strokeWidth={1.5} />
                            <span className="text-xs text-slate-600">
                              {formatDate(msg.fecha)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-semibold text-sm text-slate-900">
                            {msg.ticket}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" strokeWidth={1.5} />
                            <span className="text-sm text-slate-600">{msg.telefono}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-sm ${getEstadoColor(msg.estado)}`}>
                            {msg.estado}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-slate-600 truncate" title={msg.mensaje}>
                            {msg.mensaje}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          {msg.enviado ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={1.5} />
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <XCircle className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                              <span className="text-xs text-slate-400">Simulado</span>
                            </div>
                          )}
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
    </div>
  );
}
