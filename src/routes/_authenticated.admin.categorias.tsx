import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Save, Loader2, X } from "lucide-react";
import { useCategories, categoriesQuery, useProducts } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  component: CategoriesAdmin,
});

const GRADIENTS = [
  "from-indigo-500/30 via-violet-500/20 to-cyan-400/20",
  "from-sky-500/30 via-blue-500/20 to-indigo-500/20",
  "from-rose-500/30 via-red-500/20 to-orange-400/20",
  "from-emerald-500/30 via-green-500/20 to-teal-400/20",
  "from-fuchsia-500/30 via-purple-500/20 to-indigo-500/20",
  "from-orange-500/30 via-amber-500/20 to-yellow-400/20",
];

function CategoriesAdmin() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts({ includeHidden: true });
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: categoriesQuery.queryKey });

  const update = useMutation({
    mutationFn: async (c: { id: string; name: string; description: string; gradient: string; sort_order: number }) => {
      const { error } = await supabase
        .from("categories")
        .update({ name: c.name, description: c.description, gradient: c.gradient, sort_order: c.sort_order })
        .eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Guardado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Categoría eliminada"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "No se puede eliminar (tiene productos)"),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catálogo</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]"><span className="text-gradient">Categorías</span></h1>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 shadow-glow"
        >
          <Plus className="h-4 w-4" /> Nueva categoría
        </button>
      </header>

      {showNew && <NewCategoryCard onClose={() => setShowNew(false)} onSaved={invalidate} />}

      {isLoading ? (
        <div className="py-12 flex justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              count={products.filter((p) => p.categoryId === c.id).length}
              onSave={(payload) => update.mutate(payload)}
              onDelete={() => remove.mutate(c.id)}
              gradients={GRADIENTS}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category, count, onSave, onDelete, gradients,
}: {
  category: { id: string; name: string; description: string; gradient: string; sortOrder: number };
  count: number;
  onSave: (p: { id: string; name: string; description: string; gradient: string; sort_order: number }) => void;
  onDelete: () => void;
  gradients: string[];
}) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [gradient, setGradient] = useState(category.gradient);
  const [sortOrder, setSortOrder] = useState(category.sortOrder);

  return (
    <div className="rounded-2xl glass overflow-hidden">
      <div className={`h-20 bg-gradient-to-br ${gradient}`} />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{category.id} · {count} producto{count === 1 ? "" : "s"}</div>
        </div>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
        <textarea rows={2} className="input resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" />
        <div className="grid grid-cols-6 gap-1.5">
          {gradients.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGradient(g)}
              className={`h-7 rounded-md bg-gradient-to-br ${g} ring-2 transition ${gradient === g ? "ring-white" : "ring-transparent"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="input w-24"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
          <button
            onClick={() => onSave({ id: category.id, name, description, gradient, sort_order: sortOrder })}
            className="ml-auto inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90"
          >
            <Save className="h-3.5 w-3.5" /> Guardar
          </button>
          <button
            onClick={() => { if (count === 0 && confirm(`¿Eliminar "${category.name}"?`)) onDelete(); else if (count > 0) toast.error("Mueve los productos primero"); }}
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-rose-500/10 text-muted-foreground hover:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <style>{`
        .input { width: 100%; height: 2.25rem; padding: 0 0.75rem; border-radius: 0.625rem; background: rgba(255,255,255,0.04); border: 1px solid hsl(var(--border)); color: inherit; font-size: 0.85rem; outline: none; }
        textarea.input { height: auto; padding: 0.5rem 0.75rem; line-height: 1.45; }
        .input:focus { border-color: rgba(255,255,255,0.25); box-shadow: 0 0 0 3px rgba(255,255,255,0.06); }
      `}</style>
    </div>
  );
}

function NewCategoryCard({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!id.trim() || !name.trim()) return toast.error("ID y nombre son obligatorios");
    setSaving(true);
    const { error } = await supabase.from("categories").insert({
      id: id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      slug: id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      name,
      description,
      gradient,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Categoría creada");
    onSaved();
    onClose();
  };

  return (
    <div className="rounded-2xl glass-strong p-5 space-y-3 relative">
      <button onClick={onClose} className="absolute top-3 right-3 h-7 w-7 grid place-items-center rounded-full hover:bg-white/10"><X className="h-3.5 w-3.5" /></button>
      <div className="text-sm font-semibold">Nueva categoría</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="input" placeholder="ID (slug)" value={id} onChange={(e) => setId(e.target.value)} />
        <input className="input" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <textarea className="input resize-none" rows={2} placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="grid grid-cols-6 gap-1.5">
        {GRADIENTS.map((g) => (
          <button key={g} type="button" onClick={() => setGradient(g)} className={`h-7 rounded-md bg-gradient-to-br ${g} ring-2 transition ${gradient === g ? "ring-white" : "ring-transparent"}`} />
        ))}
      </div>
      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Crear
      </button>
      <style>{`
        .input { width: 100%; height: 2.25rem; padding: 0 0.75rem; border-radius: 0.625rem; background: rgba(255,255,255,0.04); border: 1px solid hsl(var(--border)); color: inherit; font-size: 0.85rem; outline: none; }
        textarea.input { height: auto; padding: 0.5rem 0.75rem; line-height: 1.45; }
        .input:focus { border-color: rgba(255,255,255,0.25); box-shadow: 0 0 0 3px rgba(255,255,255,0.06); }
      `}</style>
    </div>
  );
}
