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
import { X } from "lucide-react";

const ESTADOS = ["Ingresada", "Asignado a courier", "Entregado"];

export const EnvioFilters = ({ 
  filters, 
  departamentos, 
  motivos, 
  onChange, 
  onClear 
}) => {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value === "all" ? "" : value });
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

        {/* Fecha Desde */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Fecha Desde
          </Label>
          <Input
            type="date"
            value={filters.fecha_desde}
            onChange={(e) => handleChange("fecha_desde", e.target.value)}
            className="rounded-sm bg-white"
            data-testid="filter-fecha-desde"
          />
        </div>

        {/* Fecha Hasta */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Fecha Hasta
          </Label>
          <Input
            type="date"
            value={filters.fecha_hasta}
            onChange={(e) => handleChange("fecha_hasta", e.target.value)}
            className="rounded-sm bg-white"
            data-testid="filter-fecha-hasta"
          />
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
