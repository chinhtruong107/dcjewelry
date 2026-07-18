export const STORAGE_KEYS = {
  authUser: "ducchinh_auth_user",
  authToken: "ducchinh_auth_token",
  adminUser: "ducchinh_admin_user",
  adminToken: "ducchinh_admin_token",
  cart: "ducchinh_cart",
  guestCartToken: "ducchinh_guest_cart_token",
  guestFavorites: "ducchinh_favorites_guest",
  firstVisitPromoSeen: "ducchinh_first_visit_promo_seen",
  pendingVnpayOrder: "ducchinh_pending_vnpay_order",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

const LEGACY_KEYS: Partial<Record<StorageKey, string[]>> = {
  [STORAGE_KEYS.authUser]: ["bloom_auth_user"],
  [STORAGE_KEYS.authToken]: ["bloom_auth_token"],
  [STORAGE_KEYS.adminUser]: ["bloom_admin_user"],
  [STORAGE_KEYS.adminToken]: ["bloom_admin_token"],
  [STORAGE_KEYS.cart]: ["cart"],
  [STORAGE_KEYS.guestFavorites]: ["bloom_favorites_guest"],
  [STORAGE_KEYS.firstVisitPromoSeen]: ["bloom_first_visit_promo_seen"],
  [STORAGE_KEYS.pendingVnpayOrder]: ["bloom_pending_vnpay_order"],
};

export function readStoredValue(key: StorageKey): string | null {
  const current = localStorage.getItem(key);
  if (current !== null) return current;

  for (const legacyKey of LEGACY_KEYS[key] ?? []) {
    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue !== null) {
      localStorage.setItem(key, legacyValue);
      localStorage.removeItem(legacyKey);
      return legacyValue;
    }
  }

  return null;
}

export function removeStoredValue(key: StorageKey): void {
  localStorage.removeItem(key);
  for (const legacyKey of LEGACY_KEYS[key] ?? []) {
    localStorage.removeItem(legacyKey);
  }
}
