import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Copy ke clipboard yang aman dipanggil di mana saja — `navigator.clipboard`
 * hanya tersedia di secure context (HTTPS/localhost). Saat diakses lewat IP
 * jaringan lokal via HTTP (mis. testing di HP/PC lain di jaringan yang sama),
 * API itu `undefined` dan langsung throw kalau dipanggil langsung. Fallback
 * ke `execCommand('copy')` lewat textarea sementara untuk kasus itu.
 */
export function copyToClipboard(text: string): boolean {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      void navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // lanjut ke fallback
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
