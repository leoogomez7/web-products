import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, X, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { sampleCategories, sampleProducts, useCategories, useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { CategoryChips } from "@/components/site/CategoryChips";

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catálogo — Revendedor digital" },
      { name: "description", content: "Explora todos nuestros servicios digitales premium con búsqueda y filtros en tiempo real." },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { q: qParam, cat: catParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/catalogo" });
  const [query, setQuery] = useState(qParam ?? "");
  const [cat, setCat] = useState<string | null>(catParam ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      navigate({
        search: { q: query || undefined, cat: cat ?? undefined },
        replace: true,
      });
    }, 250);
    return () => clearTimeout(t);
  }, [query, cat, navigate]);

  const categoriesForFilter = categories.length > 0 ? categories : sampleCategories;
  const sourceProducts = products.length === 0 ? sampleProducts : products;
  const [order, setOrder] = useState<"none" | "price-asc" | "price-desc" | "title-asc" | "title-desc">("none");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return sourceProducts.filter((p) => {
      if (cat) {
        const c = categoriesForFilter.find((c) => c.slug === cat || c.id === cat);
        if (!c || p.categoryId !== c.id) return false;
      }
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (categoriesForFilter.find((c) => c.id === p.categoryId)?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, cat, sourceProducts, categoriesForFilter]);

  const displayProducts = useMemo(() => {
    const sorted = [...filtered];
    switch (order) {
      case "price-asc":
        return sorted.sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
      case "price-desc":
        return sorted.sort((a, b) => (b.price ?? Number.NEGATIVE_INFINITY) - (a.price ?? Number.NEGATIVE_INFINITY));
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }));
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title, "es", { sensitivity: "base" }));
      default:
        return sorted;
    }
  }, [filtered, order]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20">
      <div className="flex flex-col gap-4 animate-fade-up">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catálogo</div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em]">
          <span className="text-gradient">Todos los productos</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Busca por nombre, descripción o categoría. Resultados en tiempo real.
        </p>
      </div>

      <div className="mt-10 sticky top-16 z-30 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/60 border-y border-border">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <label className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto, categoría o descripción…"
              className="w-full h-12 pl-11 pr-10 rounded-full glass text-sm placeholder:text-muted-foreground/70 outline-none transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Limpiar"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full hover:bg-white/10 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              <CategoryChips value={cat} onChange={setCat} />
            </div>
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Orden
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as any)}
                className="h-10 rounded-full bg-background border border-border px-3 text-sm outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
              >
                <option value="none">Predeterminado</option>
                <option value="price-desc">Mayor precio</option>
                <option value="price-asc">Menor precio</option>
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {isLoading ? "Cargando…" : `${displayProducts.length} producto${displayProducts.length === 1 ? "" : "s"}/servicio${displayProducts.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-20 flex justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : displayProducts.length > 0 ? (
        <div key={query + (cat ?? "")} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} highlight={query} />
          ))}
        </div>
      ) : (
        <EmptyState query={query} onClear={() => { setQuery(""); setCat(null); }} />
      )}
    </section>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center text-center py-20 rounded-3xl glass">
      <div className="h-14 w-14 rounded-2xl bg-white/5 grid place-items-center">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">Sin resultados</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        No encontramos productos {query ? <>para "<span className="text-foreground">{query}</span>"</> : "con esos filtros"}. Prueba con otra palabra o limpia los filtros.
      </p>
      <button onClick={onClear} className="mt-5 inline-flex items-center h-9 px-4 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90">
        Limpiar filtros
      </button>
    </div>
  );
}
