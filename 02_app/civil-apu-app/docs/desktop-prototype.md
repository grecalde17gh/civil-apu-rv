# Desktop prototype (Tauri)

This branch keeps the current Next.js application intact and opens it inside a native Tauri window during development. It is intentionally separate from any Electron prototype; no Electron files are changed or required here.

## Development

1. Install the [Tauri system prerequisites](https://v2.tauri.app/start/prerequisites/) for Windows, including Rust/Cargo and Microsoft C++ Build Tools.
2. From `02_app/civil-apu-app`, run `npm run desktop:dev`.

Tauri starts the regular Next.js development server at `http://localhost:3000`, then loads that same web application in a desktop window. `npm run dev` remains unchanged.

The experimental worksheet is available at `/desktop/materials`. It is deliberately client-only editing: cells, keyboard navigation, single-cell copy, and tabular paste do not save records yet.

## SQLite preparation

There is no local database migration in this iteration. PostgreSQL/Supabase and Prisma remain the source of truth. A future offline phase should add a synchronization boundary and a SQLite repository behind it; it must not point existing Prisma models directly at a second database without a conflict and snapshot strategy.

## Packaging boundary

`desktop:build` is present only as the Tauri CLI entry point. Packaging is not enabled yet because the current Next.js application relies on server-side rendering and PostgreSQL. A production desktop package needs an explicit local-service or static/offline architecture before it can be considered distributable.
