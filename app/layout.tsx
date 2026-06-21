import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Orbit — Seu dinheiro em órbita",
    template: "%s | Orbit",
  },
  description:
    "Controle financeiro inteligente com Open Finance. Limite diário adaptativo, categorização automática com IA e projeções futuras.",
  manifest: "/manifest.json",
  themeColor: "#2ECFE4",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Orbit",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-navy-950 text-slate-100 antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#162036",
                border: "1px solid rgba(46,207,228,0.15)",
                color: "#f1f5f9",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
