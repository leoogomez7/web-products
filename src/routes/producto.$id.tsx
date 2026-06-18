import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, MessageCircle, Share2, Loader2 } from "lucide-react";
import { useCategories, useProduct, useProducts, useSiteSettings, buildWhatsappUrl } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/producto/$id")({
  head: () => ({
    meta: [{ title: "Producto — Revendedor digital" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-32 text-center">
      <h1 className="text-3xl font-semibold">Producto no encontrado</h1>
      <Link to="/catalogo" className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-32 text-center">
      <h1 className="text-2xl font-semibold">No se pudo cargar el producto</h1>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: categories = [] } = useCategories();
  const { data: allProducts = [] } = useProducts();
  const { data: settings } = useSiteSettings();

  if (isLoading) {
    return (
      <div className="py-40 flex justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!product) throw notFound();

  const cat = categories.find((c) => c.id === product.categoryId);
  const related = allProducts.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 3);
  const wa = buildWhatsappUrl(settings, product.title);

  return (
    <article className="relative">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[480px] -z-10 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-30 blur-3xl`} />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,transparent_0%,#07070A_75%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <Link to="/catalogo" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al catálogo
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="lg:sticky lg:top-24 animate-scale-in">
            <div className="relative aspect-square overflow-hidden rounded-3xl glass shadow-card">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient}`} />
                  <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(255,255,255,0.35),transparent_55%)] mix-blend-overlay" />
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="text-[140px] font-bold tracking-tight text-white/95 drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                      {product.glyph}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="animate-fade-up">
            {cat && (
              <Link
                to="/catalogo"
                search={{ cat: cat.slug }}
                className="inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                {cat.name}
              </Link>
            )}
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-[-0.03em]">{product.title}</h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">{product.longDescription}</p>

            <div className="mt-8 grid grid-cols-2 gap-2">
              {product.features.map((f: string) => (
                <div key={f} className="flex items-start gap-2 rounded-xl glass px-3 py-2.5 text-sm">
                  <Check className="h-4 w-4 mt-0.5 text-cyan shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-glow"
                >
                  <MessageCircle className="h-4 w-4" />
                  Consultar por WhatsApp
                </a>
              ) : (
                <Link
                  to="/contacto"
                  search={{ producto: product.title }}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-glow"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contactar por este producto
                </Link>
              )}
              <button
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: product.title, text: product.description, url: window.location.href });
                    } else {
                      await navigator.clipboard.writeText(window.location.href);
                    }
                  } catch {}
                }}
                className="inline-flex items-center gap-2 h-12 px-5 rounded-full glass text-sm font-medium hover:border-white/20 transition"
              >
                <Share2 className="h-4 w-4" /> Compartir
              </button>
            </div>

            <div className="mt-8 text-xs text-muted-foreground">
              Publicado el {new Date(product.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-32">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Productos relacionados</h2>
              <Link to="/catalogo" className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                Ver más <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
