import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Clock, Loader2 } from "lucide-react";
import auroraHero from "@/assets/aurora-hero.jpg";
import { useCategories, useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Revendedor digital — Servicios digitales premium" },
      { name: "description", content: "Descubre nuestro catálogo curado de servicios digitales: PS Plus, Netflix, Spotify y más." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const featured = products.slice(0, 6);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={auroraHero}
            alt=""
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover opacity-60 animate-aurora"
          />
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,transparent_0%,#07070A_75%)]" />
          <div className="absolute inset-0 bg-aurora opacity-60" />
        </div>

        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet/30 blur-3xl animate-float" />
        <div aria-hidden className="pointer-events-none absolute top-10 right-0 h-80 w-80 rounded-full bg-cyan/20 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-28 lg:pt-32 lg:pb-36">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground animate-fade-in">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
              Catálogo actualizado — Junio 2026
            </span>

            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.02] animate-fade-up">
              <span className="text-gradient">Descubre productos</span>
              <br />
              <span className="text-gradient-brand">únicos</span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Explora nuestro catálogo cuidadosamente seleccionado de servicios
              digitales premium. Entrega inmediata, calidad garantizada.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Link
                to="/catalogo"
                className="group relative inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-black text-sm font-medium overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-glow"
              >
                Explorar catálogo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/categorias"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full glass-strong text-sm font-medium hover:border-white/20 transition-all"
              >
                Ver categorías
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 sm:gap-10 stagger-children">
              {[
                { icon: Sparkles, value: (products.length || "—") + "+", label: "Productos" },
                { icon: Zap, value: "<5 min", label: "Entrega" },
                { icon: ShieldCheck, value: "100%", label: "Garantía" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <s.icon className="h-4 w-4 mx-auto text-muted-foreground" />
                  <div className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Categorías</div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Explora por colección</h2>
          </div>
          <Link to="/categorias" className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/catalogo"
              search={{ cat: c.slug }}
              className="card-spot group relative overflow-hidden rounded-2xl glass shadow-card aspect-[4/3] sm:aspect-[16/10]"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} transition-transform duration-700 group-hover:scale-110`} />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
              <div className="relative z-[2] h-full flex flex-col justify-end p-6">
                <div className="text-lg font-semibold tracking-tight">{c.name}</div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs text-foreground/80">
                  Ver productos <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Destacados</div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Productos más solicitados</h2>
          </div>
          <Link to="/catalogo" className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ver catálogo completo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl glass-strong noise p-10 lg:p-16">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-violet/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-cyan/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                <span className="text-gradient">Una experiencia premium</span><br />
                <span className="text-gradient-brand">en cada detalle.</span>
              </h3>
              <p className="mt-5 text-muted-foreground max-w-lg">
                Curamos cada producto, verificamos cada cuenta y respondemos en
                minutos. No vendemos catálogos — entregamos confianza.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/contacto" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition">
                  Hablar con nosotros <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, title: "Entrega instantánea", text: "La mayoría de pedidos se entregan en menos de 5 minutos." },
                { icon: ShieldCheck, title: "Garantía total", text: "Reposición inmediata si algo falla durante la suscripción." },
                { icon: Clock, title: "Soporte 24/7", text: "Atención humana cualquier día, a cualquier hora." },
                { icon: Sparkles, title: "Curaduría premium", text: "Solo proveedores verificados y fuentes de confianza." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl glass p-5">
                  <f.icon className="h-4 w-4 text-cyan" />
                  <div className="mt-3 text-sm font-semibold">{f.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{f.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
