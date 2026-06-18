import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Eye, EyeOff, Trash2, Pencil, Loader2 } from "lucide-react";
import { type Product, useProducts, useCategories, productsQuery } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/productos/")({
  component: ProductsList,
});

function ProductsList() {
  const { data: products = [], isLoading } = useProducts({ includeHidden: true });
  const { data: categories = [] } = useCategories();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const toggleVisible = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase.from("products").update({ visible }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQuery().queryKey.slice(0, 1) });
      toast.success("Producto actualizado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQuery().queryKey.slice(0, 1) });
      toast.success("Producto eliminado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const filtered = products.filter((p) =>
    !q ? true : p.title.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()),
  );

  const sampleProducts: Product[] = [
    {
      id: "sample-product-1",
      title: "Producto de prueba 1",
      description: "Descripción del primer producto de ejemplo.",
      longDescription: "Este producto es un ejemplo para mostrar cómo se ve la lista.",
      categoryId: "sample-category-1",
      gradient: "from-indigo-500/30 via-violet-500/20 to-cyan-400/20",
      glyph: "PR1",
      imageUrl: null,
      price: 0,
      currency: "ARS",
      features: ["Entrega inmediata", "Soporte incluido"],
      visible: true,
      featured: false,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-product-2",
      title: "Producto de prueba 2",
      description: "Descripción del segundo producto de ejemplo.",
      longDescription: "Este producto te ayuda a ver la estructura de la tarjeta.",
      categoryId: "sample-category-2",
      gradient: "from-sky-500/30 via-blue-500/20 to-indigo-500/20",
      glyph: "PR2",
      imageUrl: null,
      price: 0,
      currency: "ARS",
      features: ["Instalación rápida", "Garantía incluida"],
      visible: true,
      featured: false,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleCategoryNames: Record<string, string> = {
    "sample-category-1": "Categoría de prueba 1",
    "sample-category-2": "Categoría de prueba 2",
  };

  const showSampleProducts = products.length === 0 && q.trim() === "";
  const displayProducts = showSampleProducts ? sampleProducts : filtered;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catálogo</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]"><span className="text-gradient">Productos</span></h1>
        </div>
        <Link
          to="/admin/productos/$id"
          params={{ id: "nuevo" }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 shadow-glow"
        >
          <Plus className="h-4 w-4" /> Nuevo
        </Link>
      </header>

      <label className="relative block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título o ID…"
          className="w-full h-11 pl-11 pr-4 rounded-full glass text-sm outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10"
        />
      </label>

      {isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="rounded-2xl glass divide-y divide-border overflow-hidden">
          {displayProducts.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Sin productos.</div>}
          {displayProducts.map((p) => {
            const sample = showSampleProducts;
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`h-11 w-11 rounded-lg overflow-hidden shrink-0 .bg-linear-to-br ${p.gradient} grid place-items-center text-white text-xs font-bold`}>
                  {p.imageUrl ? <img src={p.imageUrl} className="h-full w-full object-cover" /> : p.glyph}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate">{p.title}</div>
                    {sample ? (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">Ejemplo</span>
                    ) : !p.visible ? (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">Oculto</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{categories.find((c) => c.id === p.categoryId)?.name ?? p.categoryId}</div>
                </div>
                {!sample ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleVisible.mutate({ id: p.id, visible: !p.visible })}
                      title={p.visible ? "Ocultar" : "Mostrar"}
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    >
                      {p.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <Link
                      to="/admin/productos/$id"
                      params={{ id: p.id }}
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${p.title}"? Esta acción no se puede deshacer.`)) remove.mutate(p.id);
                      }}
                      title="Eliminar"
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
