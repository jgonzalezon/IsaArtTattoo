import StoreLayout from "../components/StoreLayout";
import OrderDetail from "../components/OrderDetail";

export default function OrderDetailPage() {
    return (
        <StoreLayout
            title="Detalle de orden"
            description="Revisa los detalles de tu compra"
        >
            <OrderDetail />
        </StoreLayout>
    );
}
