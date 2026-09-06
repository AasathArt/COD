// No Database generic is wired into the Supabase clients yet (see
// lib/supabase/client.ts and lib/supabase/server.ts) — that keeps every query
// loosely typed (usable, but not autocompleted/checked) until your real
// schema exists. Once your migrations are applied on your actual Supabase
// project, generate real types with:
//
//   npx supabase gen types typescript --project-id <your-project-id> > lib/supabase/types.ts
//
// Then import `Database` from this file and pass it as the generic to
// createBrowserClient<Database>(...) and createServerClient<Database>(...)
// in client.ts / server.ts / middleware.ts. That gives every query full
// autocomplete and compile-time checking against your actual tables.
export type Database = Record<string, unknown>;
