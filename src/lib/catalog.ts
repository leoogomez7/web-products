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

const mapProduct = (r: ProductRow): Product => ({
  id: r.id,
  title: r.title,
  description: r.description,
  longDescription: r.long_description,
  categoryId: r.category_id,
  gradient: r.gradient,
  glyph: r.glyph,
  imageUrl: r.image_url,
  features: r.features ?? [],
  visible: r.visible,
  featured: r.featured,
  sortOrder: r.sort_order,
  createdAt: r.created_at,
});

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

export const useCategories = () => useQuery(categoriesQuery);
export const useProducts = (opts?: { includeHidden?: boolean }) =>
  useQuery(productsQuery(opts));
export const useProduct = (id: string) => useQuery(productQuery(id));
export const useSiteSettings = () => useQuery(siteSettingsQuery);

export const buildWhatsappUrl = (settings: SiteSettings | undefined, productTitle?: string) => {
  if (!settings?.whatsappNumber) return null;
  const text = productTitle
    ? `${settings.whatsappMessage} ${productTitle}`
    : settings.whatsappMessage;
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
};
