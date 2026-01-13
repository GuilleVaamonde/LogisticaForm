import { Package } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FF0000] rounded-sm flex items-center justify-center">
              <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                Sistema de Envíos
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Uruguay
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Logística
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-emerald-600 font-medium">
              Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
