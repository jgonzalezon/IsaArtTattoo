import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartView() {
    const { items, subtotal, tax, total, removeItem, updateQuantity, error } =
        useCart();

    if (items.length === 0) {
        return (
            <div className="space-y-4 text-center text-slate-200">
                <p>Tu carrito está vacío.</p>
                <Link
                    to="/products"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-semibold text-slate-900"
                >
                    Ir al catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
                        {error}
                    </div>
                )}
                {items.map((item) => (
                    <div
                        key={item.productId}
                        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:flex-row md:items-center md:justify-between"
                    >
                        <div>
                            <p className="text-lg font-semibold text-white">{item.name}</p>
                            <p className="text-slate-300">
                                {(item.price * item.quantity).toLocaleString("es-ES", {
                                    style: "currency",
                                    currency: "EUR",
                                })}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-slate-200">
                                Cantidad
                                <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) =>
                                        updateQuantity(
                                            item.productId,
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-20 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white"
                                />
                            </label>
                            <button
                                onClick={() => removeItem(item.productId)}
                                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-red-100 hover:bg-white/10"
                            >
                                Quitar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <aside className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <h3 className="text-lg font-semibold text-white">Resumen</h3>
                <div className="space-y-1 text-sm text-slate-200">
                    <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span>
                            {subtotal.toLocaleString("es-ES", {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Impuestos (21%)</span>
                        <span>
                            {tax.toLocaleString("es-ES", {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold text-white">
                        <span>Total</span>
                        <span>
                            {total.toLocaleString("es-ES", {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </span>
                    </div>
                </div>
                <Link
                    to="/checkout"
                    className="block w-full rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-3 text-center font-semibold text-slate-900"
                >
                    Ir a pagar
                </Link>
            </aside>
        </div>
    );
}
