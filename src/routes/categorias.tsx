import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCategories, useProducts } from "@/lib/catalog";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorías — Revendedor digital" },
      { name: "description", content: "Explora todas las categorías de nuestro catálogo digital." },
    ],
  }),
  component: Categorias,
});

function Categorias() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-fade-up">Colecciones</div>
      <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-[-0.03em] animate-fade-up">
        <span className="text-gradient">Categorías</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground animate-fade-up">Encuentra exactamente lo que buscas explorando por colección.</p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <Link
              key={c.id}
              to="/catalogo"
              search={{ cat: c.slug }}
              className="card-spot group relative overflow-hidden rounded-2xl glass shadow-card aspect-[4/5]"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} transition-transform duration-700 group-hover:scale-110`} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="relative z-[2] h-full flex flex-col p-6">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{count} productos</div>
                <div className="mt-auto">
                  <div className="text-2xl font-semibold tracking-tight">{c.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs text-foreground/90">
                    Explorar <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
