import type { Metadata } from "next";
import { Sidebar } from "@/components/nav/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "PULVIS Fitness Intelligence",
  description: "Prospection B2B des salles de fitness en Île-de-France pour le déploiement PULVIS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-x-hidden px-6 py-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
