"use client";

import { useAuth } from "@/context/AuthContext";
import { readStoredValue, removeStoredValue, STORAGE_KEYS } from "@/lib/storageKeys";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
}

type CartPayload = {
  items?: CartItem[];
  message?: string;
  errors?: Record<string, string[]>;
};

interface CartContextProps {
  cart: CartItem[];
  guestToken: string | null;
  isCartReady: boolean;
  cartError: string;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

function createGuestToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function responseMessage(payload: CartPayload, fallback: string) {
  const validationMessage = payload.errors ? Object.values(payload.errors).flat()[0] : undefined;
  return validationMessage || payload.message || fallback;
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, isAuthReady } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [isCartReady, setIsCartReady] = useState(false);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.guestCartToken);
    const nextToken = storedToken || createGuestToken();
    if (!storedToken) localStorage.setItem(STORAGE_KEYS.guestCartToken, nextToken);
    setGuestToken(nextToken);
  }, []);

  const headers = useCallback(
    (json = true) => ({
      Accept: "application/json",
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(guestToken ? { "X-Cart-Token": guestToken } : {}),
    }),
    [guestToken, token]
  );

  const applyResponse = useCallback(async (response: Response, fallback: string) => {
    const payload = (await response.json()) as CartPayload;
    if (!response.ok) throw new Error(responseMessage(payload, fallback));
    setCart(payload.items ?? []);
    setCartError("");
    return payload;
  }, []);

  const loadCart = useCallback(async () => {
    if (!guestToken || !isAuthReady) return;
    const response = await fetch("/api/cart", { headers: headers(), cache: "no-store" });
    await applyResponse(response, "Không thể tải giỏ hàng.");
  }, [applyResponse, guestToken, headers, isAuthReady]);

  const migrateLegacyCart = useCallback(async () => {
    const legacyValue = readStoredValue(STORAGE_KEYS.cart);
    if (!legacyValue) return;

    try {
      const legacyItems = JSON.parse(legacyValue) as CartItem[];
      if (!Array.isArray(legacyItems) || legacyItems.length === 0) {
        removeStoredValue(STORAGE_KEYS.cart);
        return;
      }

      const currentResponse = await fetch("/api/cart", { headers: headers(), cache: "no-store" });
      const currentPayload = (await currentResponse.json()) as CartPayload;
      if (!currentResponse.ok) throw new Error(responseMessage(currentPayload, "Không thể đọc giỏ hàng hiện tại."));
      const currentItems = currentPayload.items ?? [];

      for (const legacyItem of legacyItems) {
        const existing = currentItems.find((item) => item.id === legacyItem.id);
        const desiredQuantity = Math.max(existing?.quantity ?? 0, legacyItem.quantity || 1);
        const response = existing
          ? await fetch(`/api/cart/items/${legacyItem.id}`, {
              method: "PATCH",
              headers: headers(),
              body: JSON.stringify({ quantity: desiredQuantity }),
            })
          : await fetch("/api/cart/items", {
              method: "POST",
              headers: headers(),
              body: JSON.stringify({ product_id: legacyItem.id, quantity: desiredQuantity }),
            });
        if (!response.ok) {
          const payload = (await response.json()) as CartPayload;
          throw new Error(responseMessage(payload, "Không thể chuyển giỏ hàng cũ."));
        }
      }

      removeStoredValue(STORAGE_KEYS.cart);
    } catch (error) {
      console.error("Legacy cart migration failed:", error);
    }
  }, [headers]);

  useEffect(() => {
    if (!guestToken || !isAuthReady) return;
    let cancelled = false;

    const syncCart = async () => {
      setIsCartReady(false);
      setCartError("");
      try {
        if (token) {
          const mergeResponse = await fetch("/api/cart/merge", {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ guest_token: guestToken }),
          });
          if (!mergeResponse.ok) {
            const payload = (await mergeResponse.json()) as CartPayload;
            throw new Error(responseMessage(payload, "Không thể gộp giỏ hàng."));
          }
        }

        await migrateLegacyCart();
        if (!cancelled) await loadCart();
      } catch (error) {
        if (!cancelled) {
          setCartError(error instanceof Error ? error.message : "Không thể đồng bộ giỏ hàng.");
        }
      } finally {
        if (!cancelled) setIsCartReady(true);
      }
    };

    syncCart();
    return () => {
      cancelled = true;
    };
  }, [guestToken, headers, isAuthReady, loadCart, migrateLegacyCart, token]);

  const mutateCart = useCallback(
    async (url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) => {
      setCartError("");
      try {
        const response = await fetch(url, {
          method,
          headers: headers(),
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        await applyResponse(response, "Không thể cập nhật giỏ hàng.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không thể cập nhật giỏ hàng.";
        setCartError(message);
        throw error;
      }
    },
    [applyResponse, headers]
  );

  const addToCart = useCallback(
    async (item: CartItem) => {
      await mutateCart("/api/cart/items", "POST", {
        product_id: item.id,
        quantity: Math.max(1, item.quantity || 1),
      });
    },
    [mutateCart]
  );

  const removeFromCart = useCallback(
    async (id: number) => {
      await mutateCart(`/api/cart/items/${id}`, "DELETE");
    },
    [mutateCart]
  );

  const clearCart = useCallback(async () => {
    await mutateCart("/api/cart", "DELETE");
    removeStoredValue(STORAGE_KEYS.cart);
  }, [mutateCart]);

  const updateQuantity = useCallback(
    async (id: number, quantity: number) => {
      await mutateCart(`/api/cart/items/${id}`, "PATCH", { quantity: Math.max(1, quantity) });
    },
    [mutateCart]
  );

  const value = useMemo(
    () => ({
      cart,
      guestToken,
      isCartReady,
      cartError,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      refreshCart: loadCart,
    }),
    [addToCart, cart, cartError, clearCart, guestToken, isCartReady, loadCart, removeFromCart, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
