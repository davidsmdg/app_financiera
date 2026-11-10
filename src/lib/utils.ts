import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función utilitaria para combinar clases de Tailwind de forma segura
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formateador de moneda dinámico
 */
export function formatCurrency(amount: number, currency: string = "COP"): string {
  if (currency === "COP") {
    return "$" + new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatear un valor numérico para input con puntos de miles (es-CO)
 * Ej: "118560" -> "118.560"
 */
export function formatThousands(val: string | number): string {
  const cleanStr = String(val).replace(/\D/g, '');
  if (!cleanStr) return '';
  return new Intl.NumberFormat('es-CO').format(Number(cleanStr));
}

/**
 * Obtener número puro desde un string formateado con puntos
 * Ej: "118.560" -> 118560
 */
export function parseThousands(val: string): number {
  const cleanStr = val.replace(/\D/g, '');
  return cleanStr ? parseInt(cleanStr, 10) : 0;
}
