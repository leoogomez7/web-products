import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { ArrowLeft, Loader2, ShieldCheck, LogIn } from "lucide-react";
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
  const { login, register, isAuthenticated, isLoading: kindeLoading } = useKindeAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const masterPassword = import.meta.env.VITE_MASTER_PASSWORD;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(MASTER_PASSWORD_KEY);
    if (stored === "true") {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!kindeLoading && isAuthenticated) {
      navigate({ to: "/admin" });
    }
  }, [isAuthenticated, kindeLoading, navigate]);

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!masterPassword) {
      setError("Contraseña maestra no configurada.");
      return;
    }

    if (password === masterPassword) {
      sessionStorage.setItem(MASTER_PASSWORD_KEY, "true");
      setIsUnlocked(true);
      setError(null);
      setPassword("");
      return;
    }

    setError("Contraseña incorrecta. Intenta nuevamente.");
    setPassword("");
  };

  const handleEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const authOptions = {
      redirectURL: `${window.location.origin}/admin`,
      scope: ["openid", "profile", "email"],
      loginHint: email,
      prompt: mode === "signup" ? "create" : "login",
    };

    try {
      if (mode === "signup") {
        await register(authOptions);
        toast.success("Redirigiendo a Kinde para crear tu cuenta...");
      } else {
        await login(authOptions);
        toast.success("Redirigiendo a Kinde para iniciar sesión...");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de autenticación");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await login({
        redirectURL: `${window.location.origin}/admin`,
        scope: ["openid", "profile", "email"],
        prompt: "login",
      });
      toast.success("Redirigiendo a Kinde para iniciar sesión...");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error con Kinde");
      setLoading(false);
    }
  };

  if (!masterPassword) {
    return (
      <section className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
        </Link>

        <div className="mt-6 rounded-3xl glass-strong p-8 text-center">
          <h1 className="text-2xl font-semibold">Acceso restringido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            La contraseña maestra no está configurada. Contacta al administrador.
          </p>
        </div>
      </section>
    );
  }

  if (!isUnlocked) {
    return (
      <section className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
        </Link>

        <div className="mt-6 rounded-3xl glass-strong p-8">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Acceso privado
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em]">Contraseña maestra</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa la contraseña maestra para continuar con el acceso a Kinde.
          </p>
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full h-11 rounded-full glass px-4 text-sm outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10"
                autoFocus
              />
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition"
            >
              Confirmar contraseña
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
      </Link>

      <div className="mt-6 relative overflow-hidden rounded-3xl glass-strong p-8 noise">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-violet/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Panel privado
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em]">
            {mode === "signin" ? (
              <span className="text-gradient">Inicia sesión</span>
            ) : (
              <span className="text-gradient">Crear cuenta</span>
            )}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Accede al panel de administración."
              : "El primer usuario en registrarse recibirá rol admin automáticamente."}
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-60 transition"
          >
            <LogIn className="h-4 w-4" /> Continuar con Kinde
          </button>

          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> o <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full h-11 rounded-full glass px-4 text-sm outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-(--gradient-brand) text-white text-sm font-medium hover:opacity-95 disabled:opacity-60 transition shadow-glow"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Entrar con Kinde" : "Crear cuenta con Kinde"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            {mode === "signin"
              ? "¿No tienes cuenta? Regístrate"
              : "Ya tengo cuenta — iniciar sesión"}
          </button>
        </div>
      </div>
    </section>
  );
}
