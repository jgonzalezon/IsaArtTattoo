import { useEffect, useState } from "react";
import AuthCard from "./components/AuthCard";

export default function App() {
    const [apiBase, setApiBase] = useState<string>(
        import.meta.env.VITE_API_BASE_URL ?? ""
    );

    useEffect(() => {
        // fallback para dev con proxy de Vite
        if (!apiBase) setApiBase("");
    }, [apiBase]);

    return (
        <div className="relative min-h-dvh overflow-hidden bg-slate-950 text-slate-100">
            {/* gradient animado */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(56,189,248,.25),rgba(2,6,23,0))]"></div>
            <div className="absolute -top-1/3 left-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 rounded-full bg-gradient-to-tr from-fuchsia-500/30 via-cyan-400/30 to-indigo-400/30 blur-3xl animate-pulse"></div>

            <div className="relative z-10 mx-auto grid min-h-dvh max-w-7xl place-items-center px-4">
                <div className="w-full max-w-md">
                    <AuthCard apiBase={apiBase} />
                    <p className="mt-6 text-center text-sm text-slate-400">
                        API base: <code className="text-slate-300">{apiBase || "/api"}</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
