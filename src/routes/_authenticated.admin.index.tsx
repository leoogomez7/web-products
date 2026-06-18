import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, FolderTree, Eye, EyeOff, Plus, ArrowUpRight } from "lucide-react";
import { useProducts, useCategories } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: products = [] } = useProducts({ includeHidden: true });
  const { data: categories = [] } = useCategories();
  const visible = products.filter((p) => p.visible).length;
  const hidden = products.length - visible;
  const recent = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const stats = [
    { icon: Package, label: "Productos totales", value: products.length },
    { icon: Eye, label: "Visibles", value: visible },
    { icon: EyeOff, label: "Ocultos", value: hidden },
    { icon: FolderTree, label: "Categorías", value: categories.length },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
            <span className="text-gradient">Resumen del catálogo</span>
          </h1>
        </div>
        <Link
          to="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 shadow-glow"
        >
          <Plus className="h-4 w-4" /> Nuevo producto
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl glass p-5">
            <s.icon className="h-4 w-4 text-cyan" />
            <div className="mt-3 text-3xl font-semibold tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold">Últimos productos</h2>
          <Link to="/admin/productos" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            Ver todos <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="rounded-2xl glass divide-y divide-border overflow-hidden">
          {recent.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground text-center">Aún no hay productos.</div>
          )}
          {recent.map((p) => (
            <Link
              key={p.id}
              to="/admin/productos/$id"
              params={{ id: p.id }}
              className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition"
            >
              <div className={`h-10 w-10 rounded-lg overflow-hidden bg-gradient-to-br ${p.gradient} grid place-items-center text-white text-xs font-bold`}>
                {p.imageUrl ? <img src={p.imageUrl} className="h-full w-full object-cover" /> : p.glyph}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground truncate">{categories.find((c) => c.id === p.categoryId)?.name}</div>
              </div>
              <span className={`text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-full ${p.visible ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-muted-foreground"}`}>
                {p.visible ? "Visible" : "Oculto"}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
