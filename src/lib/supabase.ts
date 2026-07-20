import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const mensajeVariables =
  "Faltan las variables de Supabase. Pon NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.";

export const supabase =
  url && anonKey
    ? createClient(url, anonKey)
    : ({
        from() {
          throw new Error(mensajeVariables);
        },
      } as unknown as ReturnType<typeof createClient>);
