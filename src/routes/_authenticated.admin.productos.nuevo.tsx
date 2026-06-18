import { createFileRoute } from "@tanstack/react-router";
import { ProductEdit } from "./_authenticated.admin.productos.$id";

export const Route = createFileRoute("/_authenticated/admin/productos/nuevo")({
  component: () => <ProductEdit createIdOverride="nuevo" />,
});
