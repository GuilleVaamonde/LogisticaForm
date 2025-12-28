import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Save, RotateCcw, Download, Loader2 } from "lucide-react";

const initialFormState = {
  ticket: "",
  calle: "",
  numero: "",
  apto: "",
  esquina: "",
  motivo: "",
  departamento: "",
  comentarios: "",
  telefono: "",
  contacto: ""
};

export const EnvioForm = ({ 
  departamentos, 
  motivos, 
  onSubmit, 
  submitting,
  onExportSingle 
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [lastCreated, setLastCreated] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.ticket.trim()) newErrors.ticket = "Ticket es requerido";
    if (!formData.calle.trim()) newErrors.calle = "Calle es requerida";
    if (!formData.numero.trim()) newErrors.numero = "Número es requerido";
    if (!formData.motivo) newErrors.motivo = "Motivo es requerido";
    if (!formData.departamento) newErrors.departamento = "Departamento es requerido";
    if (!formData.telefono.trim()) newErrors.telefono = "Teléfono es requerido";
    if (!formData.contacto.trim()) newErrors.contacto = "Contacto es requerido";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await onSubmit(formData);
      setLastCreated(result);
      setFormData(initialFormState);
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setLastCreated(null);
  };

  const handleDownloadLast = () => {
    if (lastCreated) {
      onExportSingle(lastCreated.id, lastCreated.ticket);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="envio-form">
      <div className="space-y-5">
        {/* Ticket */}
        <div>
          <Label className="form-label" htmlFor="ticket">
            Ticket (Rastreo) *
          </Label>
          <Input
            id="ticket"
            data-testid="input-ticket"
            value={formData.ticket}
            onChange={(e) => handleChange("ticket", e.target.value)}
            placeholder="Ej: ENV-2024-001"
            className={`rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] font-mono ${errors.ticket ? 'border-red-500' : 'border-slate-200'}`}
          />
          {errors.ticket && <p className="text-xs text-red-500 mt-1">{errors.ticket}</p>}
        </div>

        {/* Contacto y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="form-label" htmlFor="contacto">
              Contacto *
            </Label>
            <Input
              id="contacto"
              data-testid="input-contacto"
              value={formData.contacto}
              onChange={(e) => handleChange("contacto", e.target.value)}
              placeholder="Nombre de quien recibe"
              className={`rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] ${errors.contacto ? 'border-red-500' : 'border-slate-200'}`}
            />
            {errors.contacto && <p className="text-xs text-red-500 mt-1">{errors.contacto}</p>}
          </div>
          <div>
            <Label className="form-label" htmlFor="telefono">
              Teléfono *
            </Label>
            <Input
              id="telefono"
              data-testid="input-telefono"
              value={formData.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              placeholder="099 123 456"
              className={`rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] ${errors.telefono ? 'border-red-500' : 'border-slate-200'}`}
            />
            {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
          </div>
        </div>

        {/* Calle y Número */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label className="form-label" htmlFor="calle">
              Calle *
            </Label>
            <Input
              id="calle"
              data-testid="input-calle"
              value={formData.calle}
              onChange={(e) => handleChange("calle", e.target.value)}
              placeholder="Nombre de la calle"
              className={`rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] ${errors.calle ? 'border-red-500' : 'border-slate-200'}`}
            />
            {errors.calle && <p className="text-xs text-red-500 mt-1">{errors.calle}</p>}
          </div>
          <div>
            <Label className="form-label" htmlFor="numero">
              Número *
            </Label>
            <Input
              id="numero"
              data-testid="input-numero"
              value={formData.numero}
              onChange={(e) => handleChange("numero", e.target.value)}
              placeholder="1234"
              className={`rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] ${errors.numero ? 'border-red-500' : 'border-slate-200'}`}
            />
            {errors.numero && <p className="text-xs text-red-500 mt-1">{errors.numero}</p>}
          </div>
        </div>

        {/* Apto y Esquina */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="form-label" htmlFor="apto">
              Apartamento
            </Label>
            <Input
              id="apto"
              data-testid="input-apto"
              value={formData.apto}
              onChange={(e) => handleChange("apto", e.target.value)}
              placeholder="Ej: Apto 101"
              className="rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] border-slate-200"
            />
          </div>
          <div>
            <Label className="form-label" htmlFor="esquina">
              Esquina
            </Label>
            <Input
              id="esquina"
              data-testid="input-esquina"
              value={formData.esquina}
              onChange={(e) => handleChange("esquina", e.target.value)}
              placeholder="Calle de referencia"
              className="rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] border-slate-200"
            />
          </div>
        </div>

        {/* Departamento y Motivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="form-label" htmlFor="departamento">
              Departamento *
            </Label>
            <Select 
              value={formData.departamento} 
              onValueChange={(value) => handleChange("departamento", value)}
            >
              <SelectTrigger 
                id="departamento"
                data-testid="select-departamento"
                className={`rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] ${errors.departamento ? 'border-red-500' : 'border-slate-200'}`}
              >
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {departamentos.map((dep) => (
                  <SelectItem key={dep} value={dep} data-testid={`dep-${dep}`}>
                    {dep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departamento && <p className="text-xs text-red-500 mt-1">{errors.departamento}</p>}
          </div>
          <div>
            <Label className="form-label" htmlFor="motivo">
              Motivo *
            </Label>
            <Select 
              value={formData.motivo} 
              onValueChange={(value) => handleChange("motivo", value)}
            >
              <SelectTrigger 
                id="motivo"
                data-testid="select-motivo"
                className={`rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] ${errors.motivo ? 'border-red-500' : 'border-slate-200'}`}
              >
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {motivos.map((motivo) => (
                  <SelectItem key={motivo} value={motivo} data-testid={`motivo-${motivo}`}>
                    {motivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.motivo && <p className="text-xs text-red-500 mt-1">{errors.motivo}</p>}
          </div>
        </div>

        {/* Comentarios */}
        <div>
          <Label className="form-label" htmlFor="comentarios">
            Comentarios
          </Label>
          <Textarea
            id="comentarios"
            data-testid="input-comentarios"
            value={formData.comentarios}
            onChange={(e) => handleChange("comentarios", e.target.value)}
            placeholder="Observaciones adicionales..."
            rows={3}
            className="rounded-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#C91A25]/20 focus:border-[#C91A25] border-slate-200 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-sm bg-[#C91A25] hover:bg-[#A6151E] text-white font-medium tracking-wide transition-all active:scale-[0.98]"
            data-testid="submit-btn"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Guardar Envío
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="rounded-sm border-slate-200 hover:bg-slate-50 text-slate-600"
            data-testid="reset-btn"
          >
            <RotateCcw className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Limpiar
          </Button>
        </div>

        {/* Last Created - Download Option */}
        {lastCreated && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-sm" data-testid="last-created-section">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Último registro guardado
                </p>
                <p className="text-xs text-emerald-600 font-mono mt-1">
                  Ticket: {lastCreated.ticket}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadLast}
                className="rounded-sm border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                data-testid="download-last-btn"
              >
                <Download className="w-4 h-4 mr-1" strokeWidth={1.5} />
                Excel
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
