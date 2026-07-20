export type SedeId = 1 | 2;

export const SEDES: { id: SedeId; nombre: string }[] = [
  { id: 1, nombre: "UNIDEP Tampico" },
  { id: 2, nombre: "Parque Méndez" },
];

const STORAGE_KEY = "sede";

type Listener = () => void;
const listeners = new Set<Listener>();

function leerSede(): SedeId | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "1" || raw === "2") return Number(raw) as SedeId;
  return null;
}

export function subscribeSede(listener: Listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function getSedeSnapshot(): SedeId | null {
  return leerSede();
}

export function getSedeServerSnapshot(): SedeId | null {
  return null;
}

export function guardarSede(id: SedeId) {
  window.localStorage.setItem(STORAGE_KEY, String(id));
  listeners.forEach((l) => l());
}

export function borrarSede() {
  window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((l) => l());
}

export function nombreSede(id: SedeId): string {
  return SEDES.find((s) => s.id === id)?.nombre ?? `Sede ${id}`;
}
