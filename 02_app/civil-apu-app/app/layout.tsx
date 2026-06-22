import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Civil APU RV",
  description: "MVP para presupuestos de obra y analisis de precios unitarios",
};

const navLinks = [
  { href: "/materials", label: "Materiales" },
  { href: "/labor", label: "Mano de obra" },
  { href: "/equipment", label: "Equipos" },
  { href: "/rubros", label: "Rubros" },
  { href: "/projects", label: "Proyectos" },
  { href: "/imports/materials", label: "Importar" },
  { href: "/imports/ipco-classification", label: "IPCO" },
  { href: "/admin/ipco-denominations", label: "Admin IPCO" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-100">
        <header className="border-b border-slate-300 bg-slate-900 text-white">
          <nav className="mx-auto flex max-w-[1760px] flex-col gap-3 px-3 py-2 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-white">
              Civil APU RV
            </Link>
            <div className="flex flex-wrap gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex h-8 items-center rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-blue-300 hover:bg-blue-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
