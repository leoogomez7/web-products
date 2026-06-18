import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedRoute,
});

function AuthenticatedRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useKindeAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/auth", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Validando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <Outlet />;
}
