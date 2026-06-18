import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

import appCss from "../styles.css?url";
import { reportClientError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CursorSpotlight } from "@/components/site/Spotlight";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-[120px] leading-none font-bold text-gradient">404</div>
        <h2 className="mt-2 text-xl font-semibold">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hubo un problema cargando esta página. Puedes reintentar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-border bg-white/5 text-sm font-medium hover:bg-white/10"
          >
            Inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Revendedor digital — Servicios digitales premium" },
      {
        name: "description",
        content:
          "Catálogo curado de servicios digitales premium: PS Plus, Netflix, Spotify, Disney+ y más. Entrega rápida y soporte humano.",
      },
      { name: "theme-color", content: "#07070A" },
      { property: "og:title", content: "Revendedor digital" },
      { property: "og:description", content: "Servicios digitales premium con entrega inmediata." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function KindeClientProvider({ children }: { children: ReactNode }) {
  const domain = import.meta.env.VITE_KINDE_DOMAIN;
  const clientId = import.meta.env.VITE_KINDE_CLIENT_ID;
  const audience = import.meta.env.VITE_KINDE_AUDIENCE;
  const scope = import.meta.env.VITE_KINDE_SCOPE;
  const [redirectUri, setRedirectUri] = useState("");

  useEffect(() => {
    setRedirectUri(`${window.location.origin}/admin`);
  }, []);

  if (!redirectUri) {
    return null;
  }

  return (
    <KindeProvider
      domain={domain ?? ""}
      clientId={clientId ?? ""}
      redirectUri={redirectUri}
      audience={audience || undefined}
      scope={scope}
      forceChildrenRender={true}
    >
      {children}
    </KindeProvider>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  return (
    <KindeClientProvider>
      <QueryClientProvider client={queryClient}>
        <div className="relative min-h-screen flex flex-col overflow-x-clip">
          <CursorSpotlight />
          <Header />
          <main className="relative z-1 flex-1">
            <Outlet />
          </main>
          <Footer />
          <Toaster theme="dark" position="bottom-right" />
        </div>
      </QueryClientProvider>
    </KindeClientProvider>
  );
}
