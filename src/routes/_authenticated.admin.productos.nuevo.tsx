import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/productos/nuevo")({
  component: () => <Navigate to="/admin/productos/$id" params={{ id: "nuevo" }} replace />,
});
