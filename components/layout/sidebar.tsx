"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  TrendingUp,
  Landmark,
  Settings,
  LogOut,
  ChevronLeft,
  Orbit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useAuthStore } from "@/lib/store";
import { clearTokens } from "@/lib/auth";
import { authApi } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transações" },
  { href: "/budget", icon: PieChart, label: "Orçamento" },
  { href: "/projections", icon: TrendingUp, label: "Projeções" },
  { href: "/accounts", icon: Landmark, label: "Contas" },
];

const BOTTOM_ITEMS = [
  { href: "/settings", icon: Settings, label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // silent
    }
    clearTokens();
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-navy-900 border-r border-navy-700/50 transition-all duration-300 h-screen",
        sidebarOpen ? "w-60" : "w-16"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 h-16 border-b border-navy-700/50", !sidebarOpen && "justify-center")}>
        <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2ECFE4, #6366f1)" }}>
          <Orbit className="h-4 w-4 text-white" />
        </div>
        {sidebarOpen && (
          <span className="text-lg font-semibold tracking-tight text-slate-100">
            orbit
          </span>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-navy-700 bg-navy-800 text-slate-400 hover:text-teal-400 transition-colors"
      >
        <ChevronLeft className={cn("h-3 w-3 transition-transform duration-300", !sidebarOpen && "rotate-180")} />
      </button>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-teal-400/10 text-teal-400 border border-teal-400/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-navy-800",
                !sidebarOpen && "justify-center px-2"
              )}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-1 border-t border-navy-700/50">
        {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-navy-800 transition-all duration-200",
              !sidebarOpen && "justify-center px-2"
            )}
            title={!sidebarOpen ? label : undefined}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-danger hover:bg-danger/10 transition-all duration-200",
            !sidebarOpen && "justify-center px-2"
          )}
          title={!sidebarOpen ? "Sair" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {sidebarOpen && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
