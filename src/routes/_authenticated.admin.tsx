import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LayoutDashboard, Package, FolderTree, Settings, LogOut, ExternalLink } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Panel — Revendedor digital" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

const items: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/productos/", label: "Productos", icon: Package },
  { to: "/admin/categorias", label: "Categorías", icon: FolderTree },
  { to: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, login, isAuthenticated } = useKindeAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const masterPassword = import.meta.env.VITE_MASTER_PASSWORD;

  const isTestMode = isUnlocked && !isAuthenticated;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("admin_password_verified");
    const unlocked = stored === "true";
    if (unlocked) {
      setIsUnlocked(true);
      return;
    }

    if (isAuthenticated) {
      sessionStorage.setItem("admin_password_verified", "true");
      setIsUnlocked(true);
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!masterPassword) {
      setError("Contraseña maestra no configurada.");
      return;
    }

    if (password === masterPassword) {
      sessionStorage.setItem("admin_password_verified", "true");
      setIsUnlocked(true);
      setError(null);
      setPassword("");
      return;
    }

    setError("Contraseña incorrecta. Intenta nuevamente.");
    setPassword("");
  };

  if (!masterPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-3xl glass p-8 text-center">
          <h1 className="text-xl font-semibold">Panel no disponible</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No se ha configurado la contraseña maestra de acceso.
          </p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl glass p-8">
          <h1 className="text-2xl font-semibold">Acceso al panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa la contraseña maestra para continuar.
          </p>
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                autoFocus
              />
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              className="w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-black hover:bg-white/90 transition"
            >
              Confirmar contraseña
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    sessionStorage.removeItem("admin_password_verified");

    try {
      await logout({ redirectUrl: `${window.location.origin}/auth`, allSessions: true });
      toast.success("Sesión cerrada");
      navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cerrar sesión");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl glass p-3">
            <div className="flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>Panel</span>
              {isAuthenticated ? (
                <span className="text-[10px] text-rose-300">Cerrar sesión</span>
              ) : null}
            </div>
            <nav className="mt-1 space-y-0.5">
              {items.map((it) => {
                const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
                return (
                  <button
                    key={it.to}
                    type="button"
                    onClick={async () => {
                      if (!isAuthenticated && !isTestMode) {
                        await login({
                          redirectURL: `${window.location.origin}${it.to}`,
                          scope: ["openid", "profile", "email"],
                          prompt: "login",
                        });
                        return;
                      }

                      navigate({ to: it.to, replace: true });
                    }}
                    className={[
                      "flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm transition-colors",
                      active
                        ? "bg-white/10 text-foreground ring-1 ring-white/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    ].join(" ")}
                  >
                    <it.icon className="h-4 w-4" />
                    {it.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-3 border-t border-border pt-3 space-y-0.5">
              <button
                type="button"
                onClick={() => navigate({ to: "/", replace: true })}
                className="flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                <ExternalLink className="h-4 w-4" /> Ver sitio
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm text-muted-foreground hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
