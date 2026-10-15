// eliminar — archivo de la versión Next.js/TypeScript; reemplazado por la web estática (HTML/CSS/JS) en la raíz del repo.
import { clamp, round2 } from "./utils";

/** Conversión propuesta (a confirmar): Spinozómetro 0-100 -> IER 1.00-10.00. */
export function ierFromScore100(score100: number): number {
  return round2(1 + (9 * clamp(score100, 0, 100)) / 100);
}