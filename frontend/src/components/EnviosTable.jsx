import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2, MapPin, Phone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const EnviosTable = ({ envios, loading, onDelete, onExport }) => {
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
    <ScrollArea className="h-[500px]" data-testid="envios-table-container">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3">
              Ticket
            </TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3">
              Fecha
            </TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3">
              Contacto
            </TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3 hidden md:table-cell">
              Dirección
            </TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3 hidden lg:table-cell">
              Motivo
            </TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3 text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {envios.map((envio) => (
            <TableRow 
              key={envio.id} 
              className="table-row-hover border-b border-slate-100"
              data-testid={`envio-row-${envio.id}`}
            >
              <TableCell className="py-3">
                <span className="font-mono font-semibold text-sm text-slate-900 ticket-display">
                  {envio.ticket}
                </span>
              </TableCell>
              <TableCell className="py-3">
                <span className="text-sm text-slate-600">
                  {formatDate(envio.fecha_carga)}
                </span>
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
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border rounded-sm ${getMotivoColor(envio.motivo)}`}>
                  {envio.motivo}
                </span>
              </TableCell>
              <TableCell className="py-3 text-right">
                <div className="flex items-center justify-end gap-1">
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
