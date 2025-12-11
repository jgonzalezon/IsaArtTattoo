import type { ReactNode } from "react";
import { useCart } from "../context/CartContext";
import HeaderAuthControls from "./auth/HeaderAuthControls";

interface Props {
    title: string;
    description?: string;
    children: ReactNode;
}

export default function StoreLayout({ title, description, children }: Props) {
    const { items } = useCart();
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const currentYear = new Date().getFullYear();

    return (
        <div className="py-10 text-stone-100">
            <header className="mb-10 rounded-3xl border border-rose-900/40 bg-neutral-900/80 p-6 shadow-2xl shadow-rose-900/20">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-900/50 text-lg font-semibold uppercase tracking-wide text-rose-100 shadow-inner shadow-black/40">
                            Isa
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-rose-200">IsaArtTattoo Studio</p>
                            <h1 className="text-3xl font-semibold text-rose-50">{title}</h1>
                            {description && (
                                <p className="text-sm text-stone-200/80">{description}</p>
                            )}
                        </div>
                    </div>
                    <HeaderAuthControls cartCount={totalItems} />
                </div>
            </header>
            <div className="rounded-3xl border border-rose-900/40 bg-neutral-900/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                {children}
            </div>
            <footer className="mt-10 rounded-3xl border border-rose-900/40 bg-neutral-900/90 p-6 text-sm text-stone-200 shadow-inner shadow-black/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-900/60 text-xs font-semibold uppercase tracking-wide text-rose-100">
                            Isa
                        </div>
                        <div>
                            <p className="text-base font-semibold text-rose-100">IsaArtTattoo Studio</p>
                            <p className="text-xs text-stone-300">Diseños artísticos para piel, papel y tela.</p>
                        </div>
                    </div>
                    <div className="grid gap-1 text-right text-xs sm:text-sm">
                        <span className="text-rose-100">Teléfono: +34 600 000 000</span>
                        <span className="text-rose-100">Email: contacto@isasartstudio.com</span>
                        <span className="text-stone-300">© {currentYear} IsaArtTattoo. Todos los derechos reservados.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
