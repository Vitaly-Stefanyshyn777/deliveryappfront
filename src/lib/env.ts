function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Єдине джерело правди для URL бекенду у браузері.
 * Значення має приходити з env, без дефолтів на Railway/інші хости.
 *
 * Підтримуємо `NEXT_PUBLIC_BACKEND_UR` як fallback на випадок опечатки/старого env.
 */
export const BACKEND_BASE_URL = (() => {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_UR ??
    "";

  return raw ? normalizeBaseUrl(raw) : "";
})();
