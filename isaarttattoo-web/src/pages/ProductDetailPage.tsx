import StoreLayout from "../components/StoreLayout";
import ProductDetail from "../components/ProductDetail";

export default function ProductDetailPage() {
    return (
        <StoreLayout
            title="Detalle del producto"
            description="Consulta la información de la pieza seleccionada"
        >
            <ProductDetail />
        </StoreLayout>
    );
}
