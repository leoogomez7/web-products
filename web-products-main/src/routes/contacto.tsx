import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { useSiteSettings, buildWhatsappUrl } from "@/lib/catalog";

export const Route = createFileRoute("/contacto")({
  validateSearch: (s: Record<string, unknown>) => ({
    producto: typeof s.producto === "string" ? s.producto : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contacto — Revendedor digital" },
      { name: "description", content: "Habla con nosotros por WhatsApp. Respondemos en minutos." },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const { producto } = Route.useSearch();
  const { data: settings, isLoading } = useSiteSettings();
  const wa = buildWhatsappUrl(settings, producto);

  // Auto-redirect to WhatsApp once settings load
  useEffect(() => {
    if (wa) {
      const t = setTimeout(() => {
        window.location.href = wa;
      }, 800);
      return () => clearTimeout(t);
    }
  }, [wa]);

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="relative overflow-hidden rounded-3xl glass-strong p-10 lg:p-14 noise text-center">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan/20 blur-3xl" />
        <div className="relative">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-400/15 grid place-items-center">
            <MessageCircle className="h-6 w-6 text-emerald-300" />
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-[-0.03em]">
            <span className="text-gradient">Hablemos por</span>{" "}
            <span className="text-gradient-brand">WhatsApp</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            {producto
              ? <>Te conectamos con un asesor para hablar sobre <span className="text-foreground">{producto}</span>.</>
              : "Te conectamos con un asesor humano. Respondemos en menos de 30 minutos."}
          </p>

          <div className="mt-10">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
            ) : wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-emerald-400 text-black text-sm font-medium hover:bg-emerald-300 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-glow"
              >
                <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
              </a>
            ) : (
              <div className="mx-auto max-w-md rounded-2xl glass p-5 text-left">
                <div className="text-sm font-semibold">WhatsApp aún no configurado</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  El administrador debe configurar el número de WhatsApp desde el panel.
                </p>
                <Link to="/admin/" className="mt-4 inline-flex items-center h-9 px-4 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90">
                  Ir al panel
                </Link>
              </div>
            )}
          </div>

          {wa && (
            <p className="mt-4 text-xs text-muted-foreground">Te redirigimos automáticamente en un segundo…</p>
          )}
        </div>
      </div>
    </section>
  );
}
