import { Link } from "react-router-dom";
import StoreLayout from "../components/StoreLayout";

const adminSections = [
    {
        title: "Órdenes",
        description: "Gestiona pagos, estados y seguimiento de envíos.",
        href: "/admin/orders",
        badge: "Pedidos",
    },
    {
        title: "Catálogo",
        description: "Administra productos, categorías e inventario.",
        href: "/admin/catalog",
        badge: "Catálogo",
    },
    {
        title: "Identidad",
        description: "Usuarios, roles y permisos del estudio.",
        href: "/admin/identity",
        badge: "Seguridad",
    },
];

export default function AdminDashboard() {
    return (
        <StoreLayout
            title="Panel de administración"
            description="Controla las operaciones del estudio desde un solo lugar."
            tone="light"
        >
            <div className="grid gap-6 text-neutral-900 lg:grid-cols-3">
                {adminSections.map((section) => (
                    <Link
                        key={section.href}
                        to={section.href}
                        className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100"
                    >
                        <div className="flex items-center justify-between">
                            <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
                                {section.badge}
                            </div>
                            <span className="text-lg text-neutral-500 transition group-hover:text-rose-700">→</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-neutral-900">{section.title}</h3>
                            <p className="text-sm text-neutral-600">{section.description}</p>
                        </div>
                        <p className="text-sm font-semibold text-rose-700 group-hover:text-rose-800">
                            Ir a {section.title}
                        </p>
                    </Link>
                ))}
            </div>
        </StoreLayout>
    );
}
