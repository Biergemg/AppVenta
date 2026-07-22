const COMIDA = new Set(["bolsitas de frituras", "mini pizza", "rancheritos"]);

export function esComida(nombre: string): boolean {
  return COMIDA.has(nombre.trim().toLowerCase());
}
