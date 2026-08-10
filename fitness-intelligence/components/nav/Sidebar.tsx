"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/carte", label: "Carte", icon: "🗺️" },
  { href: "/clubs", label: "Clubs", icon: "🏋️" },
  { href: "/enseignes", label: "Enseignes", icon: "🏷️" },
  { href: "/groupes", label: "Groupes", icon: "🧩" },
  { href: "/dirigeants", label: "Dirigeants", icon: "🧑‍💼" },
  { href: "/prospection", label: "Prospection", icon: "🎯" },
  { href: "/sources", label: "Sources", icon: "📚" },
  { href: "/scraping", label: "Scraping", icon: "⚙️" },
  { href: "/parametres", label: "Paramètres", icon: "🛠️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          P
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-slate-900">PULVIS</p>
          <p className="text-xs leading-none text-slate-400">Fitness Intelligence</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-400">
        Île-de-France · v1
      </div>
    </aside>
  );
}
