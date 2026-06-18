import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Eye, EyeOff, Trash2, Pencil, Loader2 } from "lucide-react";
import { useProducts, useCategories, productsQuery } from "@/lib/catalog";
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catálogo</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]"><span className="text-gradient">Productos</span></h1>
        </div>
        <Link
          to="/admin/productos/nuevo"
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
          {filtered.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Sin productos.</div>}
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`h-11 w-11 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br ${p.gradient} grid place-items-center text-white text-xs font-bold`}>
                {p.imageUrl ? <img src={p.imageUrl} className="h-full w-full object-cover" /> : p.glyph}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  {!p.visible && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">Oculto</span>}
                </div>
                <div className="text-xs text-muted-foreground truncate">{categories.find((c) => c.id === p.categoryId)?.name ?? p.categoryId}</div>
              </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
