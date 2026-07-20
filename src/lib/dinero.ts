export function redondearDinero(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function sumarDinero(valores: number[]): number {
  return redondearDinero(valores.reduce((acc, valor) => acc + valor, 0));
}
