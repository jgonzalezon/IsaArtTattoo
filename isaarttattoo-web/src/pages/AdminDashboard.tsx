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
        >
            <div className="grid gap-6 lg:grid-cols-3">
                {adminSections.map((section) => (
                    <Link
                        key={section.href}
                        to={section.href}
                        className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10"
                    >
                        <div className="flex items-center justify-between">
                            <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                                {section.badge}
                            </div>
                            <span className="text-lg text-white transition group-hover:text-cyan-200">→</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                            <p className="text-sm text-slate-200">{section.description}</p>
                        </div>
                        <p className="text-sm font-semibold text-cyan-200 group-hover:text-cyan-100">
                            Ir a {section.title}
                        </p>
                    </Link>
                ))}
            </div>
        </StoreLayout>
    );
}
