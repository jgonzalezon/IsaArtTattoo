import type { ReactNode } from "react";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo-isasart.svg";
import HeaderAuthControls from "./auth/HeaderAuthControls";

interface Props {
    title: string;
    description?: string;
    children: ReactNode;
}

export default function StoreLayout({ title, description, children }: Props) {
    const { items } = useCart();

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="py-10">
            <header className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="IsaArtTattoo" className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 p-1" />
                    <div>
                        <p className="text-xs uppercase tracking-wide text-cyan-300">IsaArtTattoo</p>
                        <h1 className="text-2xl font-semibold text-white">{title}</h1>
                        {description && (
                            <p className="text-sm text-slate-300">{description}</p>
                        )}
                    </div>
                </div>
                <HeaderAuthControls cartCount={totalItems} />
            </header>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
                {children}
            </div>
        </div>
    );
}
