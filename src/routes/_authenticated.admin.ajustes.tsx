import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2, MessageCircle } from "lucide-react";
import { useSiteSettings, siteSettingsQuery } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/ajustes")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const { data: settings, isLoading } = useSiteSettings();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ brand_name: "", whatsapp_number: "", whatsapp_message: "", tagline: "" });

  useEffect(() => {
    if (settings) {
      setForm({
        brand_name: settings.brandName,
        whatsapp_number: settings.whatsappNumber,
        whatsapp_message: settings.whatsappMessage,
        tagline: settings.tagline,
      });
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update(form).eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQuery.queryKey });
      toast.success("Ajustes guardados");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  if (isLoading) return <div className="py-12 flex justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Configuración</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]"><span className="text-gradient">Ajustes del sitio</span></h1>
      </header>

      <div className="rounded-2xl glass p-6 space-y-4">
        <Field label="Nombre de la marca">
          <input value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} className="input" />
        </Field>
        <Field label="Tagline">
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="input" />
        </Field>

        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-4 w-4 text-emerald-300" />
            <div className="text-sm font-medium">WhatsApp</div>
          </div>
          <Field label="Número (con código de país, sin + ni espacios)">
            <input
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value.replace(/[^0-9]/g, "") })}
              placeholder="5491123456789"
              className="input"
            />
          </Field>
          <Field label="Mensaje pre-rellenado">
            <input
              value={form.whatsapp_message}
              onChange={(e) => setForm({ ...form, whatsapp_message: e.target.value })}
              placeholder="Hola, me interesa este producto:"
              className="input"
            />
          </Field>
          {form.whatsapp_number && (
            <a
              href={`https://wa.me/${form.whatsapp_number}?text=${encodeURIComponent(form.whatsapp_message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200"
            >
              Probar enlace →
            </a>
          )}
        </div>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 shadow-glow disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar cambios
        </button>
      </div>

      <style>{`
        .input { width: 100%; height: 2.5rem; padding: 0 0.875rem; border-radius: 0.75rem; background: rgba(255,255,255,0.04); border: 1px solid hsl(var(--border)); color: inherit; font-size: 0.875rem; outline: none; }
        .input:focus { border-color: rgba(255,255,255,0.25); box-shadow: 0 0 0 3px rgba(255,255,255,0.06); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
