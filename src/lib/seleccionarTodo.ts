const TAMANO_PAGINA = 1000;

/**
 * PostgREST/Supabase corta las consultas en 1000 filas por default. Esto pagina
 * con .range() hasta traer todo, para que Resumen/Caja/stock nunca se corten
 * silenciosamente cuando el evento acumula muchas filas.
 */
export async function seleccionarTodo<T>(
  construir: (desde: number, hasta: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const todo: T[] = [];
  let desde = 0;
  for (;;) {
    const { data, error } = await construir(desde, desde + TAMANO_PAGINA - 1);
    if (error) throw error;
    const filas = data ?? [];
    todo.push(...filas);
    if (filas.length < TAMANO_PAGINA) break;
    desde += TAMANO_PAGINA;
  }
  return todo;
}
