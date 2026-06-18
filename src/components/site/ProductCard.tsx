import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { useCategories, type Product } from "@/lib/catalog";

export function ProductCard({ product, highlight }: { product: Product; highlight?: string }) {
  const { data: categories = [] } = useCategories();
  const cat = categories.find((c) => c.id === product.categoryId);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      onMouseMove={onMove}
      className="card-spot group relative overflow-hidden rounded-2xl glass shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
    >
      {/* Visual */}
      <div className="relative aspect-5/4 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <>
            <div className={`absolute inset-0 bg-linear-to-br ${product.gradient} opacity-90 transition-transform duration-700 group-hover:scale-110`} />
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(255,255,255,0.35),transparent_55%)] mix-blend-overlay" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-6xl font-bold tracking-tight text-white/95 drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-105">
                {product.glyph}
              </span>
            </div>
          </>
        )}
        {cat && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/90 ring-1 ring-white/15">
              {cat.name}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="relative p-5 z-2">
        <h3 className="text-base font-semibold tracking-tight">
          <Highlight text={product.title} term={highlight} />
        </h3>
        {product.price != null ? (
          <div className="mt-1 text-sm font-semibold text-foreground">
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: product.currency ?? "ARS",
            }).format(product.price)}
          </div>
        ) : null}
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          <Highlight text={product.description} term={highlight} />
        </p>

        <div className="mt-5 flex items-center gap-2">
          <Link
            to="/producto/$id"
            params={{ id: product.id }}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium bg-white text-black hover:bg-white/90 transition-colors"
          >
            Ver detalles <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/contacto"
            search={{ producto: product.title }}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium border border-border bg-white/5 hover:bg-white/10 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Contactar
          </Link>
        </div>
      </div>
    </div>
  );
}

function Highlight({ text, term }: { text: string; term?: string }) {
  if (!term) return <>{text}</>;
  const t = term.trim();
  if (!t) return <>{text}</>;
  const i = text.toLowerCase().indexOf(t.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent text-cyan rounded px-0.5" style={{ color: "oklch(0.85 0.16 210)" }}>
        {text.slice(i, i + t.length)}
      </mark>
      {text.slice(i + t.length)}
    </>
  );
}
