import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { OrderDetail } from "../api/shop";
import { fetchOrderById, cancelOrder, markOrderAsPaid } from "../api/shop";
import { useAuth } from "../auth/AuthContext";

export default function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const load = async () => {
            try {
                if (!id) return;
                const orderId = Number(id);
                const res = await fetchOrderById(orderId);
                setOrder(res);
            } catch (err: unknown) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "No se pudo cargar la orden"
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, isAuthenticated, navigate]);

    const handleCancel = async () => {
        if (!order || !id) return;
        if (!confirm("¿Seguro que quieres cancelar esta orden?")) return;

        setActionLoading(true);
        setError(null);
        try {
            const updated = await cancelOrder(Number(id));
            setOrder(updated);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo cancelar la orden"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!order || !id) return;
        
        setActionLoading(true);
        setError(null);
        try {
            const updated = await markOrderAsPaid(Number(id));
            setOrder(updated);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo marcar como pagada"
            );
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <p className="text-slate-200">Cargando orden...</p>;
    if (error)
        return (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
            </div>
        );
    if (!order) return <p className="text-slate-300">Orden no encontrada.</p>;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Delivered":
                return "bg-emerald-500/20 text-emerald-200";
            case "Shipped":
                return "bg-blue-500/20 text-blue-200";
            case "Confirmed":
                return "bg-cyan-500/20 text-cyan-200";
            case "Cancelled":
                return "bg-red-500/20 text-red-200";
            default:
                return "bg-white/10 text-white";
        }
    };

    const canCancel = order.status === "Pending";
    const canPayNow = order.paymentStatus !== "Paid" && order.status !== "Cancelled";

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-cyan-300">
                            Orden #{order.orderNumber}
                        </p>
                        <h2 className="text-2xl font-semibold text-white">
                            {order.totalAmount.toLocaleString("es-ES", {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </h2>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusBadge(order.status)}`}>
                            {order.status}
                        </span>
                        <span className={`rounded-full px-4 py-2 text-sm font-medium ${
                            order.paymentStatus === "Paid"
                                ? "bg-emerald-500/20 text-emerald-200"
                                : "bg-yellow-500/20 text-yellow-200"
                        }`}>
                            {order.paymentStatus === "Paid" ? "Pagado" : "Pendiente de pago"}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <div className="space-y-2 text-sm">
                        <p className="text-slate-400">Creada el:</p>
                        <p className="text-white">
                            {new Date(order.createdAt).toLocaleString("es-ES")}
                        </p>
                    </div>
                    {order.paidAt && (
                        <div className="space-y-2 text-sm">
                            <p className="text-slate-400">Pagada el:</p>
                            <p className="text-white">
                                {new Date(order.paidAt).toLocaleString("es-ES")}
                            </p>
                        </div>
                    )}
                    {order.shippedAt && (
                        <div className="space-y-2 text-sm">
                            <p className="text-slate-400">Enviada el:</p>
                            <p className="text-white">
                                {new Date(order.shippedAt).toLocaleString("es-ES")}
                            </p>
                        </div>
                    )}
                    {order.deliveredAt && (
                        <div className="space-y-2 text-sm">
                            <p className="text-slate-400">Entregada el:</p>
                            <p className="text-white">
                                {new Date(order.deliveredAt).toLocaleString("es-ES")}
                            </p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100 mb-4">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => navigate("/orders")}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                        disabled={actionLoading}
                    >
                        ? Volver
                    </button>
                    {canPayNow && (
                        <button
                            onClick={handleMarkAsPaid}
                            disabled={actionLoading}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                        >
                            {actionLoading ? "Procesando..." : "Marcar como pagada"}
                        </button>
                    )}
                    {canCancel && (
                        <button
                            onClick={handleCancel}
                            disabled={actionLoading}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition"
                        >
                            {actionLoading ? "Procesando..." : "Cancelar orden"}
                        </button>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Productos</h3>
                <div className="space-y-3">
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                            <div
                                key={`${order.id}-${item.productId}`}
                                className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 hover:bg-white/10 transition"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-white">{item.productName}</p>
                                    <p className="text-sm text-slate-400">
                                        {item.quantity} x {item.unitPrice.toLocaleString("es-ES", {
                                            style: "currency",
                                            currency: "EUR",
                                        })}
                                    </p>
                                </div>
                                <p className="font-semibold text-cyan-300">
                                    {item.subtotal.toLocaleString("es-ES", {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400">Sin productos</p>
                    )}
                </div>

                <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400">Subtotal:</p>
                        <p className="text-white">
                            {order.subtotalAmount.toLocaleString("es-ES", {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400">IVA (21%):</p>
                        <p className="text-white">
                            {order.taxAmount.toLocaleString("es-ES", {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </p>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold border-t border-white/10 pt-2 mt-2">
                        <p className="text-white">Total:</p>
                        <p className="text-cyan-300 text-lg">
                            {order.totalAmount.toLocaleString("es-ES", {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
