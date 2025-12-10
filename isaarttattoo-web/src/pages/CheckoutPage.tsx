import StoreLayout from "../components/StoreLayout";
import CheckoutForm from "../components/CheckoutForm";

export default function CheckoutPage() {
    return (
        <StoreLayout
            title="Checkout"
            description="Confirma tus datos y completa el pedido"
        >
            <CheckoutForm />
        </StoreLayout>
    );
}
