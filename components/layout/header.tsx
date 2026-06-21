"use client";
import { Bell, Search, Menu } from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "??";

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-navy-700/50 bg-navy-900/80 backdrop-blur-md sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-navy-800"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-100">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-slate-400">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-400 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-teal-400" />
        </Button>
        <div className="ml-2 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-navy-900"
            style={{ background: "linear-gradient(135deg, #2ECFE4, #6366f1)" }}>
            {initials}
          </div>
          {user && (
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-200 leading-none">{user.name.split(" ")[0]}</p>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
