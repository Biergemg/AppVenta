const MAPA_ACENTOS: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ñ: "n",
};

function slug(nombre: string): string {
  return nombre
    .toLowerCase()
    .replace(/[áéíóúñ]/g, (c) => MAPA_ACENTOS[c])
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const IMAGENES: Record<string, string> = {
  "coca-cola-zero-355-ml": "/productos/coca-cola-zero-355-ml.webp",
  "agua-ciel-de-1-l": "/productos/agua-ciel-de-1-l.webp",
  "agua-members-mark-pet-500-ml": "/productos/agua-members-mark-pet-500-ml.webp",
  "bolsitas-de-frituras": "/productos/bolsitas-de-frituras.jpg",
  "mini-pizza": "/productos/mini-pizza.webp",
  "gatorade-350-ml": "/productos/gatorade-350-ml.webp",
};

export function imagenProducto(nombre: string): string | null {
  return IMAGENES[slug(nombre)] ?? null;
}
