import StoreLayout from "../components/StoreLayout";

export default function AdminCatalogPage() {
    return (
        <StoreLayout
            title="Administración de catálogo"
            description="Gestiona productos, categorías y stock desde un solo lugar."
        >
            <div className="space-y-4 text-sm text-slate-200">
                <p>Configura tus productos, imágenes y disponibilidad.</p>
                <p>Integra próximos flujos de carga masiva y control de inventario.</p>
            </div>
        </StoreLayout>
    );
}
