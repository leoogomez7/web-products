import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Package, FolderTree, Eye, EyeOff, Plus, ArrowUpRight, Trash2, Sparkles } from "lucide-react";
import { useProducts, useCategories } from "@/lib/catalog";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

type SandboxCategory = {
  id: string;
  name: string;
  slug: string;
};

type SandboxProduct = {
  id: string;
  title: string;
  categoryId: string;
  visible: boolean;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  createdAt: string;
};

const SESSION_SANDBOX_PRODUCTS = "sandbox_products";
const SESSION_SANDBOX_CATEGORIES = "sandbox_categories";

const defaultSandboxCategories: SandboxCategory[] = [
  {
    id: "sandbox-category-1",
    name: "Categoría de prueba 1",
    slug: "categoria-de-prueba-1",
  },
  {
    id: "sandbox-category-2",
    name: "Categoría de prueba 2",
    slug: "categoria-de-prueba-2",
  },
];

const defaultSandboxProducts: SandboxProduct[] = [
  {
    id: "sandbox-product-1",
    title: "Producto de prueba 1",
    categoryId: "sandbox-category-1",
    visible: true,
    description: "Este es un producto temporal para que veas el formato.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sandbox-product-2",
    title: "Producto de prueba 2",
    categoryId: "sandbox-category-2",
    visible: true,
    description: "Otro producto temporal para que puedas explorar la vista.",
    createdAt: new Date().toISOString(),
  },
];

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: products = [] } = useProducts({ includeHidden: true });
  const { data: categories = [] } = useCategories();
  const { isAuthenticated } = useKindeAuth();
  const [sandboxProducts, setSandboxProducts] = useState<SandboxProduct[]>([]);
  const [sandboxCategories, setSandboxCategories] = useState<SandboxCategory[]>([]);
  const [sandboxTitle, setSandboxTitle] = useState("");
  const [sandboxCategory, setSandboxCategory] = useState("");
  const [sandboxDescription, setSandboxDescription] = useState("");
  const [sandboxPrice, setSandboxPrice] = useState("");
  const [sandboxCurrency, setSandboxCurrency] = useState("ARS");
  const [sandboxVisible, setSandboxVisible] = useState(true);
  const [sandboxImageUrl, setSandboxImageUrl] = useState("");
  const [newSandboxCategoryName, setNewSandboxCategoryName] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [activeTestAction, setActiveTestAction] = useState<"product" | "category" | null>(null);
  const productSectionRef = useRef<HTMLDivElement | null>(null);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("admin_password_verified") === "true";
    setIsTestMode(stored && !isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCategories = sessionStorage.getItem(SESSION_SANDBOX_CATEGORIES);
    const savedProducts = sessionStorage.getItem(SESSION_SANDBOX_PRODUCTS);

    if (savedCategories) {
      try {
        setSandboxCategories(JSON.parse(savedCategories));
      } catch {
        setSandboxCategories(defaultSandboxCategories);
      }
    } else {
      setSandboxCategories(defaultSandboxCategories);
    }

    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts) as Array<Partial<SandboxProduct> & { category?: string }>;
        setSandboxProducts(
          parsed.map((product) => ({
            id: product.id ?? `sandbox-${Date.now()}`,
            title: product.title ?? "Producto temporal",
            categoryId:
              product.categoryId ??
              (product.category ? `sandbox-category-${slugify(product.category)}` : defaultSandboxCategories[0]?.id ?? "sandbox-category-1"),
            visible: product.visible ?? true,
            description: product.description,
            imageUrl: product.imageUrl,
            price: product.price,
            currency: product.currency ?? "ARS",
            createdAt: product.createdAt ?? new Date().toISOString(),
          })),
        );
      } catch {
        setSandboxProducts(defaultSandboxProducts);
      }
    } else {
      setSandboxProducts(defaultSandboxProducts);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(SESSION_SANDBOX_CATEGORIES, JSON.stringify(sandboxCategories));
  }, [sandboxCategories]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(SESSION_SANDBOX_PRODUCTS, JSON.stringify(sandboxProducts));
  }, [sandboxProducts]);

  useEffect(() => {
    if (sandboxCategory) return;
    const fallbackCategoryId = categories[0]?.id ?? sandboxCategories[0]?.id;
    if (fallbackCategoryId) {
      setSandboxCategory(fallbackCategoryId);
    }
  }, [categories, sandboxCategories, sandboxCategory]);

  useEffect(() => {
    if (!showPanel || !activeTestAction) return;
    const targetRef = activeTestAction === "product" ? productSectionRef.current : categorySectionRef.current;
    targetRef?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTestAction(null);
  }, [showPanel, activeTestAction]);

  const addSandboxProduct = () => {
    const nextId = `sandbox-${Date.now()}`;
    const fallbackCategoryId = sandboxCategory || categories[0]?.id || sandboxCategories[0]?.id || "sandbox-category-general";
    setSandboxProducts((prev) => [
      ...prev,
      {
        id: nextId,
        title: sandboxTitle || `Producto de prueba ${prev.length + 1}`,
        categoryId: fallbackCategoryId,
        visible: sandboxVisible,
        description: sandboxDescription,
        imageUrl: sandboxImageUrl,
        price: sandboxPrice ? Number(sandboxPrice) : undefined,
        currency: sandboxCurrency,
        createdAt: new Date().toISOString(),
      },
    ]);
    setSandboxTitle("");
    setSandboxDescription("");
    setSandboxPrice("");
    setSandboxCurrency("ARS");
    setSandboxVisible(true);
    setSandboxImageUrl("");
  };

  const updateSandboxProduct = (id: string, changes: Partial<typeof sandboxProducts[number]>) => {
    setSandboxProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...changes } : product)));
  };

  const addSandboxCategory = () => {
    const nextCategoryName = newSandboxCategoryName.trim()
      ? newSandboxCategoryName.trim()
      : `Categoría de prueba ${sandboxCategories.length + 1}`;
    const nextSlug = slugify(nextCategoryName) || `categoria-de-prueba-${sandboxCategories.length + 1}`;
    const nextCategory: SandboxCategory = {
      id: `sandbox-category-${nextSlug}`,
      name: nextCategoryName,
      slug: nextSlug,
    };
    setSandboxCategories((prev) => [...prev, nextCategory]);
    setSandboxCategory(nextCategory.id);
    setNewSandboxCategoryName("");
  };

  const removeSandboxCategory = (categoryId: string) => {
    const nextCategoryId = categories[0]?.id ?? sandboxCategories.find((item) => item.id !== categoryId)?.id ?? "";
    setSandboxCategories((prev) => prev.filter((item) => item.id !== categoryId));
    setSandboxCategory((current) => (current === categoryId ? nextCategoryId : current));
    setSandboxProducts((prev) =>
      prev.map((product) =>
        product.categoryId === categoryId
          ? {
              ...product,
              categoryId: nextCategoryId || product.categoryId,
            }
          : product,
      ),
    );
  };

  useEffect(() => {
    if (categories.length > 0 && !sandboxCategory) {
      setSandboxCategory(categories[0].id);
    }
  }, [categories, sandboxCategory]);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const mergedCategories = [...categories, ...sandboxCategories];
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
      {isTestMode && showTestModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-background p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">Modo de prueba</div>
              </div>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cerrar
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Estás en modo de prueba. Estos cambios solo se guardan en la sesión actual y no afectan la base de datos real.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowTestModal(false);
                  setShowPanel(true);
                  setActiveTestAction(null);
                }}
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-medium text-black hover:bg-white/90"
              >
                Iniciar prueba
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Panel</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
            <span className="text-gradient">Pruebas</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {isTestMode ? (
            <button
              type="button"
              onClick={() => {
                setShowPanel(true);
                setActiveTestAction("product");
              }}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-slate-900 border border-white/10 text-white text-sm font-medium hover:bg-slate-800 shadow-glow"
            >
              <Plus className="h-4 w-4" /> Iniciar prueba
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowPanel(true);
                  setActiveTestAction("product");
                }}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-slate-900 border border-white/10 text-white text-sm font-medium hover:bg-slate-800 shadow-glow"
              >
                <Plus className="h-4 w-4" /> Agregar producto
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPanel(true);
                  setActiveTestAction("category");
                }}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-slate-900/90 border border-white/10 text-white text-sm font-medium hover:bg-slate-800 shadow-glow"
              >
                <Sparkles className="h-4 w-4" /> Agregar categoría
              </button>
            </>
          )}
        </div>
      </header>

      {showPanel && (
        <section ref={panelRef} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-glow">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Panel de prueba</div>
              <div className="text-sm font-semibold">Crea datos temporales</div>
            </div>
          </div>
          <div ref={productSectionRef} className="space-y-6">
            <div className="rounded-3xl border border-cyan-500/20 bg-slate-950/90 p-5 shadow-[0_20px_50px_-30px_rgba(14,165,233,0.18)]">
              <div className="text-xs uppercase tracking-[0.18em] text-cyan-300/80 mb-4">Producto temporal</div>
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-sm">
                  <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Nombre del producto</label>
                  <input
                    value={sandboxTitle}
                    onChange={(e) => setSandboxTitle(e.target.value)}
                    placeholder="Nombre del producto..."
                    className="input bg-slate-950/95 border border-white/10 text-white placeholder:text-white/50 focus:border-white/25 focus:ring-2 focus:ring-white/10"
                  />
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-sm">
                  <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Categoría</label>
                  <select
                    value={sandboxCategory}
                    onChange={(e) => setSandboxCategory(e.target.value)}
                    className="input bg-slate-950/90 border border-white/10 text-white placeholder:text-white/50 focus:border-white/25 focus:ring-2 focus:ring-white/10"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-background text-foreground">
                        {category.name}
                      </option>
                    ))}
                    {sandboxCategories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-background text-foreground">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-sm">
                  <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Descripción</label>
                  <textarea
                    value={sandboxDescription}
                    onChange={(e) => setSandboxDescription(e.target.value)}
                    placeholder="Descripción del producto..."
                    className="input min-h-27.5 resize-none bg-slate-950/90 border border-white/10 text-white placeholder:text-white/50 focus:border-white/25 focus:ring-2 focus:ring-white/10"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-sm">
                    <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Precio</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sandboxPrice}
                      onChange={(e) => setSandboxPrice(e.target.value)}
                      placeholder="Precio del producto..."
                      className="input bg-slate-950/90 border border-white/10 text-white placeholder:text-white/50 focus:border-white/25 focus:ring-2 focus:ring-white/10"
                    />
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-sm">
                    <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Moneda</label>
                    <select
                      value={sandboxCurrency}
                      onChange={(e) => setSandboxCurrency(e.target.value)}
                      className="input bg-slate-950/90 border border-white/10 text-white placeholder:text-white/50 focus:border-white/25 focus:ring-2 focus:ring-white/10"
                    >
                      <option value="ARS">Pesos argentinos</option>
                      <option value="USD">Dólares</option>
                      <option value="EUR">Euros</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                    <span>Disponible</span>
                    <span className="text-xs text-muted-foreground">{sandboxVisible ? "Sí" : "No"}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSandboxVisible((prev) => !prev)}
                    className={[
                      "w-full inline-flex items-center justify-center h-11 rounded-full border px-4 text-sm font-medium transition",
                      sandboxVisible
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15"
                        : "border-rose-400 bg-rose-400/10 text-rose-300 hover:bg-rose-400/15",
                    ].join(" ")}
                  >
                    {sandboxVisible ? "Disponible" : "No disponible"}
                  </button>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-sm">
                  <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setSandboxImageUrl("");
                        return;
                      }
                      setSandboxImageUrl(URL.createObjectURL(file));
                    }}
                    className="file-input"
                  />
                  {sandboxImageUrl ? (
                    <img src={sandboxImageUrl} alt="Preview" className="mt-3 h-32 w-full rounded-2xl object-cover" />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={addSandboxProduct}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-full bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400"
                >
                  Agregar producto temporal
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6">
              <div className="text-xs uppercase tracking-[0.18em] text-cyan-300/80 mb-3">Productos temporales</div>
              <div className="space-y-2">
                {sandboxProducts.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-muted-foreground">No hay productos de prueba.</div>
                ) : (
                  sandboxProducts.map((product) => (
                    <div key={product.id} className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium truncate">{product.title}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {mergedCategories.find((c) => c.id === product.categoryId)?.name ?? product.categoryId}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSandboxProducts((prev) => prev.filter((item) => item.id !== product.id))}
                        className="text-rose-300 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-white/5 px-2 py-1 text-muted-foreground">
                        {product.price != null
                          ? `${product.currency === "USD" ? "$" : product.currency === "EUR" ? "€" : "ARS"} ${product.price.toFixed(2)}`
                          : "Sin precio"}
                      </span>
                      <span
                        className={[
                          "rounded-full px-2 py-1 text-[11px] font-medium",
                          product.visible ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300",
                        ].join(" ")}
                      >
                        {product.visible ? "Disponible" : "No disponible"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div ref={categorySectionRef} className="mt-6 rounded-3xl border border-cyan-500/20 bg-slate-950/90 p-5 shadow-[0_20px_50px_-30px_rgba(14,165,233,0.18)]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">Categorías temporales</div>
                <div className="text-sm font-semibold">Agrega una categoría de prueba</div>
              </div>
              <button
                type="button"
                onClick={addSandboxCategory}
                className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-400"
              >
                Agregar categoría temporal
              </button>
            </div>
            <div className="space-y-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-sm">
                <input
                  value={newSandboxCategoryName}
                  onChange={(e) => setNewSandboxCategoryName(e.target.value)}
                  placeholder="Nombre de categoría..."
                  className="input bg-slate-950/90 border border-white/10 text-white placeholder:text-white/50 focus:border-white/25 focus:ring-2 focus:ring-white/10"
                />
              </div>
              <div className="space-y-2">
                {sandboxCategories.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-muted-foreground">No hay categorías de prueba.</div>
                ) : (
                  sandboxCategories.map((category) => (
                    <div key={category.id} className="rounded-2xl border border-white/10 px-3 py-3 bg-slate-950/80 flex items-center justify-between gap-3 text-sm">
                      <span>{category.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSandboxCategory(category.id)}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                        title="Eliminar categoría de prueba"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
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
                  <div className={`h-10 w-10 rounded-lg overflow-hidden bg-linear-to-br ${p.gradient} grid place-items-center text-white text-xs font-bold`}>
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
          </div>

          <div className="rounded-2xl glass p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Resumen</div>
            <div className="space-y-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-3">
                    <s.icon className="h-4 w-4 text-cyan" />
                    <div>
                      <div className="text-sm font-semibold">{s.label}</div>
                      <div className="text-xl font-bold">{s.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
