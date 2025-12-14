import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OrderSummary } from "../api/shop";
import { fetchOrders } from "../api/shop";
import { useAuth } from "../auth/AuthContext";

export default function OrderHistory() {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            if (!isAuthenticated) {
                navigate("/login");
                return;
            }
            try {
                // apiFetch incluye automáticamente el token JWT
                const res = await fetchOrders();
                setOrders(res);
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar las órdenes";
                setError(message);
                console.error("Error loading orders:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [isAuthenticated, navigate]);

    if (loading) return <p className="text-slate-200">Cargando historial...</p>;
    if (error)
        return (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
            </div>
        );

    if (orders.length === 0) {
        return <p className="text-slate-300">Aún no has realizado pedidos.</p>;
    }

    return (
        <div className="space-y-4">
            {orders
                .filter((order) => order && order.id && order.totalAmount !== undefined)
                .map((order) => (
                    <div
                        key={order.id}
                        className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 hover:border-cyan-400/40 transition cursor-pointer"
                        onClick={() => navigate(`/orders/${order.id}`)}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm uppercase tracking-wide text-cyan-300">
                                    {order.orderNumber}
                                </p>
                                <p className="text-lg font-semibold text-white">
                                    {(order.totalAmount ?? 0).toLocaleString("es-ES", {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </p>
                                <p className="text-xs text-slate-300">
                                    {order.createdAt
                                        ? new Date(order.createdAt).toLocaleString("es-ES")
                                        : "En preparación"}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                                    order.status === "Delivered"
                                        ? "bg-emerald-500/20 text-emerald-200"
                                        : order.status === "Shipped"
                                          ? "bg-blue-500/20 text-blue-200"
                                          : order.status === "Confirmed"
                                            ? "bg-cyan-500/20 text-cyan-200"
                                            : order.status === "Cancelled"
                                              ? "bg-red-500/20 text-red-200"
                                              : "bg-white/10 text-white"
                                }`}>
                                    {order.status || "Pendiente"}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    order.paymentStatus === "Paid"
                                        ? "bg-emerald-500/20 text-emerald-200"
                                        : "bg-yellow-500/20 text-yellow-200"
                                }`}>
                                    {order.paymentStatus === "Paid" ? "Pagado" : "Pendiente de pago"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
}
