import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import auroraHero from "@/assets/aurora-hero.jpg";

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
            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.02] animate-fade-up">
              Catálogo
            </h1>

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
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full glass-strong text-sm font-medium hover:border-white/20 transition-all"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
