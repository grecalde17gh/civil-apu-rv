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
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50">
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <Link href="/" className="text-base font-semibold text-zinc-950">
              Civil APU RV
            </Link>
            <div className="flex flex-wrap gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
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
