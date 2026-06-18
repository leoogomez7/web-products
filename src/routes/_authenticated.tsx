import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const MASTER_PASSWORD_KEY = "admin_password_verified";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedRoute,
});

function AuthenticatedRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useKindeAuth();
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(MASTER_PASSWORD_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUnlocked = sessionStorage.getItem(MASTER_PASSWORD_KEY) === "true";
    if (storedUnlocked !== isUnlocked) {
      setIsUnlocked(storedUnlocked);
    }

    if (!isLoading && !isAuthenticated && !storedUnlocked) {
      navigate({ to: "/auth", replace: true });
    }
  }, [isAuthenticated, isLoading, isUnlocked, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Validando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isUnlocked) return null;

  return <Outlet />;
}
