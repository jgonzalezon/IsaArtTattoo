import StoreLayout from "../components/StoreLayout";
import OrderHistory from "../components/OrderHistory";

export default function OrdersPage() {
    return (
        <StoreLayout
            title="Órdenes"
            description="Revisa tus compras anteriores y su estado"
        >
            <OrderHistory />
        </StoreLayout>
    );
}
