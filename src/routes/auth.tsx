import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { toast } from "sonner";

const MASTER_PASSWORD_KEY = "admin_password_verified";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Acceso — Revendedor digital" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: kindeLoading } = useKindeAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const masterPassword = import.meta.env.VITE_MASTER_PASSWORD;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(MASTER_PASSWORD_KEY);
    if (stored === "true") {
      setIsUnlocked(true);
      navigate({ to: "/admin/", replace: true });
      return;
    }

    if (!kindeLoading && isAuthenticated) {
      navigate({ to: "/admin/", replace: true });
    }
  }, [isAuthenticated, kindeLoading, navigate]);

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!masterPassword) {
      setError("Contraseña maestra no configurada.");
      return;
    }

    if (password === masterPassword) {
      setError(null);
      setPassword("");
      sessionStorage.setItem(MASTER_PASSWORD_KEY, "true");
      setIsUnlocked(true);
      navigate({ to: "/admin/", replace: true });
      return;
    }

    setError("Contraseña incorrecta. Intenta nuevamente.");
    setPassword("");
  };

  const handleQuickAccess = () => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(MASTER_PASSWORD_KEY, "true");
    setIsUnlocked(true);
    navigate({ to: "/admin/", replace: true });
  };

  return (
    <section className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
      </Link>

      <div className="mt-6 rounded-3xl glass-strong p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-violet/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Acceso a administración
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em]">Panel</h1>

          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Ingrese la contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full h-11 rounded-full glass px-4 text-sm outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center h-11 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition"
            >
              Confirmar contraseña
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-6">
            <button
              onClick={handleQuickAccess}
              className="mt-4 w-full inline-flex items-center justify-center h-11 rounded-full border border-border bg-background text-sm text-muted-foreground hover:bg-white/5 transition"
            >
              Ingresar al panel de prueba
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
