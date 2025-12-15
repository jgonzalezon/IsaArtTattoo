import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
    totalItems?: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
}: PaginationProps) {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 3) {
                pages.push("...");
            }

            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);

            for (let i = startPage; i <= endPage; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }

            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col gap-3 items-center">
            <div className="flex flex-wrap justify-center gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Pagina anterior"
                >
                    Anterior
                </button>

                {pageNumbers.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === "..." ? (
                            <span className="px-2 py-2 text-slate-400">…</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page as number)}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                    currentPage === page
                                        ? "bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/30"
                                        : "border border-white/10 text-white hover:bg-white/10"
                                }`}
                                aria-current={currentPage === page ? "page" : undefined}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Proxima pagina"
                >
                    Siguiente
                </button>
            </div>

            {itemsPerPage && totalItems !== undefined && (
                <p className="text-xs text-slate-400">
                    Pagina {currentPage} de {totalPages} (Mostrando{" "}
                    {Math.min(itemsPerPage, totalItems - (currentPage - 1) * itemsPerPage)} de{" "}
                    {totalItems})
                </p>
            )}
        </div>
    );
}
