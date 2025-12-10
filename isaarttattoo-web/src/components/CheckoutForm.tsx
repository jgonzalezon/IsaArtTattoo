import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CheckoutForm() {
    const { items, subtotal, tax, total, checkout, loading, error } = useCart();
    const [contactEmail, setContactEmail] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const orderId = await checkout({
            contactEmail,
            shippingAddress,
            notes,
            items: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.price,
            })),
        });
        if (orderId) {
            setSuccessMessage(`Orden creada (#${orderId}).`);
            setTimeout(() => navigate("/orders"), 1200);
        }
    };

    if (items.length === 0) {
        return (
            <div className="space-y-4 text-center text-slate-200">
                <p>No tienes productos en el carrito.</p>
                <button
                    onClick={() => navigate("/products")}
                    className="rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-semibold text-slate-900"
                >
                    Ver catálogo
                </button>
            </div>
        );
    }

    return (
        <div className="grid gap-8 md:grid-cols-[1.4fr,1fr]">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Datos de contacto</h3>
                {error && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                        {successMessage}
                    </div>
                )}
                <label className="grid gap-2 text-sm text-slate-200">
                    Correo electrónico
                    <input
                        required
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white"
                    />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                    Dirección
                    <textarea
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white"
                    />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                    Notas adicionales
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white"
                        placeholder="Peticiones especiales, horarios, etc."
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-semibold text-slate-900 disabled:opacity-60"
                >
                    {loading ? "Procesando..." : "Confirmar pedido"}
                </button>
            </form>
            <aside className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <h3 className="text-lg font-semibold text-white">Resumen</h3>
                <div className="space-y-2 text-sm text-slate-200">
                    {items.map((item) => (
                        <div
                            key={item.productId}
                            className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                        >
                            <span>
                                {item.name} x{item.quantity}
                            </span>
                            <span>
                                {(item.price * item.quantity).toLocaleString("es-ES", {
                                    style: "currency",
                                    currency: "EUR",
                                })}
                            </span>
                        </div>
                    ))}
                </div>
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
                        <span>Impuestos</span>
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
            </aside>
        </div>
    );
}
