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

  const sampleProducts = [
    {
      id: "sample-product-1",
      title: "Producto de prueba 1",
      description: "Descripción de producto de ejemplo.",
      longDescription: "Este producto de muestra ayuda a visualizar el catálogo.",
      categoryId: "sample-category-1",
      gradient: "from-indigo-500/30 via-violet-500/20 to-cyan-400/20",
      glyph: "PR1",
      imageUrl: null,
      features: ["Envío rápido", "Soporte incluido"],
      visible: true,
      featured: false,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-product-2",
      title: "Producto de prueba 2",
      description: "Otro producto de ejemplo para completar la colección.",
      longDescription: "Un segundo producto de demostración para mostrar el contenido.",
      categoryId: "sample-category-2",
      gradient: "from-sky-500/30 via-blue-500/20 to-indigo-500/20",
      glyph: "PR2",
      imageUrl: null,
      features: ["Diseño moderno", "Fácil de personalizar"],
      visible: true,
      featured: false,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleCategories = [
    {
      id: "sample-category-1",
      name: "Categoría de prueba 1",
      slug: "categoria-de-prueba-1",
      description: "Colección de ejemplo para empezar a explorar.",
      gradient: "from-cyan-500/20 via-sky-500/15 to-blue-500/20",
      sortOrder: 0,
    },
    {
      id: "sample-category-2",
      name: "Categoría de prueba 2",
      slug: "categoria-de-prueba-2",
      description: "Otra colección de ejemplo con productos de demostración.",
      gradient: "from-violet-500/20 via-fuchsia-500/15 to-pink-500/20",
      sortOrder: 1,
    },
  ];

  const showSampleCategories = categories.length === 0;
  const displayCategories = showSampleCategories ? sampleCategories : categories;
  const productCountSource = products.length === 0 ? sampleProducts : products;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-fade-up">Colecciones</div>
      <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-[-0.03em] animate-fade-up">
        <span className="text-gradient">Categorías</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground animate-fade-up">Encuentra exactamente lo que buscas explorando por colección.</p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        {displayCategories.map((c) => {
          const count = productCountSource.filter((p) => p.categoryId === c.id).length;
          return (
            <Link
              key={c.id}
              to="/catalogo"
              search={{ cat: c.slug }}
              className="card-spot group relative overflow-hidden rounded-2xl glass shadow-card aspect-4/5"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${c.gradient} transition-transform duration-700 group-hover:scale-110`} />
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
              <div className="relative z-2 h-full flex flex-col p-6">
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
