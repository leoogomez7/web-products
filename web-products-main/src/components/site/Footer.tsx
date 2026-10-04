import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="absolute inset-x-0 -top-px h-px .bg-linear-to-r from-transparent via-white/15 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg .bg-(--gradient-brand) grid place-items-center shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">Revendedor digital</span>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Catálogo</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/catalogo" search={{ q: undefined, cat: undefined }} className="hover:text-foreground text-muted-foreground">Todos los productos</Link></li>
            <li><Link to="/categorias" className="hover:text-foreground text-muted-foreground">Categorías</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Soporte</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/contacto" search={{ producto: undefined }} className="hover:text-foreground text-muted-foreground">Contacto</Link></li>
            <li><Link to="/admin" className="hover:text-foreground text-muted-foreground">Administrador</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Revendedor digital — Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
