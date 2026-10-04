import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  gradient: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  categoryId: string;
  gradient: string;
  glyph: string;
  imageUrl: string | null;
  price: number | null;
  currency?: string;
  features: string[];
  visible: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
};

export type SiteSettings = {
  brandName: string;
  whatsappNumber: string;
  whatsappMessage: string;
  tagline: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  gradient: string;
  sort_order: number;
};

type ProductRow = {
  id: string;
  title: string;
  description: string;
  long_description: string;
  category_id: string;
  gradient: string;
  glyph: string;
  image_url: string | null;
  price?: number | null;
  features: string[] | null;
  visible: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
};

const mapCategory = (r: CategoryRow): Category => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  description: r.description,
  gradient: r.gradient,
  sortOrder: r.sort_order,
});

const SESSION_SANDBOX_PRODUCTS = "sandbox_products";
const SESSION_SANDBOX_CATEGORIES = "sandbox_categories";

const mapProduct = (r: ProductRow): Product => ({
  id: r.id,
  title: r.title,
  description: r.description,
  longDescription: r.long_description,
  categoryId: r.category_id,
  gradient: r.gradient,
  glyph: r.glyph,
  imageUrl: r.image_url,
  price: r.price ?? null,
  currency: r.price != null ? "ARS" : undefined,
  features: r.features ?? [],
  visible: r.visible,
  featured: r.featured,
  sortOrder: r.sort_order,
  createdAt: r.created_at,
});

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getSandboxCategories = (): Category[] => {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(SESSION_SANDBOX_CATEGORIES);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<Partial<Category>>;
    return parsed.map((category, index) => ({
      id: category.id ?? `sandbox-category-${index}`,
      name: category.name ?? "Categoría temporal",
      slug: category.slug ?? `categoria-temporal-${index}`,
      description: category.description ?? "",
      gradient: category.gradient ?? "from-white/10 to-white/10",
      sortOrder: category.sortOrder ?? 1000 + index,
    }));
  } catch {
    return [];
  }
};

const getSandboxProducts = (): Product[] => {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(SESSION_SANDBOX_PRODUCTS);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<Partial<Product> & { category?: string }>;
    return parsed.map((product, index) => ({
      id: product.id ?? `sandbox-${Date.now()}-${index}`,
      title: product.title ?? "Producto temporal",
      description: product.description ?? "",
      longDescription: product.description ?? "",
      categoryId:
        product.categoryId ??
        (product.category ? `sandbox-category-${slugify(product.category)}` : `sandbox-category-${index}`),
      gradient: "from-violet-500/20 via-fuchsia-500/15 to-pink-500/20",
      glyph: product.title?.slice(0, 2).toUpperCase() ?? "TP",
      imageUrl: product.imageUrl ?? null,
      price: product.price ?? null,
      currency: product.currency ?? "ARS",
      features: [],
      visible: product.visible ?? true,
      featured: false,
      sortOrder: 1000 + index,
      createdAt: product.createdAt ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
};

const mergeSandboxCategories = (categories: Category[]) => {
  const sandbox = getSandboxCategories();
  const existingIds = new Set(categories.map((category) => category.id));
  return [...categories, ...sandbox.filter((category) => !existingIds.has(category.id))];
};

const mergeSandboxProducts = (products: Product[], opts?: { includeHidden?: boolean }) => {
  const sandbox = getSandboxProducts();
  const visibleSandbox = typeof opts?.includeHidden === "boolean" && !opts.includeHidden ? sandbox.filter((product) => product.visible) : sandbox;
  return [...products, ...visibleSandbox];
};

const getSandboxProductById = (id: string): Product | null => {
  return getSandboxProducts().find((product) => product.id === id) ?? null;
};

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as CategoryRow[]).map(mapCategory);
  },
});

export const productsQuery = (opts?: { includeHidden?: boolean }) =>
  queryOptions({
    queryKey: ["products", { includeHidden: !!opts?.includeHidden }],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (!opts?.includeHidden) q = q.eq("visible", true);
      const { data, error } = await q;
      if (error) throw error;
      return ((data ?? []) as ProductRow[]).map(mapProduct);
    },
  });

export const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapProduct(data as ProductRow) : null;
    },
  });

export const siteSettingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("brand_name, whatsapp_number, whatsapp_message, tagline")
      .eq("id", true)
      .maybeSingle();
    if (error) throw error;
    return {
      brandName: data?.brand_name ?? "Revendedor digital",
      whatsappNumber: data?.whatsapp_number ?? "",
      whatsappMessage: data?.whatsapp_message ?? "Hola, me interesa este producto:",
      tagline: data?.tagline ?? "",
    };
  },
});

export const sampleCategories: Category[] = [
  {
    id: "sample-category-1",
    name: "Categoría de prueba 1",
    slug: "categoria-de-prueba-1",
    description: "Colección de ejemplo para empezar a explorar.",
    gradient: "from-cyan-500/20 via-sky-500/15 to-blue-500/20",
    sortOrder: 0,
  },
  {
    id: "sample-category-2",
    name: "Categoría de prueba 2",
    slug: "categoria-de-prueba-2",
    description: "Otra colección de ejemplo con productos de demostración.",
    gradient: "from-violet-500/20 via-fuchsia-500/15 to-pink-500/20",
    sortOrder: 1,
  },
];

export const sampleProducts: Product[] = [
  {
    id: "sample-product-1",
    title: "Tienda digital lista para empezar",
    description: "Producto de prueba para ilustrar cómo se ve el catálogo público.",
    longDescription: "Una demostración de producto con información de muestra y llamada a la acción.",
    categoryId: "sample-category-1",
    gradient: "from-indigo-500/30 via-violet-500/20 to-cyan-400/20",
    glyph: "PR1",
    imageUrl: null,
    price: 29.99,
    features: ["Envío rápido", "Soporte disponible"],
    visible: true,
    featured: false,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-product-2",
    title: "Sugerencia de producto digital",
    description: "Otro producto de prueba para mantener el catálogo siempre activo.",
    longDescription: "Muestra cómo se verán los productos cuando aún no haya artículos reales disponibles.",
    categoryId: "sample-category-2",
    gradient: "from-sky-500/30 via-blue-500/20 to-indigo-500/20",
    glyph: "PR2",
    imageUrl: null,
    price: 19.99,
    features: ["Diseño moderno", "Fácil de personalizar"],
    visible: true,
    featured: false,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
];

export const useCategories = () =>
  useQuery({
    ...categoriesQuery,
    select: (data) => mergeSandboxCategories(data),
  });

export const useProducts = (opts?: { includeHidden?: boolean }) =>
  useQuery({
    ...productsQuery(opts),
    select: (data) => mergeSandboxProducts(data, opts),
  });

export const useProduct = (id: string) =>
  useQuery({
    ...productQuery(id),
    select: (data) => data ?? getSandboxProductById(id),
  });

export const useSiteSettings = () => useQuery(siteSettingsQuery);

export const buildWhatsappUrl = (settings: SiteSettings | undefined, productTitle?: string) => {
  if (!settings?.whatsappNumber) return null;
  const text = productTitle
    ? `${settings.whatsappMessage} ${productTitle}`
    : settings.whatsappMessage;
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
};
