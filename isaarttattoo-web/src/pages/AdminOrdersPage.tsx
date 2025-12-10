import StoreLayout from "../components/StoreLayout";

export default function AdminOrdersPage() {
    return (
        <StoreLayout title="Gestión de órdenes" description="Revisa pagos, estados y entregas.">
            <div className="space-y-4 text-sm text-slate-200">
                <p>Esta sección mostrará el listado de órdenes y sus estados.</p>
                <p>Próximamente podrás actualizar estados, procesar reembolsos y revisar incidencias.</p>
            </div>
        </StoreLayout>
    );
}
