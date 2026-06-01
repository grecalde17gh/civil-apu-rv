import Link from "next/link";

const modules = [
  {
    title: "Materiales",
    description: "Administra el catalogo de materiales y sus costos unitarios.",
    href: "/materials",
    action: "Abrir materiales",
  },
  {
    title: "Mano de obra",
    description: "Gestiona cuadrillas, roles y costos de mano de obra.",
    href: "/labor",
    action: "Abrir mano de obra",
  },
  {
    title: "Equipos y herramientas",
    description: "Consulta y edita equipos usados en los analisis.",
    href: "/equipment",
    action: "Abrir equipos",
  },
  {
    title: "Rubros",
    description: "Crea rubros y revisa sus precios unitarios calculados.",
    href: "/rubros",
    action: "Abrir rubros",
  },
  {
    title: "Proyectos",
    description: "Organiza obras, clientes y presupuestos por proyecto.",
    href: "/projects",
    action: "Abrir proyectos",
  },
  {
    title: "Importar materiales",
    description: "Carga materiales desde archivos externos para acelerar el catalogo.",
    href: "/imports/materials",
    action: "Abrir importacion",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Civil APU RV
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-zinc-950 sm:text-4xl">
            Panel principal del MVP
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
            Accede a los catalogos, rubros, proyectos e importaciones sin escribir rutas manualmente.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group flex min-h-56 flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <div>
                <h2 className="text-xl font-semibold text-zinc-950">{module.title}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{module.description}</p>
              </div>
              <span className="mt-6 inline-flex text-sm font-semibold text-zinc-950 group-hover:underline">
                {module.action}
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
