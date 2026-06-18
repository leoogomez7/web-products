import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ImagePlus, Loader2, Save, Trash2, X } from "lucide-react";
import { useCategories, useProduct, productsQuery, productQuery } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadProductImage, deleteProductImageByUrl } from "@/lib/storage";

type Mode = "create" | "edit";

const GRADIENTS = [
  "from-indigo-500 via-violet-600 to-fuchsia-600",
  "from-sky-500 via-blue-600 to-indigo-700",
  "from-rose-500 via-red-600 to-orange-600",
  "from-emerald-400 via-green-500 to-teal-600",
  "from-blue-500 via-indigo-600 to-violet-700",
  "from-purple-500 via-fuchsia-600 to-pink-600",
  "from-orange-500 via-rose-500 to-red-600",
  "from-violet-500 via-purple-600 to-indigo-700",
];

export const Route = createFileRoute("/_authenticated/admin/productos/$id")({
  component: ProductEdit,
});

function ProductEdit() {
  const { id } = Route.useParams();
  const mode: Mode = id === "nuevo" ? "create" : "edit";
  const { data: existing, isLoading: loadingProduct } = useProduct(mode === "edit" ? id : "");
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    long_description: "",
    category_id: "",
    gradient: GRADIENTS[0],
    glyph: "★",
    image_url: null as string | null,
    features: "",
    visible: true,
    featured: false,
    sort_order: 0,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && existing) {
      setForm({
        id: existing.id,
        title: existing.title,
        description: existing.description,
        long_description: existing.longDescription,
        category_id: existing.categoryId,
        gradient: existing.gradient,
        glyph: existing.glyph,
        image_url: existing.imageUrl,
        features: existing.features.join("\n"),
        visible: existing.visible,
        featured: existing.featured,
        sort_order: existing.sortOrder,
      });
    } else if (mode === "create" && categories.length > 0 && !form.category_id) {
      setForm((f) => ({ ...f, category_id: categories[0].id }));
    }
  }, [existing, mode, categories]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        id: form.id.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        long_description: form.long_description.trim(),
        category_id: form.category_id,
        gradient: form.gradient,
        glyph: form.glyph.trim() || "★",
        image_url: form.image_url,
        features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
        visible: form.visible,
        featured: form.featured,
        sort_order: Number(form.sort_order) || 0,
      };
      if (!payload.id || !payload.title || !payload.category_id) {
        throw new Error("ID, título y categoría son obligatorios");
      }
      if (mode === "create") {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      } else {
        const { id: _id, ...update } = payload;
        const { error } = await supabase.from("products").update(update).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQuery().queryKey.slice(0, 1) });
      queryClient.invalidateQueries({ queryKey: productQuery(id).queryKey });
      toast.success("Guardado");
      navigate({ to: "/admin/productos" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al guardar"),
  });

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      if (form.image_url) await deleteProductImageByUrl(form.image_url);
      const { url } = await uploadProductImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Imagen subida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error subiendo imagen");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!form.image_url) return;
    try {
      await deleteProductImageByUrl(form.image_url);
    } catch {}
    setForm((f) => ({ ...f, image_url: null }));
  };

  if (mode === "edit" && loadingProduct) {
    return <div className="py-20 flex justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }
  if (mode === "edit" && !existing) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold">Producto no encontrado</h2>
        <Link to="/admin/productos" className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/productos" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Productos
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
            <span className="text-gradient">{mode === "create" ? "Nuevo producto" : form.title || "Editar"}</span>
          </h1>
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 shadow-glow disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main form */}
        <div className="space-y-5">
          <div className="rounded-2xl glass p-5 space-y-4">
            <Field label="ID (slug único)" disabled={mode === "edit"}>
              <input
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                disabled={mode === "edit"}
                placeholder="ej. netflix-premium-4k"
                className="input"
              />
            </Field>
            <Field label="Título">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input" />
            </Field>
            <Field label="Descripción corta">
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input" />
            </Field>
            <Field label="Descripción larga">
              <textarea
                value={form.long_description}
                onChange={(e) => setForm((f) => ({ ...f, long_description: e.target.value }))}
                rows={5}
                className="input resize-none"
              />
            </Field>
            <Field label="Características (una por línea)">
              <textarea
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                rows={4}
                className="input resize-none"
                placeholder={"Ultra HD 4K\nHDR + Dolby\nSoporte 24/7"}
              />
            </Field>
          </div>
        </div>

        {/* Side */}
        <aside className="space-y-5">
          <div className="rounded-2xl glass p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Imagen</div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className={`relative aspect-square rounded-2xl overflow-hidden border border-dashed border-border bg-gradient-to-br ${form.gradient}`}
            >
              {form.image_url ? (
                <img src={form.image_url} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="text-5xl font-bold text-white/95">{form.glyph}</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 grid place-items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => fileRef.current?.click()} className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-full glass text-xs hover:border-white/20">
                <ImagePlus className="h-3.5 w-3.5" /> {form.image_url ? "Cambiar" : "Subir"}
              </button>
              {form.image_url && (
                <button onClick={removeImage} className="h-9 w-9 grid place-items-center rounded-full glass hover:border-rose-300/30 text-rose-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Si no subes imagen, se mostrará el glyph sobre el gradiente.</p>
          </div>

          <div className="rounded-2xl glass p-5 space-y-4">
            <Field label="Categoría">
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="input"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-background">{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Glyph (1-4 caracteres)">
              <input
                value={form.glyph}
                maxLength={4}
                onChange={(e) => setForm((f) => ({ ...f, glyph: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Gradiente">
              <div className="grid grid-cols-4 gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, gradient: g }))}
                    className={`h-10 rounded-lg bg-gradient-to-br ${g} ring-2 transition ${form.gradient === g ? "ring-white" : "ring-transparent"}`}
                  />
                ))}
              </div>
            </Field>
            <Field label="Orden (menor = primero)">
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                className="input"
              />
            </Field>
            <Toggle label="Visible" value={form.visible} onChange={(v) => setForm((f) => ({ ...f, visible: v }))} />
            <Toggle label="Destacado" value={form.featured} onChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
          </div>

          {mode === "edit" && (
            <button
              onClick={async () => {
                if (!confirm("¿Eliminar este producto definitivamente?")) return;
                if (form.image_url) await deleteProductImageByUrl(form.image_url);
                const { error } = await supabase.from("products").delete().eq("id", id);
                if (error) return toast.error(error.message);
                queryClient.invalidateQueries({ queryKey: productsQuery().queryKey.slice(0, 1) });
                toast.success("Eliminado");
                navigate({ to: "/admin/productos" });
              }}
              className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-full glass text-sm text-rose-300 hover:border-rose-300/30"
            >
              <Trash2 className="h-4 w-4" /> Eliminar producto
            </button>
          )}
        </aside>
      </div>

      <style>{`
        .input {
          width: 100%;
          height: 2.5rem;
          padding: 0 0.875rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid hsl(var(--border));
          color: inherit;
          font-size: 0.875rem;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        textarea.input { height: auto; padding: 0.75rem 0.875rem; line-height: 1.5; }
        select.input { appearance: none; }
        .input:focus { border-color: rgba(255,255,255,0.25); box-shadow: 0 0 0 3px rgba(255,255,255,0.06); }
      `}</style>
    </div>
  );
}

function Field({ label, children, disabled }: { label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <label className={`block ${disabled ? "opacity-70" : ""}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 bg-white/5 hover:bg-white/10 transition"
    >
      <span className="text-sm">{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition ${value ? "bg-emerald-400" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
