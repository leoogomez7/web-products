import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Sparkles, ShieldCheck } from "lucide-react";

const nav = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Productos" },
  { to: "/categorias", label: "Categorías" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl bg-background/65 border-b border-border"
          : "backdrop-blur-md bg-background/20 border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 group"
        >
          <div className="relative h-8 w-8 rounded-lg bg-(--gradient-brand) shadow-glow grid place-items-center">
            <Sparkles className="h-4 w-4 text-white" />
            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Revendedor</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">digital</span>
          </div>
        </button>

        <nav className="flex items-center gap-1 ml-2">
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "relative px-3 py-1.5 text-sm rounded-full transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-white/5 ring-1 ring-white/10" />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/catalogo"
            search={{ q: undefined, cat: undefined }}
            className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-full glass text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Buscar productos…</span>
            <kbd className="ml-2 hidden lg:inline-flex h-5 items-center rounded border border-border bg-white/5 px-1.5 text-[10px] font-medium text-muted-foreground">
              /
            </kbd>
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium border border-border bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Panel</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
