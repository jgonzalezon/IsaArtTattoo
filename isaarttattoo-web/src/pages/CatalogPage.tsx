import StoreLayout from "../components/StoreLayout";
import ProductList from "../components/ProductList";

export default function CatalogPage() {
    return (
        <StoreLayout
            title="Catálogo"
            description="Explora las nuevas piezas disponibles para tu próxima cita"
        >
            <ProductList />
        </StoreLayout>
    );
}
