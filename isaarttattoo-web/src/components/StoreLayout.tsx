import type { ReactNode } from "react";
import { useCart } from "../context/CartContext";
import HeaderAuthControls from "./auth/HeaderAuthControls";

type LayoutTone = "dark" | "light";

interface Props {
    title: string;
    description?: string;
    children: ReactNode;
    tone?: LayoutTone;
}

export default function StoreLayout({ title, description, children, tone = "dark" }: Props) {
    const { items } = useCart();
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const currentYear = new Date().getFullYear();

    const isLight = tone === "light";

    return (
        <div className={`${isLight ? "bg-neutral-50 text-neutral-900" : "text-stone-100"} py-8`}>
            <header
                className={`mb-8 rounded-3xl border ${
                    isLight ? "border-neutral-200 bg-white/95 shadow-lg shadow-blue-100/30" : "border-blue-900/40 bg-neutral-900/80 shadow-2xl shadow-blue-900/20"
                } p-4 md:p-5`}
            >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-base font-semibold uppercase tracking-wide shadow-inner ${
                                isLight
                                    ? "border border-blue-200 bg-blue-50 text-blue-900"
                                    : "bg-blue-900/50 text-blue-100 shadow-black/40"
                            }`}
                        >
                            Isa
                        </div>
                        <div>
                            <p className={`text-[11px] uppercase tracking-[0.3em] ${isLight ? "text-blue-800" : "text-blue-200"}`}>
                                IsaArtTattoo Studio
                            </p>
                            <h1 className={`${isLight ? "text-2xl text-neutral-900" : "text-2xl text-blue-50"} font-semibold md:text-[26px]`}>
                                {title}
                            </h1>
                            {description && (
                                <p className={`${isLight ? "text-neutral-700" : "text-stone-200/80"} text-sm`}>{description}</p>
                            )}
                        </div>
                    </div>
                    <HeaderAuthControls cartCount={totalItems} tone={tone} />
                </div>
            </header>
            <div
                className={`rounded-3xl border ${
                    isLight
                        ? "border-neutral-200 bg-white shadow-[0_16px_60px_rgba(0,0,0,0.08)]"
                        : "border-blue-900/40 bg-neutral-900/70 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
                } p-6`}
            >
                {children}
            </div>
            <footer
                className={`mt-8 rounded-3xl border ${
                    isLight
                        ? "border-neutral-200 bg-neutral-100 text-neutral-700 shadow-inner shadow-black/5"
                        : "border-blue-900/40 bg-neutral-900/90 text-sm text-stone-200 shadow-inner shadow-black/40"
                } p-5 text-sm`}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold uppercase tracking-wide ${
                                isLight
                                    ? "border border-blue-200 bg-blue-50 text-blue-800"
                                    : "bg-blue-900/60 text-blue-100"
                            }`}
                        >
                            Isa
                        </div>
                        <div className={isLight ? "text-neutral-900" : "text-stone-100"}>
                            <p className={`text-base font-semibold ${isLight ? "text-blue-900" : "text-blue-100"}`}>
                                IsaArtTattoo Studio
                            </p>
                            <p className={`text-xs ${isLight ? "text-neutral-600" : "text-stone-300"}`}>
                                Diseños artísticos para piel, papel y tela.
                            </p>
                        </div>
                    </div>
                    <div className={`grid gap-1 text-right text-xs sm:text-sm ${isLight ? "text-neutral-700" : "text-stone-200"}`}>
                        <span className={isLight ? "text-blue-800" : "text-blue-100"}>Teléfono: +34 600 000 000</span>
                        <span className={isLight ? "text-blue-800" : "text-blue-100"}>Email: contacto@isasartstudio.com</span>
                        <span className={isLight ? "text-neutral-600" : "text-stone-300"}>
                            © {currentYear} IsaArtTattoo. Todos los derechos reservados.
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
