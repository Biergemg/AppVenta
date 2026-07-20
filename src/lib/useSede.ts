import { useSyncExternalStore } from "react";
import {
  subscribeSede,
  getSedeSnapshot,
  getSedeServerSnapshot,
} from "@/lib/sede";

export function useSedeActual() {
  return useSyncExternalStore(
    subscribeSede,
    getSedeSnapshot,
    getSedeServerSnapshot
  );
}
