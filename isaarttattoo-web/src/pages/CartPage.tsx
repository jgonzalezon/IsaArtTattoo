import StoreLayout from "../components/StoreLayout";
import CartView from "../components/CartView";

export default function CartPage() {
    return (
        <StoreLayout
            title="Tu carrito"
            description="Revisa los productos seleccionados antes de pagar"
        >
            <CartView />
        </StoreLayout>
    );
}
