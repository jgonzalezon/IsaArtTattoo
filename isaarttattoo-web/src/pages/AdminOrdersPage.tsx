import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination";
import {
    fetchAdminOrders,
    fetchAdminOrderDetail,
    confirmOrder,
    setPaidOrder,
    shipOrder,
    deliverOrder,
    cancelOrder,
    getOrderStatusLabel,
    getPaymentStatusLabel,
    OrderStatus,
    PaymentStatus,
    type AdminOrderListItem,
    type AdminOrderDetail
} from "../api/adminOrders";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Filtros
    const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<PaymentStatus | null>(null);

    const ITEMS_PER_PAGE = 15;

    // Cargar órdenes
    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAdminOrders({
                status: filterStatus,
                paymentStatus: filterPaymentStatus
            });
            setOrders(data);
            setCurrentPage(1);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "No se pudieron cargar las ordenes");
        } finally {
            setLoading(false);
        }
    };

    // Cargar detalle
    const loadOrderDetail = async (id: number) => {
        setError(null);
        try {
            const data = await fetchAdminOrderDetail(id);
            setSelectedOrder(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "No se pudo cargar el detalle");
        }
    };

    // Acciones en órdenes
    const handleConfirm = async () => {
        if (!selectedOrder) return;
        try {
            setLoading(true);
            const updated = await confirmOrder(selectedOrder.id);
            setSelectedOrder(updated);
            setSuccess("Orden confirmada");
            setTimeout(() => {
                loadOrders();
                setSuccess(null);
            }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al confirmar");
        } finally {
            setLoading(false);
        }
    };

    const handleSetPaid = async () => {
        if (!selectedOrder) return;
        try {
            setLoading(true);
            const updated = await setPaidOrder(selectedOrder.id);
            setSelectedOrder(updated);
            setSuccess("Orden marcada como pagada");
            setTimeout(() => {
                loadOrders();
                setSuccess(null);
            }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al marcar como pagada");
        } finally {
            setLoading(false);
        }
    };

    const handleShip = async () => {
        if (!selectedOrder) return;
        try {
            setLoading(true);
            const updated = await shipOrder(selectedOrder.id);
            setSelectedOrder(updated);
            setSuccess("Orden marcada como enviada");
            setTimeout(() => {
                loadOrders();
                setSuccess(null);
            }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al enviar");
        } finally {
            setLoading(false);
        }
    };

    const handleDeliver = async () => {
        if (!selectedOrder) return;
        try {
            setLoading(true);
            const updated = await deliverOrder(selectedOrder.id);
            setSelectedOrder(updated);
            setSuccess("Orden marcada como entregada");
            setTimeout(() => {
                loadOrders();
                setSuccess(null);
            }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al entregar");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!selectedOrder) return;
        if (!confirm("Seguro que deseas cancelar esta orden?")) return;
        
        try {
            setLoading(true);
            const updated = await cancelOrder(selectedOrder.id);
            setSelectedOrder(updated);
            setSuccess("Orden cancelada");
            setTimeout(() => {
                loadOrders();
                setSuccess(null);
            }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al cancelar");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [filterStatus, filterPaymentStatus]);

    // Paginación
    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-white">Gestion de ordenes</h1>
                    <p className="text-sm text-slate-300">
                        Administra todos los pedidos, cambios de estado y pagos
                    </p>
                </div>
                <Link
                    to="/admin"
                    className="rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/80 hover:bg-cyan-400/20"
                >
                    Volver al panel
                </Link>
            </header>

            {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {success}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                {/* Filtros */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4 md:col-span-1">
                    <h2 className="text-lg font-semibold text-white">Filtros</h2>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-200">Estado de orden</label>
                        <select
                            value={filterStatus ?? ""}
                            onChange={(e) => setFilterStatus(e.target.value ? parseInt(e.target.value) as OrderStatus : null)}
                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        >
                            <option value="">Todos</option>
                            <option value={OrderStatus.Pending}>Pendiente</option>
                            <option value={OrderStatus.Confirmed}>Confirmado</option>
                            <option value={OrderStatus.Shipped}>Enviado</option>
                            <option value={OrderStatus.Delivered}>Entregado</option>
                            <option value={OrderStatus.Cancelled}>Cancelado</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-200">Estado de pago</label>
                        <select
                            value={filterPaymentStatus ?? ""}
                            onChange={(e) => setFilterPaymentStatus(e.target.value ? parseInt(e.target.value) as PaymentStatus : null)}
                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        >
                            <option value="">Todos</option>
                            <option value={PaymentStatus.Unpaid}>No pagado</option>
                            <option value={PaymentStatus.Paid}>Pagado</option>
                            <option value={PaymentStatus.Refunded}>Reembolsado</option>
                            <option value={PaymentStatus.Failed}>Fallido</option>
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setFilterStatus(null);
                            setFilterPaymentStatus(null);
                        }}
                        className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                    >
                        Limpiar filtros
                    </button>
                </div>

                {/* Lista de órdenes */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
                    <h2 className="mb-4 text-lg font-semibold text-white">Ordenes</h2>

                    {loading && orders.length === 0 ? (
                        <p className="text-slate-400">Cargando...</p>
                    ) : orders.length === 0 ? (
                        <p className="text-slate-400">No hay ordenes con estos filtros</p>
                    ) : (
                        <>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {paginatedOrders.map((order) => (
                                    <button
                                        key={order.id}
                                        onClick={() => loadOrderDetail(order.id)}
                                        className={`w-full rounded-lg border p-3 text-left transition ${
                                            selectedOrder?.id === order.id
                                                ? "border-cyan-400 bg-cyan-400/10"
                                                : "border-white/10 bg-slate-900/40 hover:border-white/20"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="font-semibold text-white">{order.orderNumber}</p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(order.createdAt).toLocaleDateString("es-ES")}
                                                </p>
                                            </div>
                                            <div className="flex gap-1 text-xs">
                                                <span className="rounded px-2 py-1 bg-blue-600/30 text-blue-200">
                                                    {getOrderStatusLabel(order.status)}
                                                </span>
                                                <span className="rounded px-2 py-1 bg-green-600/30 text-green-200">
                                                    {getPaymentStatusLabel(order.paymentStatus)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-cyan-300">
                                            {order.totalAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                        totalItems={orders.length}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Detalle de orden */}
            {selectedOrder && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">{selectedOrder.orderNumber}</h2>
                            <p className="text-sm text-slate-400">Usuario: {selectedOrder.userId}</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="rounded-full px-3 py-1 text-sm font-semibold bg-blue-600/30 text-blue-200">
                                {getOrderStatusLabel(selectedOrder.status)}
                            </span>
                            <span className="rounded-full px-3 py-1 text-sm font-semibold bg-green-600/30 text-green-200">
                                {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-lg border border-white/10 bg-slate-900/40 p-4">
                        <h3 className="mb-2 font-semibold text-white">Items</h3>
                        <div className="space-y-2">
                            {selectedOrder.items.map((item) => (
                                <div key={item.productId} className="flex justify-between text-sm">
                                    <span className="text-slate-200">
                                        {item.quantity}x {item.productName}
                                    </span>
                                    <span className="font-semibold text-cyan-300">
                                        {item.subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totales */}
                    <div className="rounded-lg border border-white/10 bg-slate-900/40 p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-200">Subtotal</span>
                            <span className="font-semibold text-white">
                                {selectedOrder.subtotalAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-200">IVA (21%)</span>
                            <span className="font-semibold text-white">
                                {selectedOrder.taxAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                            </span>
                        </div>
                        <div className="border-t border-white/10 pt-2 flex justify-between">
                            <span className="font-semibold text-white">Total</span>
                            <span className="text-lg font-semibold text-cyan-300">
                                {selectedOrder.totalAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                            </span>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                        {selectedOrder.status === OrderStatus.Pending && (
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Confirmar
                            </button>
                        )}

                        {selectedOrder.paymentStatus === PaymentStatus.Unpaid && (
                            <button
                                onClick={handleSetPaid}
                                disabled={loading}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                Marcar como pagado
                            </button>
                        )}

                        {selectedOrder.status === OrderStatus.Confirmed && selectedOrder.paymentStatus === PaymentStatus.Paid && (
                            <button
                                onClick={handleShip}
                                disabled={loading}
                                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
                            >
                                Marcar como enviado
                            </button>
                        )}

                        {selectedOrder.status === OrderStatus.Shipped && (
                            <button
                                onClick={handleDeliver}
                                disabled={loading}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                Marcar como entregado
                            </button>
                        )}

                        {selectedOrder.status !== OrderStatus.Delivered && selectedOrder.status !== OrderStatus.Cancelled && (
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                Cancelar orden
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
