import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ESTADOS = ["Ingresada", "Asignado a courier", "Entregado", "No entregado"];

export const EnvioFilters = ({ 
  filters, 
  departamentos, 
  motivos, 
  onChange, 
  onClear 
}) => {
  const [fechaDesdeOpen, setFechaDesdeOpen] = useState(false);
  const [fechaHastaOpen, setFechaHastaOpen] = useState(false);

  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value === "all" ? "" : value });
  };

  const handleDateChange = (field, date) => {
    if (date) {
      const isoDate = date.toISOString().split('T')[0];
      onChange({ ...filters, [field]: isoDate });
    } else {
      onChange({ ...filters, [field]: "" });
    }
    if (field === "fecha_desde") setFechaDesdeOpen(false);
    if (field === "fecha_hasta") setFechaHastaOpen(false);
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return undefined;
    return new Date(dateStr + "T00:00:00");
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Seleccionar";
    const date = new Date(dateStr + "T00:00:00");
    return format(date, "dd/MM/yyyy", { locale: es });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="mt-4 pt-4 border-t border-slate-200" data-testid="envio-filters">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Departamento */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Departamento
          </Label>
          <Select 
            value={filters.departamento || "all"} 
            onValueChange={(v) => handleChange("departamento", v)}
          >
            <SelectTrigger className="rounded-sm bg-white" data-testid="filter-departamento">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {departamentos.map((dep) => (
                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Motivo */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Motivo
          </Label>
          <Select 
            value={filters.motivo || "all"} 
            onValueChange={(v) => handleChange("motivo", v)}
          >
            <SelectTrigger className="rounded-sm bg-white" data-testid="filter-motivo">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {motivos.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estado */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Estado
          </Label>
          <Select 
            value={filters.estado || "all"} 
            onValueChange={(v) => handleChange("estado", v)}
          >
            <SelectTrigger className="rounded-sm bg-white" data-testid="filter-estado">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {ESTADOS.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fecha Desde - Calendar */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Fecha Desde
          </Label>
          <Popover open={fechaDesdeOpen} onOpenChange={setFechaDesdeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal rounded-sm bg-white border-slate-200"
                data-testid="filter-fecha-desde"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                <span className={filters.fecha_desde ? "text-slate-900" : "text-slate-500"}>
                  {formatDisplayDate(filters.fecha_desde)}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseDate(filters.fecha_desde)}
                onSelect={(date) => handleDateChange("fecha_desde", date)}
                locale={es}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Fecha Hasta - Calendar */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Fecha Hasta
          </Label>
          <Popover open={fechaHastaOpen} onOpenChange={setFechaHastaOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal rounded-sm bg-white border-slate-200"
                data-testid="filter-fecha-hasta"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                <span className={filters.fecha_hasta ? "text-slate-900" : "text-slate-500"}>
                  {formatDisplayDate(filters.fecha_hasta)}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseDate(filters.fecha_hasta)}
                onSelect={(date) => handleDateChange("fecha_hasta", date)}
                locale={es}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-slate-500 hover:text-slate-700"
            data-testid="clear-filters-btn"
          >
            <X className="w-4 h-4 mr-1" strokeWidth={1.5} />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
};
