import type { ReactNode } from "react";
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    addCartItem,
    fetchCart,
    removeCartItem,
    submitOrder,
    updateCartItem,
} from "../api/shop";
import type { CartItemPayload, OrderRequest } from "../api/shop";
import { useAuth } from "../auth/AuthContext";

export interface CartItem extends CartItemPayload {
    name: string;
    price: number;
}

interface CartContextValue {
    items: CartItem[];
    loading: boolean;
    error: string | null;
    subtotal: number;
    tax: number;
    total: number;
    refresh: () => Promise<void>;
    addItem: (item: CartItem) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clear: () => void;
    checkout: (payload: OrderRequest) => Promise<string | null>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "cart_items";
const TAX_RATE = 0.21;

function persist(items: CartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: CartItem[] = JSON.parse(stored);
                setItems(parsed);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    useEffect(() => {
        const loadRemote = async () => {
            if (!isAuthenticated) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetchCart();
                if (res?.items) {
                    const hydrated = res.items
                        .filter((i) => i.productId && i.quantity)
                        .map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            name: i.name ?? "Producto",
                            price: i.price ?? 0,
                        }));
                    setItems(hydrated);
                    persist(hydrated);
                }
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "No se pudo cargar el carrito";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        loadRemote();
    }, [isAuthenticated]);

    const refresh = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchCart();
            const hydrated = res.items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                name: i.name ?? "Producto",
                price: i.price ?? 0,
            }));
            setItems(hydrated);
            persist(hydrated);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "No se pudo actualizar el carrito";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (item: CartItem) => {
        const updated = [...items];
        const existing = updated.find((x) => x.productId === item.productId);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            updated.push(item);
        }
        setItems(updated);
        persist(updated);

        if (!isAuthenticated) return;
        try {
            await addCartItem({
                productId: item.productId,
                quantity: existing ? existing.quantity : item.quantity,
            });
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "No se pudo añadir al carrito";
            setError(message);
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        const updated = items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
        );
        setItems(updated);
        persist(updated);

        if (!isAuthenticated) return;
        try {
            await updateCartItem({ productId, quantity });
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "No se pudo actualizar el carrito";
            setError(message);
        }
    };

    const removeItem = async (productId: string) => {
        const updated = items.filter((i) => i.productId !== productId);
        setItems(updated);
        persist(updated);

        if (!isAuthenticated) return;
        try {
            await removeCartItem(productId);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "No se pudo eliminar el producto";
            setError(message);
        }
    };

    const clear = () => {
        setItems([]);
        persist([]);
    };

    const checkout = async (payload: OrderRequest) => {
        if (!isAuthenticated) {
            setError("Necesitas iniciar sesión para comprar");
            return null;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await submitOrder(payload);
            clear();
            return res.id;
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "No se pudo completar la compra";
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [items]
    );
    const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
    const total = useMemo(() => subtotal + tax, [subtotal, tax]);

    const value: CartContextValue = {
        items,
        loading,
        error,
        subtotal,
        tax,
        total,
        refresh,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        checkout,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
    return ctx;
}
